import { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { supabase, getCurrentSocietyId, toPayment, toSociety } from './lib/supabase';
import { availableMonths } from './data/sampleData';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import MonthSelector from './components/MonthSelector';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentLogin from './pages/ResidentLogin';
import ResidentPortal from './pages/ResidentPortal';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Payments from './pages/Payments';
import WhatsAppReminders from './pages/WhatsApp';
import Expenses from './pages/Expenses';
import Receipts from './pages/Receipts';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';

const sectionTitles = {
  dashboard: 'Dashboard', members: 'Members', payments: 'Payments',
  whatsapp: 'WhatsApp Reminders', expenses: 'Expenses',
  receipts: 'Receipts', announcements: 'Announcements', settings: 'Settings',
};
const monthAwarePages = ['dashboard', 'payments', 'whatsapp', 'expenses', 'receipts'];

export default function App() {
  // Persist login across page refresh
  const [isLoggedIn, setIsLoggedIn]       = useState(() => localStorage.getItem('is_logged_in') === 'true');
  const [authPage, setAuthPage]           = useState('login');
  const [residentFlat, setResidentFlat]   = useState(() => localStorage.getItem('resident_flat') || null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenu]   = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0]);
  const [toast, setToast]                 = useState(null);
  const [loading, setLoading]             = useState(true);

  // Data from Supabase
  const [society, setSociety]             = useState(null);
  const [members, setMembers]             = useState([]);
  const [payments, setPayments]           = useState([]);
  const [expenses, setExpenses]           = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [dbError, setDbError] = useState(null);

  // ── Load all data from Supabase ──────────────────────────
  const loadAll = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const [s, m, p, e, a] = await Promise.all([
        supabase.from('societies').select('*').eq('id', getCurrentSocietyId()).single(),
        supabase.from('members').select('*').eq('society_id', getCurrentSocietyId()).order('flat'),
        supabase.from('payments').select('*').eq('society_id', getCurrentSocietyId()),
        supabase.from('expenses').select('*').eq('society_id', getCurrentSocietyId()),
        supabase.from('announcements').select('*').eq('society_id', getCurrentSocietyId()).order('created_at', { ascending: false }),
      ]);
      if (s.error) { setDbError(`DB Error: ${s.error.message}`); setLoading(false); return; }
      if (s.data) setSociety(toSociety(s.data));
      if (m.data) setMembers(m.data);
      if (p.data) setPayments(p.data.map(toPayment));
      if (e.data) setExpenses(e.data.map(ex => ({ ...ex, amount: Number(ex.amount) })));
      if (a.data) setAnnouncements(a.data);
    } catch (err) {
      setDbError(`Connection failed: ${err.message}`);
    }
    setLoading(false);
  };

  // Reload data when admin OR resident logs in (picks up correct society ID)
  useEffect(() => {
    if (isLoggedIn) loadAll();
  }, [isLoggedIn]);

  useEffect(() => {
    if (residentFlat) loadAll();
  }, [residentFlat]);

  // Initial load (needed for member list on login/resident page)
  useEffect(() => {
    loadAll();

    // Supabase Realtime — payments sync across ALL tabs automatically
    const channel = supabase
      .channel('payments_sync')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'payments' },
        (payload) => setPayments(prev => prev.map(p => p.id === payload.new.id ? toPayment(payload.new) : p))
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payments' },
        (payload) => setPayments(prev => prev.some(p => p.id === payload.new.id) ? prev : [...prev, toPayment(payload.new)])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ── Auto-populate unpaid records when switching month ────
  useEffect(() => {
    if (!members.length || !society) return;
    const existingFlats = new Set(payments.filter(p => p.month === selectedMonth).map(p => p.flat));
    const missing = members.filter(m => !existingFlats.has(m.flat));
    if (missing.length === 0) return;

    const records = missing.map(m => ({
      society_id: getCurrentSocietyId(),
      flat: m.flat, name: m.name, month: selectedMonth,
      amount: society.maintenanceAmount, status: 'Unpaid',
      mode: '-', date: null, receipt_no: null,
    }));

    supabase.from('payments')
      .upsert(records, { onConflict: 'society_id,flat,month', ignoreDuplicates: true })
      .select()
      .then(({ data }) => {
        if (data?.length > 0) {
          setPayments(prev => {
            const ids = new Set(prev.map(p => p.id));
            return [...prev, ...data.filter(p => !ids.has(p.id)).map(toPayment)];
          });
        }
      });
  }, [selectedMonth, members, society?.maintenanceAmount]);

  // ── Update current month unpaid amounts when price changes
  useEffect(() => {
    if (!society) return;
    const currentMonth = availableMonths[0];
    setPayments(prev => prev.map(p => {
      if (p.status !== 'Unpaid') return p;
      const idx = availableMonths.indexOf(p.month);
      if (idx !== 0 && idx !== -1) return p;
      return { ...p, amount: society.maintenanceAmount };
    }));
    supabase.from('payments')
      .update({ amount: society.maintenanceAmount })
      .eq('society_id', getCurrentSocietyId()).eq('month', currentMonth).eq('status', 'Unpaid');
  }, [society?.maintenanceAmount]);

  // ── Toast ────────────────────────────────────────────────
  const showToast = (message, type = 'success', action = null) => {
    setToast({ message, type, action });
    setTimeout(() => setToast(null), action ? 6000 : 3500);
  };

  // ── Write operations ─────────────────────────────────────
  const markAsPaid = async (paymentId, mode = 'UPI') => {
    const payment = payments.find(p => p.id === paymentId);
    const date      = new Date().toISOString().split('T')[0];
    const receiptNo = `RCP-${payment.month.replace(' ', '')}-${String(Date.now()).slice(-4)}`;
    // Optimistic
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Paid', mode, date, receiptNo } : p));
    await supabase.from('payments').update({ status: 'Paid', mode, date, receipt_no: receiptNo }).eq('id', paymentId);
    showToast(
      `${payment.name} (Flat ${payment.flat}) marked as paid via ${mode}.`,
      'success',
      { label: 'Undo', onClick: () => revertPayment(paymentId, payment) }
    );
  };

  const revertPayment = async (paymentId, snapshot) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Unpaid', mode: '-', date: null, receiptNo: null } : p));
    await supabase.from('payments').update({ status: 'Unpaid', mode: '-', date: null, receipt_no: null }).eq('id', paymentId);
    showToast('Payment reverted to unpaid.', 'warning');
  };

  const markAllDuesPaid = async (flat, mode = 'UPI') => {
    const unpaid = payments.filter(p => p.flat === flat && p.status === 'Unpaid');
    if (unpaid.length === 0) return;
    const snapshots = unpaid.map(p => ({ ...p }));
    const date = new Date().toISOString().split('T')[0];
    setPayments(prev => prev.map(p => {
      if (p.flat !== flat || p.status !== 'Unpaid') return p;
      return { ...p, status: 'Paid', mode, date, receiptNo: `RCP-${p.month.replace(' ', '')}-${String(Date.now()).slice(-4)}` };
    }));
    for (const p of unpaid) {
      await supabase.from('payments').update({
        status: 'Paid', mode, date,
        receipt_no: `RCP-${p.month.replace(' ', '')}-${String(Date.now()).slice(-4)}`,
      }).eq('id', p.id);
    }
    showToast(
      `All ${unpaid.length} months cleared for ${unpaid[0].name} (Flat ${flat}) via ${mode}.`,
      'success',
      { label: 'Undo All', onClick: async () => {
        setPayments(prev => prev.map(p => { const o = snapshots.find(s => s.id === p.id); return o ? { ...p, ...o } : p; }));
        for (const p of snapshots) {
          await supabase.from('payments').update({ status: 'Unpaid', mode: '-', date: null, receipt_no: null }).eq('id', p.id);
        }
        showToast('All payments reverted to unpaid.', 'warning');
      }}
    );
  };

  const markAsPaidByResident = async (paymentId) => {
    const payment   = payments.find(p => p.id === paymentId);
    const date      = new Date().toISOString().split('T')[0];
    const receiptNo = `RCP-${payment.month.replace(' ', '')}-${String(Date.now()).slice(-4)}`;
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Paid', mode: 'Online (UPI)', date, receiptNo } : p));
    // Supabase Realtime will push this update to admin panel automatically
    await supabase.from('payments').update({ status: 'Paid', mode: 'Online (UPI)', date, receipt_no: receiptNo }).eq('id', paymentId);
  };

  const addMember = async (member) => {
    const { data } = await supabase.from('members').insert({
      society_id: getCurrentSocietyId(), flat: member.flat, name: member.name,
      phone: member.phone, type: member.type,
      join_date: new Date().toISOString().split('T')[0],
    }).select().single();
    if (data) { setMembers(prev => [...prev, data]); showToast('New member added successfully!', 'success'); }
  };

  const updateMember = async (id, updates) => {
    const { data } = await supabase.from('members')
      .update({ flat: updates.flat, name: updates.name, phone: updates.phone, type: updates.type })
      .eq('id', id).select().single();
    if (data) {
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
      showToast('Member updated successfully!', 'success');
    }
  };

  const deleteMember = async (id) => {
    await supabase.from('members').delete().eq('id', id);
    setMembers(prev => prev.filter(m => m.id !== id));
    showToast('Member removed.', 'warning');
  };

  const addExpense = async (expense) => {
    const { data } = await supabase.from('expenses').insert({
      society_id: getCurrentSocietyId(), month: selectedMonth,
      date: expense.date, category: expense.category,
      description: expense.description, amount: expense.amount,
    }).select().single();
    if (data) { setExpenses(prev => [...prev, { ...data, amount: Number(data.amount) }]); showToast('Expense recorded successfully!', 'success'); }
  };

  const addAnnouncement = async (ann) => {
    const { data } = await supabase.from('announcements').insert({
      society_id: getCurrentSocietyId(), title: ann.title, message: ann.message,
      priority: ann.priority, date: new Date().toISOString().split('T')[0],
    }).select().single();
    if (data) { setAnnouncements(prev => [data, ...prev]); showToast('Announcement posted!', 'success'); }
  };

  const saveSociety = async (newData) => {
    setSociety(newData);
    await supabase.from('societies').update({
      name: newData.name, location: newData.location, address: newData.address,
      total_flats: newData.totalFlats, maintenance_amount: newData.maintenanceAmount,
      upi_id: newData.upiId, secretary_name: newData.secretary, secretary_phone: newData.phone,
    }).eq('id', getCurrentSocietyId());
    showToast('Settings saved successfully!', 'success');
  };

  // ── Stats ────────────────────────────────────────────────
  const monthPayments = payments.filter(p => p.month === selectedMonth);
  const monthExpenses = expenses.filter(e => e.month === selectedMonth);
  const stats = {
    totalMembers:  society?.totalFlats ?? 0,
    collected:     monthPayments.filter(p => p.status === 'Paid').length * (society?.maintenanceAmount ?? 0),
    pending:       monthPayments.filter(p => p.status === 'Unpaid').length * (society?.maintenanceAmount ?? 0),
    totalExpenses: monthExpenses.reduce((s, e) => s + e.amount, 0),
    get netBalance() { return this.collected - this.totalExpenses; },
  };

  // ── Loading screen ───────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
          <svg className="animate-spin w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">Loading society data...</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-6">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-slate-800 font-bold text-lg">Connection Error</p>
        <p className="text-red-600 text-sm text-center max-w-md bg-red-50 p-4 rounded-xl font-mono">{dbError}</p>
        <button onClick={loadAll} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          Retry
        </button>
      </div>
    );
  }

  // ── Resident portal ──────────────────────────────────────
  if (residentFlat) {
    return (
      <ResidentPortal
        flat={residentFlat} payments={payments} members={members}
        announcements={announcements} societyInfo={society}
        onPaymentSuccess={markAsPaidByResident}
        onLogout={() => { setResidentFlat(null); localStorage.removeItem('resident_flat'); setAuthPage('login'); }}
      />
    );
  }

  // ── Auth screens ─────────────────────────────────────────
  if (!isLoggedIn) {
    if (authPage === 'register') {
      return <Register onRegister={() => { localStorage.setItem('is_logged_in', 'true'); setIsLoggedIn(true); setAuthPage('login'); }} onBackToLogin={() => setAuthPage('login')} />;
    }
    return (
      <Login
        onAdminLogin={() => { localStorage.setItem('is_logged_in', 'true'); setIsLoggedIn(true); }}
        onResidentLogin={(flat) => { localStorage.setItem('resident_flat', flat); setResidentFlat(flat); }}
        onRegister={() => setAuthPage('register')}
        members={members}
      />
    );
  }

  // ── Main app ─────────────────────────────────────────────
  const common = { showToast, societyInfo: society, selectedMonth };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':     return <Dashboard stats={stats} payments={payments} setActiveSection={setActiveSection} {...common} />;
      case 'members':       return <Members members={members} addMember={addMember} updateMember={updateMember} deleteMember={deleteMember} showToast={showToast} societyInfo={society} />;
      case 'payments':      return <Payments payments={payments} markAsPaid={markAsPaid} revertPayment={revertPayment} markAllDuesPaid={markAllDuesPaid} {...common} />;
      case 'whatsapp':      return <WhatsAppReminders payments={payments} members={members} societyInfo={society} showToast={showToast} selectedMonth={selectedMonth} />;
      case 'expenses':      return <Expenses expenses={expenses} addExpense={addExpense} {...common} />;
      case 'receipts':      return <Receipts payments={payments} societyInfo={society} selectedMonth={selectedMonth} />;
      case 'announcements': return <Announcements announcements={announcements} addAnnouncement={addAnnouncement} showToast={showToast} societyInfo={society} />;
      case 'settings':      return <Settings societyInfo={society} onSave={saveSociety} showToast={showToast} />;
      default: return null;
    }
  };

  const showMonthSelector = monthAwarePages.includes(activeSection);
  const isPastMonth = selectedMonth !== availableMonths[0];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setMobileMenu(false)} />}

      <Sidebar
        activeSection={activeSection}
        setActiveSection={(s) => { setActiveSection(s); setMobileMenu(false); }}
        societyInfo={society} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenu}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMobileMenu(true)}>
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-800 leading-tight truncate">{sectionTitles[activeSection]}</h2>
              <p className="text-xs text-slate-500 leading-tight truncate">{society?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {showMonthSelector && <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />}
            <div className="hidden sm:flex items-center gap-2 border border-slate-200 rounded-full pl-2 pr-3 py-1.5 bg-slate-50">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <span className="text-xs font-medium text-slate-700">Admin</span>
            </div>
            <button
              onClick={() => { localStorage.removeItem('is_logged_in'); setIsLoggedIn(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {isPastMonth && showMonthSelector && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 lg:px-6 py-2 flex items-center justify-between">
            <p className="text-xs text-amber-700 font-medium">Viewing historical data for <strong>{selectedMonth}</strong> — read-only mode</p>
            <button onClick={() => setSelectedMonth(availableMonths[0])} className="text-xs text-amber-700 underline hover:no-underline font-medium">Return to current month</button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{renderContent()}</main>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} action={toast.action} onClose={() => setToast(null)} />}
    </div>
  );
}
