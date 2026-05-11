import { useState } from 'react';
import {
  Building2, LayoutDashboard, CreditCard, Bell,
  LogOut, CheckCircle, Clock, Download, X,
  Phone, AlertTriangle, Printer, Shield,
  Smartphone, Landmark, Wallet, ArrowRight
} from 'lucide-react';

// ── Payment Modal ────────────────────────────────────────────
function PaymentModal({ payment, societyInfo, onSuccess, onClose }) {
  const [step, setStep]         = useState('method'); // method | processing | success
  const [method, setMethod]     = useState('upi');
  const [upiId, setUpiId]       = useState('');
  const [card, setCard]         = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [bank, setBank]         = useState('');
  const [txnId]                 = useState(`pay_${Math.random().toString(36).slice(2,12).toUpperCase()}`);

  const methods = [
    { id: 'upi',        label: 'UPI',          icon: Smartphone },
    { id: 'card',       label: 'Card',          icon: CreditCard },
    { id: 'netbanking', label: 'Net Banking',   icon: Landmark },
    { id: 'wallet',     label: 'Wallet',        icon: Wallet },
  ];

  const banks = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'];
  const upiApps = [
    { name: 'PhonePe', color: 'bg-purple-100 text-purple-700', emoji: '📱' },
    { name: 'GPay',    color: 'bg-blue-100 text-blue-700',     emoji: '💳' },
    { name: 'Paytm',   color: 'bg-sky-100 text-sky-700',       emoji: '💰' },
    { name: 'BHIM',    color: 'bg-orange-100 text-orange-700', emoji: '🇮🇳' },
  ];

  const isPayable = () => {
    if (method === 'upi')        return upiId.trim().length > 3;
    if (method === 'card')       return card.number.length >= 16 && card.expiry && card.cvv && card.name;
    if (method === 'netbanking') return bank !== '';
    if (method === 'wallet')     return true;
    return false;
  };

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      onSuccess(payment.id);
    }, 2200);
  };

  const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    return v.length >= 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight">{societyInfo.name}</p>
              <p className="text-slate-400 text-xs">Maintenance · {payment.month}</p>
            </div>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Amount strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">Amount to pay</span>
          <span className="text-xl font-black text-slate-800">₹{payment.amount.toLocaleString('en-IN')}</span>
        </div>

        {/* ── STEP: Method Selection ── */}
        {step === 'method' && (
          <div className="p-5 space-y-4">
            {/* Method tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 rounded-xl p-1">
              {methods.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-medium transition-all
                    ${method === id ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* UPI */}
            {method === 'upi' && (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {upiApps.map(app => (
                    <button
                      key={app.name}
                      onClick={() => setUpiId(`user@${app.name.toLowerCase()}`)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs font-medium
                        ${upiId.includes(app.name.toLowerCase()) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <span className="text-lg">{app.emoji}</span>
                      <span className="text-slate-600">{app.name}</span>
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g. name@upi)"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-400 text-center">
                  You will receive a payment request on your UPI app
                </p>
              </div>
            )}

            {/* Card */}
            {method === 'card' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={card.number}
                  onChange={e => setCard(p => ({ ...p, number: formatCard(e.target.value) }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest"
                  maxLength={19}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    value={card.cvv}
                    onChange={e => setCard(p => ({ ...p, cvv: e.target.value.slice(0,4) }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength={4}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Name on Card"
                  value={card.name}
                  onChange={e => setCard(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Net Banking */}
            {method === 'netbanking' && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 mb-2">Select your bank</p>
                <div className="grid grid-cols-2 gap-2">
                  {banks.map(b => (
                    <button
                      key={b}
                      onClick={() => setBank(b)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border-2 transition-all text-left
                        ${bank === b ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wallet */}
            {method === 'wallet' && (
              <div className="space-y-2">
                {['Paytm Wallet', 'Amazon Pay', 'Mobikwik', 'Freecharge'].map(w => (
                  <button key={w} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm font-medium text-slate-700">
                    <Wallet className="w-4 h-4 text-slate-400" />
                    {w}
                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={!isPayable()}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Pay ₹{payment.amount.toLocaleString('en-IN')}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Shield className="w-3 h-3" />
              <span>256-bit SSL encrypted · Secured by Razorpay</span>
            </div>
          </div>
        )}

        {/* ── STEP: Processing ── */}
        {step === 'processing' && (
          <div className="p-10 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 border-4 border-indigo-100 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Processing Payment</p>
              <p className="text-sm text-slate-500 mt-1">Please do not close this window...</p>
            </div>
            <div className="space-y-1.5 text-left bg-slate-50 rounded-xl p-4">
              {['Connecting to bank...', 'Verifying payment details...', 'Confirming transaction...'].map((msg, i) => (
                <div key={msg} className="flex items-center gap-2 text-xs text-slate-500">
                  <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: Success ── */}
        {step === 'success' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-800">Payment Successful!</p>
              <p className="text-sm text-slate-500 mt-1">
                ₹{payment.amount.toLocaleString('en-IN')} paid for {payment.month}
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono text-xs font-semibold text-slate-700">{txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-emerald-700">₹{payment.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Month</span>
                <span className="font-semibold text-slate-700">{payment.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-semibold text-slate-700">{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
              <p className="text-xs text-indigo-700 font-medium">
                Admin panel updated automatically — no manual entry needed
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Receipt Modal ─────────────────────────────────────────────
function ReceiptModal({ payment, societyInfo, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Payment Receipt</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-black text-slate-800">{societyInfo.name}</h2>
            <p className="text-xs text-slate-500">{societyInfo.address}</p>
          </div>
          <div className="border-t-2 border-dashed border-slate-200 mb-4" />
          <div className="flex justify-center mb-4">
            <div className="border-4 border-emerald-500 rounded-xl px-6 py-1.5 rotate-[-6deg]">
              <p className="text-2xl font-black text-emerald-600 tracking-widest">PAID</p>
            </div>
          </div>
          <div className="space-y-2.5 bg-slate-50 rounded-xl p-4 text-sm">
            {[
              ['Receipt No.',  payment.receiptNo, true],
              ['Flat Number',  `Flat ${payment.flat}`],
              ['Owner Name',   payment.name],
              ['Month',        payment.month],
              ['Amount',       `₹${payment.amount.toLocaleString('en-IN')}`, false, true],
              ['Payment Mode', payment.mode],
              ['Date',         payment.date],
            ].map(([label, value, mono, green]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-slate-500">{label}</span>
                <span className={`font-semibold ${mono ? 'font-mono text-xs' : ''} ${green ? 'text-emerald-700 text-base font-bold' : 'text-slate-800'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-dashed border-slate-200 mt-4 pt-3 text-center">
            <p className="text-xs text-slate-500">Thank you for your timely payment!</p>
          </div>
        </div>
        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Resident Portal ───────────────────────────────────────────
const navItems = [
  { id: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { id: 'payments',      label: 'My Payments',   icon: CreditCard },
  { id: 'announcements', label: 'Announcements', icon: Bell },
];

export default function ResidentPortal({ flat, payments, members = [], announcements, societyInfo, onPaymentSuccess, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [payingPayment, setPayingPayment]   = useState(null);

  // Resolve name from members list — works with any flat naming (L3, M4, B-102, 101...)
  const memberObj  = members.find(m => m.flat === flat);
  const memberName = memberObj?.name || `Flat ${flat} Resident`;
  const myPayments  = payments.filter(p => p.flat === flat).sort((a, b) => {
    const order = ['Jun 2026','May 2026','Apr 2026','Mar 2026','Feb 2026'];
    return order.indexOf(a.month) - order.indexOf(b.month);
  });
  const myPaid      = myPayments.filter(p => p.status === 'Paid');
  const myUnpaid    = myPayments.filter(p => p.status === 'Unpaid');
  const totalPaid   = myPaid.reduce((s, p) => s + p.amount, 0);
  const totalDue    = myUnpaid.reduce((s, p) => s + p.amount, 0);

  const handlePaymentSuccess = (paymentId) => {
    onPaymentSuccess(paymentId);
    // Keep modal open for success screen — close handled by user clicking Done
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-emerald-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">{societyInfo.name}</p>
            <p className="text-xs text-teal-600 font-medium leading-tight">Flat {flat} · {memberName}</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors">
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-4 lg:px-8">
        <div className="flex gap-1 max-w-2xl">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeSection === id ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'payments' && myUnpaid.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {myUnpaid.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 px-4 lg:px-8 py-6 max-w-3xl w-full mx-auto space-y-5">

        {/* ── OVERVIEW ── */}
        {activeSection === 'overview' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-800">Hello, {memberName.split(' ')[0]} 👋</h2>
              <p className="text-slate-500 text-sm mt-0.5">Here's your society account summary</p>
            </div>

            {/* Due card */}
            {myUnpaid.length > 0 ? (
              <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Total Due</p>
                    <p className="text-3xl font-black mt-1">₹{totalDue.toLocaleString('en-IN')}</p>
                    <p className="text-red-100 text-sm mt-1">
                      {myUnpaid.length} month{myUnpaid.length > 1 ? 's' : ''} pending: {myUnpaid.map(p => p.month).join(', ')}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-200 flex-shrink-0" />
                </div>
                {/* Pay now buttons for each unpaid month */}
                <div className="space-y-2">
                  {myUnpaid.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPayingPayment(p)}
                      className="w-full flex items-center justify-between bg-white/20 hover:bg-white/30 rounded-xl px-4 py-3 transition-colors"
                    >
                      <div className="text-left">
                        <p className="text-white font-semibold text-sm">{p.month}</p>
                        <p className="text-red-100 text-xs">₹{p.amount.toLocaleString('en-IN')} due</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white text-red-600 rounded-lg px-3 py-1.5 text-xs font-bold">
                        Pay Now <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-teal-100 text-sm">All payments up to date!</p>
                  <p className="text-xl font-bold mt-0.5">No dues pending</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                <p className="text-lg font-bold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Paid</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                <p className="text-lg font-bold text-slate-800">{myPaid.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Months Paid</p>
              </div>
              <div className={`rounded-xl p-4 shadow-sm border text-center ${myUnpaid.length > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
                <p className={`text-lg font-bold ${myUnpaid.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{myUnpaid.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Months Due</p>
              </div>
            </div>

            {/* Recent */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Recent Activity</h3>
                <button onClick={() => setActiveSection('payments')} className="text-xs text-teal-600 hover:underline font-medium">View all</button>
              </div>
              <div className="divide-y divide-slate-50">
                {myPayments.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${p.status === 'Paid' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {p.status === 'Paid' ? <CheckCircle className="w-4.5 h-4.5 text-emerald-600" size={18} /> : <Clock className="w-4.5 h-4.5 text-red-500" size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{p.month}</p>
                      <p className="text-xs text-slate-500">{p.status === 'Paid' ? `${p.mode} · ${p.date}` : 'Pending'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${p.status === 'Paid' ? 'text-emerald-600' : 'text-red-600'}`}>₹{p.amount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Contact Secretary</p>
                <p className="text-xs text-slate-500">{societyInfo.secretary} · {societyInfo.phone}</p>
              </div>
              <a href={`tel:${societyInfo.phone}`} className="px-3 py-2 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-colors">Call</a>
            </div>
          </div>
        )}

        {/* ── MY PAYMENTS ── */}
        {activeSection === 'payments' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-800">My Payments</h2>
              <p className="text-slate-500 text-sm mt-0.5">Flat {flat} · Complete history</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-emerald-700">₹{totalPaid.toLocaleString('en-IN')}</p>
                <p className="text-xs text-emerald-600 mt-0.5">Total Paid</p>
              </div>
              <div className={`border rounded-xl p-4 text-center ${myUnpaid.length > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-xl font-bold ${myUnpaid.length > 0 ? 'text-red-700' : 'text-slate-400'}`}>₹{totalDue.toLocaleString('en-IN')}</p>
                <p className={`text-xs mt-0.5 ${myUnpaid.length > 0 ? 'text-red-600' : 'text-slate-400'}`}>Total Due</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-50">
                {myPayments.map(p => (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${p.status === 'Paid' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {p.status === 'Paid' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{p.month}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.status === 'Paid' ? `${p.mode} · ${p.date}` : 'Pending payment'}</p>
                    </div>
                    <div className="text-right mr-2 flex-shrink-0">
                      <p className={`text-sm font-bold ${p.status === 'Paid' ? 'text-emerald-600' : 'text-red-600'}`}>₹{p.amount.toLocaleString('en-IN')}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {p.status}
                      </span>
                    </div>
                    {p.status === 'Paid' ? (
                      <button onClick={() => setReceiptPayment(p)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap flex-shrink-0">
                        <Download className="w-3.5 h-3.5" /> Receipt
                      </button>
                    ) : (
                      <button onClick={() => setPayingPayment(p)} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap flex-shrink-0">
                        Pay Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENTS ── */}
        {activeSection === 'announcements' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-800">Announcements</h2>
              <p className="text-slate-500 text-sm mt-0.5">Notices from society management</p>
            </div>
            {announcements.map(ann => {
              const cfg = {
                High:   { bg: 'bg-red-50',   border: 'border-red-200',   badge: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
                Medium: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700',dot: 'bg-amber-500' },
                Low:    { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-600',dot: 'bg-slate-400' },
              }[ann.priority] || {};
              return (
                <div key={ann.id} className={`${cfg.bg} border ${cfg.border} rounded-xl p-5`}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold text-slate-800">{ann.title}</h4>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {ann.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{ann.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{ann.date}</p>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      {payingPayment && (
        <PaymentModal
          payment={payingPayment}
          societyInfo={societyInfo}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPayingPayment(null)}
        />
      )}
      {receiptPayment && (
        <ReceiptModal
          payment={receiptPayment}
          societyInfo={societyInfo}
          onClose={() => setReceiptPayment(null)}
        />
      )}
    </div>
  );
}
