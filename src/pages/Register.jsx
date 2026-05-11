import { useState } from 'react';
import { Building2, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, User, MapPin, Home, IndianRupee, Phone, Mail, Lock, Sparkles } from 'lucide-react';
import { supabase, setCurrentSocietyId, saveRegisteredSociety } from '../lib/supabase';

const TOTAL_STEPS = 2;

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all
            ${current === step
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
              : current > step
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 text-slate-400'
            }`}>
            {current > step ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${current >= step ? 'text-slate-700' : 'text-slate-400'}`}>
            {step === 1 ? 'Society Details' : 'Admin Account'}
          </span>
          {step < TOTAL_STEPS && (
            <div className={`h-px w-8 sm:w-12 mx-1 transition-colors ${current > step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({ label, icon: Icon, error, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
        <input
          {...props}
          className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition-all
            ${error ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function Register({ onRegister, onBackToLogin }) {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass]        = useState(false);
  const [showConfirm, setShowConfirm]  = useState(false);
  const [success, setSuccess]          = useState(false);
  const [loading, setLoading]          = useState(false);
  const [errors, setErrors]            = useState({});

  const [society, setSociety] = useState({
    name: '', city: '', address: '', totalFlats: '', maintenance: '',
  });
  const [admin, setAdmin] = useState({
    fullName: '', email: '', phone: '', password: '', confirm: '',
  });

  // ── Validation ────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!society.name.trim())        e.name        = 'Society name is required';
    if (!society.city.trim())        e.city        = 'City is required';
    if (!society.totalFlats || isNaN(society.totalFlats) || +society.totalFlats < 1)
                                     e.totalFlats  = 'Enter a valid number of flats';
    if (!society.maintenance || isNaN(society.maintenance) || +society.maintenance < 1)
                                     e.maintenance = 'Enter a valid maintenance amount';
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!admin.fullName.trim())       e.fullName = 'Full name is required';
    if (!admin.email.trim())          e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(admin.email)) e.email = 'Enter a valid email';
    if (!admin.phone.trim())          e.phone    = 'Phone is required';
    else if (!/^\d{10}$/.test(admin.phone))      e.phone = 'Enter a valid 10-digit number';
    if (!admin.password)              e.password = 'Password is required';
    else if (admin.password.length < 6)          e.password = 'Minimum 6 characters';
    if (admin.password !== admin.confirm)        e.confirm  = 'Passwords do not match';
    return e;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    // Create society in Supabase
    const { data, error } = await supabase.from('societies').insert({
      name:               society.name,
      location:           society.city,
      address:            society.address,
      total_flats:        Number(society.totalFlats),
      maintenance_amount: Number(society.maintenance),
      upi_id:             '',
      secretary_name:     admin.fullName,
      secretary_phone:    admin.phone,
    }).select().single();

    if (error || !data) {
      setErrors({ submit: 'Failed to create society. Please try again.' });
      setLoading(false);
      return;
    }

    // Save society ID + admin credentials locally for login
    setCurrentSocietyId(data.id);
    saveRegisteredSociety({
      id:            data.id,
      adminEmail:    admin.email.trim().toLowerCase(),
      adminPassword: admin.password,
    });

    setLoading(false);
    setSuccess(true);
    setTimeout(() => onRegister(), 2000);
  };

  // ── Success Screen ─────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center space-y-4 animate-fade-in max-w-sm">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Account Created!</h2>
          <p className="text-slate-500 text-sm">
            <span className="font-semibold text-slate-700">{society.name}</span> has been registered successfully.<br />
            Redirecting to your dashboard...
          </p>
          <div className="flex justify-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ──────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Society Manager</p>
            <p className="text-indigo-300 text-xs">Smart Housing Management</p>
          </div>
        </div>

        {/* Content */}
        <div className="relative space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-indigo-200 text-xs font-medium">Free to get started</span>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight">
              Register your<br />
              <span className="text-indigo-300">society today</span>
            </h1>
            <p className="text-indigo-200 mt-3 text-sm leading-relaxed">
              Set up your society in 2 minutes. Manage payments, track expenses, and send reminders — all in one place.
            </p>
          </div>

          {/* Steps preview */}
          <div className="space-y-3">
            {[
              { num: '01', title: 'Society Details',   desc: 'Name, location, flats & maintenance amount' },
              { num: '02', title: 'Admin Account',     desc: 'Your name, email and secure password' },
              { num: '03', title: 'Start Managing',    desc: 'Dashboard is ready immediately' },
            ].map(s => (
              <div key={s.num} className="flex items-start gap-3">
                <span className="text-indigo-400 font-black text-sm mt-0.5">{s.num}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{s.title}</p>
                  <p className="text-indigo-300 text-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: '100%', label: 'Free Demo' },
              { val: '2 min', label: 'Setup Time' },
              { val: '20+', label: 'Features' },
              { val: '24/7', label: 'Access' },
            ].map(b => (
              <div key={b.label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur border border-white/10">
                <p className="text-white font-bold text-sm">{b.val}</p>
                <p className="text-indigo-300 text-xs mt-0.5">{b.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-indigo-400 text-xs">© 2026 Society Manager</p>
      </div>

      {/* ── Right Panel (Form) ───────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 bg-slate-50 overflow-y-auto py-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-bold text-slate-800">Society Manager</p>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-800">Create your account</h2>
            <p className="text-slate-500 text-sm mt-1">Register your society in just 2 steps</p>
          </div>

          <StepIndicator current={step} />

          {/* ── STEP 1: Society Details ── */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <InputField
                label="Society Name *"
                icon={Building2}
                placeholder="e.g. Sunrise Apartments"
                value={society.name}
                onChange={e => setSociety(p => ({ ...p, name: e.target.value }))}
                error={errors.name}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="City *"
                  icon={MapPin}
                  placeholder="e.g. Kolkata"
                  value={society.city}
                  onChange={e => setSociety(p => ({ ...p, city: e.target.value }))}
                  error={errors.city}
                />
                <InputField
                  label="Total Flats *"
                  icon={Home}
                  type="number"
                  placeholder="e.g. 20"
                  value={society.totalFlats}
                  onChange={e => setSociety(p => ({ ...p, totalFlats: e.target.value }))}
                  error={errors.totalFlats}
                />
              </div>
              <InputField
                label="Address"
                icon={MapPin}
                placeholder="Full address (optional)"
                value={society.address}
                onChange={e => setSociety(p => ({ ...p, address: e.target.value }))}
              />
              <InputField
                label="Maintenance Amount (₹/month) *"
                icon={IndianRupee}
                type="number"
                placeholder="e.g. 1500"
                value={society.maintenance}
                onChange={e => setSociety(p => ({ ...p, maintenance: e.target.value }))}
                error={errors.maintenance}
              />

              <button
                type="button"
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm mt-2"
              >
                Next — Admin Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Admin Account ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <InputField
                label="Full Name *"
                icon={User}
                placeholder="Your full name"
                value={admin.fullName}
                onChange={e => setAdmin(p => ({ ...p, fullName: e.target.value }))}
                error={errors.fullName}
              />
              <InputField
                label="Email Address *"
                icon={Mail}
                type="email"
                placeholder="admin@yoursociety.com"
                value={admin.email}
                onChange={e => setAdmin(p => ({ ...p, email: e.target.value }))}
                error={errors.email}
              />
              <InputField
                label="Phone Number *"
                icon={Phone}
                type="tel"
                placeholder="10-digit mobile number"
                value={admin.phone}
                onChange={e => setAdmin(p => ({ ...p, phone: e.target.value }))}
                error={errors.phone}
              />

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={admin.password}
                    onChange={e => setAdmin(p => ({ ...p, password: e.target.value }))}
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm ${errors.password ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={admin.confirm}
                    onChange={e => setAdmin(p => ({ ...p, confirm: e.target.value }))}
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm ${errors.confirm ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
              </div>

              {/* Password match indicator */}
              {admin.password && admin.confirm && (
                <div className={`flex items-center gap-2 text-xs font-medium ${admin.password === admin.confirm ? 'text-emerald-600' : 'text-red-500'}`}>
                  {admin.password === admin.confirm
                    ? <><CheckCircle className="w-3.5 h-3.5" /> Passwords match</>
                    : <><span className="w-3.5 h-3.5 inline-flex items-center justify-center rounded-full border border-red-400 text-red-400 text-[10px]">✕</span> Passwords do not match</>
                  }
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrors({}); }}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Back to Login */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <button onClick={onBackToLogin} className="text-indigo-600 font-semibold hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
