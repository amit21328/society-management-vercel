import { MessageCircle, Send, Phone, Home, AlertCircle, CheckCircle, Users, Sparkles, AlertTriangle, IndianRupee } from 'lucide-react';
import { availableMonths } from '../data/sampleData';

function buildWhatsAppUrl(phone, name, flatNo, month, amount, upiId) {
  const message = `Dear ${name}, Your maintenance fee of ₹${amount} for ${month} is due for Flat ${flatNo}, Sunrise Apartments. Please pay via UPI: ${upiId}. Contact secretary for any queries.`;
  const encoded = encodeURIComponent(message);
  const cleaned = phone.replace(/\D/g, '');
  const intlPhone = cleaned.length === 10 ? `91${cleaned}` : cleaned;
  return `https://wa.me/${intlPhone}?text=${encoded}`;
}

function buildDefaulterWhatsAppUrl(phone, name, flatNo, unpaidMonths, totalDue, upiId) {
  const monthList = unpaidMonths.map(m => `• ${m}: ₹1,500 (Unpaid)`).join('\n');
  const message = `Dear ${name}, This is an urgent reminder regarding your OVERDUE maintenance fees for Flat ${flatNo}, Sunrise Apartments.\n\nPending dues:\n${monthList}\n\nTotal Due: ₹${totalDue.toLocaleString('en-IN')}\n\nPlease clear all dues immediately to avoid further action.\nPay via UPI: ${upiId}\nContact secretary for any queries.`;
  const encoded = encodeURIComponent(message);
  const cleaned = phone.replace(/\D/g, '');
  const intlPhone = cleaned.length === 10 ? `91${cleaned}` : cleaned;
  return `https://wa.me/${intlPhone}?text=${encoded}`;
}

// memberPhones is now built dynamically from members prop — supports any flat naming

