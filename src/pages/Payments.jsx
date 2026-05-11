import { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, CheckCheck, RotateCcw, ChevronDown, CreditCard } from 'lucide-react';

const PAYMENT_MODES = ['UPI', 'Cash', 'Bank Transfer', 'Cheque', 'NEFT / RTGS', 'Online'];

const tabs = [
  { id: 'all',        label: 'All',        icon: CheckCheck },
  { id: 'paid',       label: 'Paid',       icon: CheckCircle },
  { id: 'unpaid',     label: 'Unpaid',     icon: Clock },
  { id: 'defaulters', label: 'Defaulters', icon: AlertTriangle },
];

export default function Payments({ payments, markAsPaid, revertPayment, markAllDuesPaid, societyInfo, showToast, selectedMonth }) {
  const [activeTab, setActiveTab]         = useState('all');
  const [confirmRevert, setConfirmRevert] = useState(null);
  const [markingId, setMarkingId]         = useState(null);
  const [modeInput, setModeInput]         = useState('UPI');
  // For "Pay All" per defaulter flat
  const [payAllFlat, setPayAllFlat]       = useState(null);
  const [payAllMode, setPayAllMode]       = useState('UPI');

  const monthPayments = payments.filter(p => p.month === selectedMonth);

  const defaulterFlats = payments
    .filter(p => p.status === 'Unpaid')
    .reduce((acc, p) => { acc[p.flat] = (acc[p.flat] || 0) + 1; return acc; }, {});
  const defaulterFlatNos = Object.keys(defaulterFlats).filter(f => defaulterFlats[f] >= 2);

  const filtered = (() => {
    switch (activeTab) {
      case 'paid':       return monthPayments.filter(p => p.status === 'Paid');
      case 'unpaid':     return monthPayments.filter(p => p.status === 'Unpaid');
      case 'defaulters': return payments.filter(p => defaulterFlatNos.includes(p.flat)).sort((a, b) => a.flat.localeCompare(b.flat));
      default:           return monthPayments;
    }
  })();

  const counts = {
    all:        monthPayments.length,
    paid:       monthPayments.filter(p => p.status === 'Paid').length,
    unpaid:     monthPayments.filter(p => p.status === 'Unpaid').length,
    defaulters: defaulterFlatNos.length,
  };

  const startMarking = (id) => { setMarkingId(id); setModeInput('UPI'); setPayAllFlat(null); };
  const cancelMarking = ()  => { setMarkingId(null); setModeInput('UPI'); };
  const confirmPaid = (id)  => { markAsPaid(id, modeInput); cancelMarking(); };

  const handleRevert = (p) => {
    revertPayment(p.id, { status: 'Unpaid', mode: '-', date: null, receiptNo: null });
    setConfirmRevert(null);
  };

  const confirmPayAll = (flat) => {
    markAllDuesPaid(flat, payAllMode);
    setPayAllFlat(null);
    setPayAllMode('UPI');
  };

  // Group defaulter payments by flat for a cleaner view
  const defaulterGroups = defaulterFlatNos.map(flat => {
    const rows = filtered.filter(p => p.flat === flat);
    const unpaidRows = rows.filter(p => p.status === 'Unpaid');
    return { flat, name: rows[0]?.name, rows, unpaidCount: unpaidRows.length };
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 flex gap-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setMarkingId(null); setPayAllFlat(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === id
                ? id === 'defaulters' ? 'bg-red-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold
              ${activeTab === id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {counts[id]}
            </span>
          </button>
        ))}
      </div>

      {/* ── DEFAULTERS TAB — grouped by flat ──────────────── */}
      {activeTab === 'defaulters' && (
        <div className="space-y-4">
          {defaulterGroups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 py-12 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No defaulters found</p>
            </div>
          ) : (
            defaulterGroups.map(({ flat, name, rows, unpaidCount }) => (
              <div key={flat} className="bg-white rounded-xl shadow-sm border-2 border-red-100 overflow-hidden">
                {/* Flat header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-red-50 border-b border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-200 flex items-center justify-center font-bold text-red-700 text-sm">
                      {name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{name}</p>
                      <p className="text-xs text-slate-500">Flat {flat} · <span className="text-red-600 font-medium">{unpaidCount} month{unpaidCount > 1 ? 's' : ''} overdue</span></p>
                    </div>
                  </div>

                  {/* Pay All Dues button */}
                  {unpaidCount > 0 && (
                    payAllFlat === flat ? (
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <div className="relative">
                          <select
                            value={payAllMode}
                            onChange={e => setPayAllMode(e.target.value)}
                            className="appearance-none text-xs border border-slate-300 rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white font-medium text-slate-700"
                          >
                            {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                        <button
                          onClick={() => confirmPayAll(flat)}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        >
                          Confirm Pay All
                        </button>
                        <button
                          onClick={() => { setPayAllFlat(null); setPayAllMode('UPI'); }}
                          className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setPayAllFlat(flat); setMarkingId(null); }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay All {unpaidCount} Dues
                      </button>
                    )
                  )}
                </div>

                {/* Per-month rows */}
                <div className="divide-y divide-slate-50">
                  {rows.map(p => (
                    <div key={p.id} className={`flex items-center gap-3 px-5 py-3 ${p.status === 'Unpaid' ? 'hover:bg-red-50/30' : 'opacity-60'} transition-colors`}>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.status === 'Unpaid' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {p.month}
                      </span>
                      <span className="text-sm font-semibold text-slate-700 flex-1">₹{p.amount.toLocaleString('en-IN')}</span>
                      {p.status === 'Paid' ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle className="w-3 h-3" /> Paid · {p.mode}
                          </span>
                          {confirmRevert === p.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-500">Sure?</span>
                              <button onClick={() => handleRevert(p)} className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-lg">Yes</button>
                              <button onClick={() => setConfirmRevert(null)} className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded-lg">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmRevert(p.id)} className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                              <RotateCcw className="w-3 h-3" /> Revert
                            </button>
                          )}
                        </div>
                      ) : markingId === p.id ? (
                        <div className="flex items-center gap-1.5">
                          <div className="relative">
                            <select value={modeInput} onChange={e => setModeInput(e.target.value)} className="appearance-none text-xs border border-slate-300 rounded-lg pl-2 pr-6 py-1.5 bg-white font-medium text-slate-700">
                              {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                          </div>
                          <button onClick={() => confirmPaid(p.id)} className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700">Confirm</button>
                          <button onClick={cancelMarking} className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => startMarking(p.id)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap">
                          Mark Paid
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total due for this flat */}
                {unpaidCount > 0 && (
                  <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-between text-xs text-slate-600">
                    <span>{unpaidCount} month{unpaidCount > 1 ? 's' : ''} unpaid</span>
                    <span className="font-bold text-red-600">
                      Total due: ₹{rows.filter(r => r.status === 'Unpaid').reduce((s, r) => s + r.amount, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── ALL / PAID / UNPAID TABS — standard table ─────── */}
      {activeTab !== 'defaulters' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">
              {tabs.find(t => t.id === activeTab)?.label} Payments — {selectedMonth}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Flat</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Month</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Mode</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-slate-800">Flat {p.flat}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{p.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm text-slate-700">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-sm text-slate-500">{p.month}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-slate-800">₹{p.amount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <Clock className="w-3 h-3" /> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-sm text-slate-500">
                      {p.mode !== '-' ? p.mode : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {p.status === 'Unpaid' ? (
                        markingId === p.id ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="relative">
                              <select
                                value={modeInput}
                                onChange={e => setModeInput(e.target.value)}
                                className="appearance-none text-xs border border-slate-300 rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white font-medium text-slate-700"
                              >
                                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                            </div>
                            <button onClick={() => confirmPaid(p.id)} className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap">
                              Confirm
                            </button>
                            <button onClick={cancelMarking} className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium">✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startMarking(p.id)}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                          >
                            Mark Paid
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 hidden lg:block">{p.date}</span>
                          {confirmRevert === p.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-500">Sure?</span>
                              <button onClick={() => handleRevert(p)} className="px-2.5 py-1 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors">Yes</button>
                              <button onClick={() => setConfirmRevert(null)} className="px-2.5 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-300 transition-colors">No</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmRevert(p.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-amber-100 hover:text-amber-700 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" /> Revert
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
