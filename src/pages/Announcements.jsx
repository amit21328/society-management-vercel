import { useState } from 'react';
import { Bell, PlusCircle, X, AlertTriangle, Info, CheckCircle, Megaphone } from 'lucide-react';

const priorities = ['High', 'Medium', 'Low'];

const priorityConfig = {
  High:   { color: 'bg-red-100 text-red-700',    dot: 'bg-red-500',    border: 'border-red-200',   icon: AlertTriangle, label: 'bg-red-50 text-red-600' },
  Medium: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500',  border: 'border-amber-200', icon: Info,          label: 'bg-amber-50 text-amber-600' },
  Low:    { color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400',  border: 'border-slate-200', icon: CheckCircle,   label: 'bg-slate-50 text-slate-500' },
};

export default function Announcements({ announcements, addAnnouncement, showToast }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'Medium' });
  const [errors, setErrors] = useState({});
  const [filterPriority, setFilterPriority] = useState('All');

  const filtered = filterPriority === 'All'
    ? announcements
    : announcements.filter(a => a.priority === filterPriority);

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = 'Title is required';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    addAnnouncement(form);
    setForm({ title: '', message: '', priority: 'Medium' });
    setErrors({});
    setShowModal(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          {['All', ...priorities].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${filterPriority === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          Add Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {priorities.map(p => {
          const count = announcements.filter(a => a.priority === p).length;
          const cfg = priorityConfig[p];
          return (
            <div key={p} className={`bg-white rounded-xl p-4 shadow-sm border ${cfg.border} text-center`}>
              <p className={`text-2xl font-bold ${p === 'High' ? 'text-red-600' : p === 'Medium' ? 'text-amber-600' : 'text-slate-600'}`}>{count}</p>
              <p className="text-xs text-slate-500 mt-1">{p} Priority</p>
            </div>
          );
        })}
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 py-16 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No announcements</p>
          </div>
        )}
        {filtered.map((ann) => {
          const cfg = priorityConfig[ann.priority];
          const Icon = cfg.icon;
          return (
            <div
              key={ann.id}
              className={`bg-white rounded-xl shadow-sm border ${cfg.border} p-5 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${cfg.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h4 className="font-semibold text-slate-800">{ann.title}</h4>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                      {ann.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{ann.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{ann.date}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Megaphone className="w-4.5 h-4.5 text-indigo-600" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">New Announcement</h3>
              </div>
              <button onClick={() => { setShowModal(false); setErrors({}); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  placeholder="Announcement title"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                <div className="flex gap-2">
                  {priorities.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, priority: p }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors
                        ${form.priority === p
                          ? p === 'High' ? 'bg-red-600 text-white border-red-600'
                          : p === 'Medium' ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-slate-600 text-white border-slate-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
                <textarea
                  rows={4}
                  placeholder="Write the announcement message..."
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${errors.message ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
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
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
