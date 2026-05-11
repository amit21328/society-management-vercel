import { useState } from 'react';
import { Search, UserPlus, X, Home, Phone, Pencil, Trash2, AlertTriangle } from 'lucide-react';

function MemberModal({ member, onSave, onClose, title }) {
  const [form, setForm] = useState({
    flat:  member?.flat  || '',
    name:  member?.name  || '',
    phone: member?.phone || '',
    type:  member?.type  || 'Owner',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.flat.trim())  e.flat  = 'Flat number is required';
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit number';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-indigo-600" size={18} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Flat Number *</label>
            <input
              type="text" placeholder="e.g. 301"
              value={form.flat}
              onChange={e => setForm(p => ({ ...p, flat: e.target.value }))}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.flat ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.flat && <p className="text-red-500 text-xs mt-1">{errors.flat}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Owner / Resident Name *</label>
            <input
              type="text" placeholder="Full name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
            <input
              type="tel" placeholder="10-digit mobile number"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.phone ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Resident Type</label>
            <select
              value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Owner">Owner</option>
              <option value="Tenant">Tenant</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
              {member ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Members({ members, addMember, updateMember, deleteMember, showToast }) {
  const [search, setSearch]           = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // member id

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.flat.toLowerCase().includes(search.toLowerCase()) ||
    (m.phone || '').includes(search)
  );

  const handleAdd = async (form) => {
    await addMember({ ...form, join_date: new Date().toISOString().split('T')[0] });
    setShowAddModal(false);
  };

  const handleEdit = async (form) => {
    await updateMember(editingMember.id, form);
    setEditingMember(null);
  };

  const handleDelete = async (id) => {
    await deleteMember(id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search by name, flat or phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-2xl font-bold text-slate-800">{members.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Members</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-2xl font-bold text-blue-600">{members.filter(m => m.type === 'Owner').length}</p>
          <p className="text-xs text-slate-500 mt-1">Owners</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-2xl font-bold text-purple-600">{members.filter(m => m.type === 'Tenant').length}</p>
          <p className="text-xs text-slate-500 mt-1">Tenants</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">All Members</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {filtered.length} of {members.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Flat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Home className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{m.flat}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{m.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-800">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {m.phone}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium
                      ${m.type === 'Owner' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {confirmDelete === m.id ? (
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        <span className="text-xs text-slate-600">Delete?</span>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="px-2.5 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2.5 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingMember(m)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete(m.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                    No members found {search ? `matching "${search}"` : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <MemberModal
          title="Add New Member"
          onSave={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingMember && (
        <MemberModal
          title="Edit Member"
          member={editingMember}
          onSave={handleEdit}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}
