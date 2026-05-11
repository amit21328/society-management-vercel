import { useState } from 'react';
import { Building2, MapPin, IndianRupee, Phone, User, Mail, Save, CheckCircle, Shield, CreditCard } from 'lucide-react';

function Section({ title, description, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, error, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
        <div className={Icon ? 'pl-9' : ''}>{children}</div>
      </div>
      {hint  && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
    ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`;
}

export default function Settings({ societyInfo, onSave, showToast }) {
  const [tab, setTab] = useState('society');

  const [society, setSociety] = useState({
    name:         societyInfo.name,
    location:     societyInfo.location,
    address:      societyInfo.address,
    upiId:        societyInfo.upiId,
    totalFlats:   String(societyInfo.totalFlats),
    maintenance:  String(societyInfo.maintenanceAmount),
    secretary:    societyInfo.secretary,
    phone:        societyInfo.phone,
  });

  const [admin, setAdmin] = useState({
    name:  'Admin User',
    email: 'admin@sunriseapts.com',
    phone: societyInfo.phone,
  });

  const [errors, setSErrors] = useState({});
  const [saved, setSaved]    = useState(false);

  const tabs = [
    { id: 'society', label: 'Society',      icon: Building2 },
    { id: 'admin',   label: 'Admin Profile', icon: User },
  ];

  const validateSociety = () => {
    const e = {};
    if (!society.name.trim())        e.name       = 'Required';
    if (!society.location.trim())    e.location   = 'Required';
    if (!society.upiId.trim())       e.upiId      = 'Required';
    if (!society.totalFlats || isNaN(society.totalFlats) || +society.totalFlats < 1)
                                     e.totalFlats  = 'Enter valid number';
    if (!society.maintenance || isNaN(society.maintenance) || +society.maintenance < 1)
                                     e.maintenance = 'Enter valid amount';
    return e;
  };

  const handleSave = () => {
    if (tab === 'society') {
      const errs = validateSociety();
      if (Object.keys(errs).length) { setSErrors(errs); return; }
    }
    setSErrors({});
    onSave({
      name:              society.name,
      location:          society.location,
      fullName:          `${society.name}, ${society.location}`,
      address:           society.address,
      upiId:             society.upiId,
      totalFlats:        +society.totalFlats,
      maintenanceAmount: +society.maintenance,
      secretary:         society.secretary,
      phone:             society.phone,
      currentMonth:      societyInfo.currentMonth,
    });
    setSaved(true);
    showToast('Settings saved successfully!', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      {/* Tab Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 flex gap-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSErrors({}); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${tab === id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Society Settings ─────────────────────────────── */}
      {tab === 'society' && (
        <div className="space-y-5">
          <Section title="Society Profile" description="Basic information about your society">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Society Name" icon={Building2} error={errors.name}>
                <input
                  value={society.name}
                  onChange={e => setSociety(p => ({ ...p, name: e.target.value }))}
                  className={inputCls(errors.name)}
                  placeholder="e.g. Sunrise Apartments"
                />
              </Field>
              <Field label="City / Location" icon={MapPin} error={errors.location}>
                <input
                  value={society.location}
                  onChange={e => setSociety(p => ({ ...p, location: e.target.value }))}
                  className={inputCls(errors.location)}
                  placeholder="e.g. Kolkata"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Full Address" icon={MapPin}>
                  <input
                    value={society.address}
                    onChange={e => setSociety(p => ({ ...p, address: e.target.value }))}
                    className={inputCls()}
                    placeholder="Street, Area, City, PIN"
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Maintenance Configuration" description="Payment and collection settings">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Total Flats" icon={Building2} error={errors.totalFlats}>
                <input
                  type="number"
                  value={society.totalFlats}
                  onChange={e => setSociety(p => ({ ...p, totalFlats: e.target.value }))}
                  className={inputCls(errors.totalFlats)}
                  placeholder="20"
                />
              </Field>
              <Field label="Maintenance Amount (₹/month)" icon={IndianRupee} error={errors.maintenance}>
                <input
                  type="number"
                  value={society.maintenance}
                  onChange={e => setSociety(p => ({ ...p, maintenance: e.target.value }))}
                  className={inputCls(errors.maintenance)}
                  placeholder="1500"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="UPI Payment ID" icon={CreditCard} error={errors.upiId} hint="Members will see this when paying via UPI">
                  <input
                    value={society.upiId}
                    onChange={e => setSociety(p => ({ ...p, upiId: e.target.value }))}
                    className={`${inputCls(errors.upiId)}`}
                    placeholder="yoursociety@upi"
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Secretary Details" description="Contact shown in reminders and receipts">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Secretary Name" icon={User}>
                <input
                  value={society.secretary}
                  onChange={e => setSociety(p => ({ ...p, secretary: e.target.value }))}
                  className={inputCls()}
                  placeholder="Secretary name"
                />
              </Field>
              <Field label="Contact Phone" icon={Phone}>
                <input
                  type="tel"
                  value={society.phone}
                  onChange={e => setSociety(p => ({ ...p, phone: e.target.value }))}
                  className={inputCls()}
                  placeholder="10-digit number"
                />
              </Field>
            </div>
          </Section>
        </div>
      )}

      {/* ── Admin Profile ─────────────────────────────────── */}
      {tab === 'admin' && (
        <Section title="Admin Profile" description="Your account information">
          <div className="space-y-4">
            <Field label="Full Name" icon={User}>
              <input
                value={admin.name}
                onChange={e => setAdmin(p => ({ ...p, name: e.target.value }))}
                className={inputCls()}
                placeholder="Your name"
              />
            </Field>
            <Field label="Email Address" icon={Mail} hint="Used for login">
              <input
                type="email"
                value={admin.email}
                onChange={e => setAdmin(p => ({ ...p, email: e.target.value }))}
                className={inputCls()}
                placeholder="admin@example.com"
              />
            </Field>
            <Field label="Phone Number" icon={Phone}>
              <input
                type="tel"
                value={admin.phone}
                onChange={e => setAdmin(p => ({ ...p, phone: e.target.value }))}
                className={inputCls()}
                placeholder="10-digit number"
              />
            </Field>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-700 mb-3">Change Password</p>
              <div className="space-y-3">
                <Field label="Current Password" icon={Shield}>
                  <input type="password" className={inputCls()} placeholder="Enter current password" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="New Password" icon={Shield}>
                    <input type="password" className={inputCls()} placeholder="New password" />
                  </Field>
                  <Field label="Confirm New" icon={Shield}>
                    <input type="password" className={inputCls()} placeholder="Confirm" />
                  </Field>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between bg-white rounded-xl px-5 py-4 shadow-sm border border-slate-100">
        <p className="text-xs text-slate-500">Changes are saved to your session</p>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm
            ${saved
              ? 'bg-emerald-500 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
        >
          {saved
            ? <><CheckCircle className="w-4 h-4" /> Saved!</>
            : <><Save className="w-4 h-4" /> Save Changes</>
          }
        </button>
      </div>
    </div>
  );
}