export default function WhatsAppReminders({ payments, members = [], societyInfo, showToast, selectedMonth }) {
  // Build phone lookup from members list — works with any flat naming (101, L3, M4, B-102...)
  const memberPhones = Object.fromEntries(members.map(m => [m.flat, m.phone]));
  const monthPayments = payments.filter(p => p.month === selectedMonth);
  const unpaid  = monthPayments.filter(p => p.status === 'Unpaid');
  const paid    = monthPayments.filter(p => p.status === 'Paid');
  const total   = monthPayments.length;
  const isCurrentMonth = selectedMonth === availableMonths[0];

  // Defaulters: unpaid in any month BEFORE the selected month
  const selectedIdx   = availableMonths.indexOf(selectedMonth);
  const previousMonths = availableMonths.slice(selectedIdx + 1);

  const defaulterMap = payments
    .filter(p => previousMonths.includes(p.month) && p.status === 'Unpaid')
    .reduce((acc, p) => {
      if (!acc[p.flat]) {
        acc[p.flat] = { flat: p.flat, name: p.name, unpaidMonths: [], totalDue: 0 };
      }
      acc[p.flat].unpaidMonths.push(p.month);
      acc[p.flat].totalDue += p.amount;
      return acc;
    }, {});

  const defaulters = Object.values(defaulterMap).sort((a, b) =>
    b.unpaidMonths.length - a.unpaidMonths.length
  );

  const sendReminder = (p) => {
    const phone = memberPhones[p.flat] || '9999999999';
    const url = buildWhatsAppUrl(phone, p.name, p.flat, p.month, p.amount, societyInfo.upiId);
    window.open(url, '_blank');
    showToast(`Reminder sent to ${p.name} (Flat ${p.flat})`, 'success');
  };

  const sendDefaulterReminder = (d) => {
    const phone = memberPhones[d.flat] || '9999999999';
    const url = buildDefaulterWhatsAppUrl(phone, d.name, d.flat, d.unpaidMonths, d.totalDue, societyInfo.upiId);
    window.open(url, '_blank');
    showToast(`Defaulter reminder sent to ${d.name} (Flat ${d.flat})`, 'success');
  };

  const sendAll = () => {
    if (unpaid.length === 0) { showToast('No pending members for this month!', 'warning'); return; }
    unpaid.forEach((p, i) => {
      setTimeout(() => {
        const phone = memberPhones[p.flat] || '9999999999';
        window.open(buildWhatsAppUrl(phone, p.name, p.flat, p.month, p.amount, societyInfo.upiId), '_blank');
      }, i * 400);
    });
    showToast(`Opening WhatsApp for ${unpaid.length} pending members...`, 'success');
  };

  const sendAllDefaulters = () => {
    if (defaulters.length === 0) { showToast('No defaulters found!', 'warning'); return; }
    defaulters.forEach((d, i) => {
      setTimeout(() => {
        const phone = memberPhones[d.flat] || '9999999999';
        window.open(buildDefaulterWhatsAppUrl(phone, d.name, d.flat, d.unpaidMonths, d.totalDue, societyInfo.upiId), '_blank');
      }, i * 500);
    });
    showToast(`Sending urgent reminders to ${defaulters.length} defaulters...`, 'success');
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Auto-populated notice */}
      {total > 0 && isCurrentMonth && (
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
          <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <p className="text-sm text-indigo-700">
            <span className="font-semibold">{total} members</span> auto-added for {selectedMonth} —
            list updates live as payments are marked paid.
          </p>
        </div>
      )}

      {/* Defaulter Alert Banner */}
      {defaulters.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-bold">{defaulters.length} defaulter{defaulters.length > 1 ? 's' : ''}</span> found
              with overdue dues from previous months. Send urgent reminders.
            </p>
          </div>
          <button
            onClick={sendAllDefaulters}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Remind All Defaulters ({defaulters.length})
          </button>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5" />
              <h2 className="text-lg font-bold">WhatsApp Reminders — {selectedMonth}</h2>
            </div>
            <p className="text-green-100 text-sm">Members auto-added each month · removed when paid</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="bg-white/20 rounded-lg px-3 py-1.5 text-center">
                <p className="text-xs text-green-100">Pending</p>
                <p className="text-xl font-bold">{unpaid.length}</p>
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-1.5 text-center">
                <p className="text-xs text-green-100">Paid</p>
                <p className="text-xl font-bold">{paid.length}</p>
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-1.5 text-center">
                <p className="text-xs text-green-100">Due Amount</p>
                <p className="text-xl font-bold">₹{(unpaid.length * societyInfo.maintenanceAmount).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
          <button
            onClick={sendAll}
            disabled={unpaid.length === 0}
            className="flex items-center gap-2 px-5 py-3 bg-white text-green-700 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            Send All ({unpaid.length})
          </button>
        </div>
        {total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-green-100 mb-1.5">
              <span>{paid.length} paid</span>
              <span>{Math.round((paid.length / total) * 100)}% collected</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-700"
                style={{ width: `${(paid.length / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── DEFAULTERS SECTION ──────────────────────────────── */}
      {defaulters.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 overflow-hidden">
          <div className="px-5 py-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h3 className="font-semibold text-red-800">Defaulters — Previous Month Overdue</h3>
            </div>
            <span className="text-xs bg-red-600 text-white px-2.5 py-1 rounded-full font-medium">
              {defaulters.length} defaulter{defaulters.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Defaulter message preview */}
          <div className="px-5 py-3 bg-orange-50 border-b border-orange-100">
            <p className="text-xs text-orange-700 font-medium mb-1">Urgent reminder message:</p>
            <p className="text-xs text-slate-600 font-mono leading-relaxed">
              Dear [Name], This is an urgent reminder regarding your OVERDUE maintenance fees...
              Pending dues: [Month list] · Total Due: ₹[Amount] · Pay via UPI: {societyInfo.upiId}
            </p>
          </div>

          <div className="divide-y divide-slate-50">
            {defaulters.map((d) => {
              const phone = memberPhones[d.flat] || '9999999999';
              return (
                <div key={d.flat} className="flex items-center gap-4 px-5 py-4 hover:bg-red-50/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 ring-2 ring-red-200">
                    <span className="text-white font-bold text-sm">{d.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{d.name}</p>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        {d.unpaidMonths.length} month{d.unpaidMonths.length > 1 ? 's' : ''} due
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Home className="w-3 h-3" /> Flat {d.flat}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="w-3 h-3" /> {phone}
                      </span>
                      <span className="text-xs text-red-500 font-medium">
                        {d.unpaidMonths.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right mr-3 hidden sm:block">
                    <p className="text-sm font-black text-red-600">₹{d.totalDue.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-400">total due</p>
                  </div>
                  <button
                    onClick={() => sendDefaulterReminder(d)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm whitespace-nowrap"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Remind
                  </button>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3 bg-red-50 border-t border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <IndianRupee className="w-4 h-4" />
              <span className="font-semibold">
                Total overdue: ₹{defaulters.reduce((s, d) => s + d.totalDue, 0).toLocaleString('en-IN')}
              </span>
              <span className="text-red-500">across {defaulters.length} members</span>
            </div>
          </div>
        </div>
      )}

      {/* ── CURRENT MONTH PENDING ───────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Pending — {selectedMonth}
          </h3>
          <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">
            {unpaid.length} pending
          </span>
        </div>

        {unpaid.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="text-slate-800 font-semibold">All payments collected!</p>
            <p className="text-slate-500 text-sm mt-1">No pending reminders for {selectedMonth}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {unpaid.map((p) => {
              const phone = memberPhones[p.flat] || '9999999999';
              // highlight if also a defaulter
              const isDefaulter = !!defaulterMap[p.flat];
              return (
                <div key={p.id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${isDefaulter ? 'bg-orange-50/40 hover:bg-orange-50' : 'hover:bg-slate-50/50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${isDefaulter
                      ? 'bg-gradient-to-br from-orange-400 to-red-500 ring-2 ring-orange-200'
                      : 'bg-gradient-to-br from-red-400 to-rose-500'
                    }`}>
                    <span className="text-white font-bold text-sm">{p.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                      {isDefaulter && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          Also has prev dues
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Home className="w-3 h-3" /> Flat {p.flat}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="w-3 h-3" /> {phone}
                      </span>
                    </div>
                  </div>
                  <div className="text-right mr-4 hidden sm:block">
                    <p className="text-sm font-bold text-red-600">₹{p.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-400">{p.month}</p>
                  </div>
                  <button
                    onClick={() => sendReminder(p)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-[#25D366] text-white text-xs font-semibold rounded-xl hover:bg-[#1ebe5d] transition-colors shadow-sm whitespace-nowrap"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Send
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Already Paid */}
      {paid.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Paid — Removed from Reminders
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
              {paid.length} paid
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {paid.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3 opacity-55">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-600 line-through">{p.name}</p>
                  <p className="text-xs text-slate-400">Flat {p.flat} · {p.mode}</p>
                </div>
                <span className="text-xs text-emerald-600 font-semibold">✓ Paid</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
