import { useState } from 'react';
import { PlusCircle, X, Receipt, Zap, Shield, Sparkles, Wrench, Tag } from 'lucide-react';
import { expenseCategories } from '../data/sampleData';

const categoryIcons = {
  Electricity: { icon: Zap,       color: 'bg-yellow-100 text-yellow-600' },
  Security:    { icon: Shield,     color: 'bg-blue-100 text-blue-600' },
  Cleaning:    { icon: Sparkles,   color: 'bg-teal-100 text-teal-600' },
  Repairs:     { icon: Wrench,     color: 'bg-orange-100 text-orange-600' },
  default:     { icon: Tag,        color: 'bg-slate-100 text-slate-600' },
};

function getCatStyle(cat) {
  return categoryIcons[cat] || categoryIcons.default;
}

export default function Expenses({ expenses, addExpense, showToast, selectedMonth }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: '', category: 'Electricity', description: '', amount: '' });
  const [errors, setErrors] = useState({});

  const monthExpenses = expenses.filter(e => e.month === selectedMonth);
  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const validate = () => {
    const e = {};
    if (!form.date)                       e.date        = 'Date is required';
    if (!form.description.trim())         e.description = 'Description is required';
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0)
                                          e.amount      = 'Enter a valid amount';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    addExpense({ ...form, amount: +form.amount });
    setForm({ date: '', category: 'Electricity', description: '', amount: '' });
    setErrors({});
    setShowModal(false);
  };

  const catTotals = expenseCategories.reduce((acc, cat) => {
    acc[cat] = monthExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { cat: 'Electricity', amount: catTotals['Electricity'] || 0 },
          { cat: 'Security',    amount: catTotals['Security']    || 0 },
          { cat: 'Cleaning',    amount: catTotals['Cleaning']    || 0 },
          { cat: 'Repairs',     amount: catTotals['Repairs']     || 0 },
        ].map(({ cat, amount }) => {
          const { icon: Icon, color } = getCatStyle(cat);
          return (
            <div key={cat} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-4.5 h-4.5" size={18} />
              </div>
              <p className="text-lg font-bold text-slate-800">₹{amount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{cat}</p>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100 flex items-center gap-3">
          <Receipt className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-xs text-slate-500">Total Expenses ({selectedMonth})</p>
            <p className="text-lg font-bold text-slate-800">₹{total.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Expense Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthExpenses.map((e) => {
                const { icon: Icon, color } = getCatStyle(e.category);
                return (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-slate-600">{e.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>
                          <Icon size={14} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{e.category}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-sm text-slate-500">{e.description}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-bold text-slate-800">₹{e.amount.toLocaleString('en-IN')}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-amber-50 border-t-2 border-amber-100">
                <td colSpan={3} className="px-5 py-3.5 text-sm font-bold text-slate-700 hidden sm:table-cell">Total</td>
                <td colSpan={3} className="px-5 py-3.5 text-sm font-bold text-slate-700 sm:hidden">Total</td>
                <td className="px-5 py-3.5 text-right text-base font-black text-amber-700">
                  ₹{total.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Receipt className="w-4.5 h-4.5 text-amber-600" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Add Expense</h3>
              </div>
              <button onClick={() => { setShowModal(false); setErrors({}); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.date ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.amount ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
                <input
                  type="text"
                  placeholder="Brief description of expense"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.description ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setErrors({}); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
