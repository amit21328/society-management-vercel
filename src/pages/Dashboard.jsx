import { Users, IndianRupee, TrendingUp, TrendingDown, Wallet, Send, PlusCircle, ArrowRight, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard({ stats, payments, societyInfo, showToast, setActiveSection, selectedMonth }) {
  const recentPayments = [...payments]
    .filter(p => p.month === selectedMonth && p.status === 'Paid' && p.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const statCards = [
    {
      label: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      color: 'bg-blue-500',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      suffix: '',
      prefix: '',
    },
    {
      label: 'Collected This Month',
      value: stats.collected.toLocaleString('en-IN'),
      icon: TrendingUp,
      color: 'bg-emerald-500',
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      suffix: '',
      prefix: '₹',
    },
    {
      label: 'Pending Amount',
      value: stats.pending.toLocaleString('en-IN'),
      icon: TrendingDown,
      color: 'bg-red-500',
      light: 'bg-red-50',
      text: 'text-red-600',
      suffix: '',
      prefix: '₹',
    },
    {
      label: 'Total Expenses',
      value: stats.totalExpenses.toLocaleString('en-IN'),
      icon: IndianRupee,
      color: 'bg-amber-500',
      light: 'bg-amber-50',
      text: 'text-amber-600',
      suffix: '',
      prefix: '₹',
    },
    {
      label: 'Net Balance',
      value: stats.netBalance.toLocaleString('en-IN'),
      icon: Wallet,
      color: stats.netBalance >= 0 ? 'bg-indigo-500' : 'bg-red-500',
      light: stats.netBalance >= 0 ? 'bg-indigo-50' : 'bg-red-50',
      text: stats.netBalance >= 0 ? 'text-indigo-600' : 'text-red-600',
      suffix: '',
      prefix: '₹',
    },
  ];

  const paidCount = payments.filter(p => p.month === selectedMonth && p.status === 'Paid').length;
  const unpaidCount = payments.filter(p => p.month === selectedMonth && p.status === 'Unpaid').length;
  const collectionPct = Math.round((paidCount / (paidCount + unpaidCount)) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium">Welcome back,</p>
            <h2 className="text-2xl font-bold mt-1">{societyInfo.name}</h2>
            <p className="text-indigo-200 text-sm mt-1">{societyInfo.address}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center min-w-[130px]">
            <p className="text-indigo-200 text-xs font-medium">Collection Rate</p>
            <p className="text-3xl font-black mt-1">{collectionPct}%</p>
            <p className="text-indigo-200 text-xs mt-1">{selectedMonth}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.light} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.text}`} />
                </div>
              </div>
              <p className={`text-xl font-bold ${card.text}`}>
                {card.prefix}{card.value}{card.suffix}
              </p>
              <p className="text-xs text-slate-500 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Recent Payments</h3>
            <button
              onClick={() => setActiveSection('payments')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">Flat {p.flat} · {p.mode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">₹{p.amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-500">{p.date}</p>
                </div>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">No payments yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions + Summary */}
        <div className="space-y-4">
          {/* Collection summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">{selectedMonth} Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Paid</span>
                <span className="font-semibold text-emerald-600">{paidCount} flats</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${collectionPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Pending</span>
                <span className="font-semibold text-red-500">{unpaidCount} flats</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-xs text-emerald-600 font-medium">Collected</p>
                <p className="text-base font-bold text-emerald-700 mt-0.5">₹{stats.collected.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xs text-red-600 font-medium">Pending</p>
                <p className="text-base font-bold text-red-700 mt-0.5">₹{stats.pending.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveSection('whatsapp')}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors border border-green-200"
              >
                <Send className="w-4 h-4" />
                Send Reminders
              </button>
              <button
                onClick={() => setActiveSection('payments')}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-200"
              >
                <PlusCircle className="w-4 h-4" />
                Add Payment
              </button>
              <button
                onClick={() => setActiveSection('expenses')}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors border border-amber-200"
              >
                <IndianRupee className="w-4 h-4" />
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
