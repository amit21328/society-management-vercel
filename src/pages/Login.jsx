import { useState } from 'react';
import { Building2, Eye, EyeOff, LogIn, BarChart3, Users, Smartphone, Shield, Phone, Mail } from 'lucide-react';
import { supabase, getRegisteredSocieties, setCurrentSocietyId } from '../lib/supabase';

const ADMIN_EMAIL    = 'admin@sunriseapts.com';
const ADMIN_PASSWORD = 'sunrise@123';
const DEFAULT_SOCIETY_ID = import.meta.env.VITE_SOCIETY_ID;

const features = [
  { icon: BarChart3,   text: 'Real-time collection dashboard' },
  { icon: Users,       text: 'Member & payment management' },
  { icon: Smartphone,  text: 'WhatsApp reminder automation' },
  { icon: Shield,      text: 'Expense tracking & receipts' },
];

// Detect input type:
// - Contains @ → admin email
// - Exactly 10 digits → resident mobile number
function detectInputType(val) {
  if (!val.trim()) return null;
  if (val.includes('@'))             return 'admin';
  if (/^\d{10}$/.test(val.trim()))   return 'resident';
  return null;
}

export default function Login({ onAdminLogin, onResidentLogin, onRegister, members = [] }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const inputType = detectInputType(identifier);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) { setError('Please enter your email or mobile number.'); return; }
    if (!password.trim())   { setError('Please enter your password.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    if (inputType === 'admin') {
      const email = identifier.trim().toLowerCase();

      // Check default demo society
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setCurrentSocietyId(DEFAULT_SOCIETY_ID);
        localStorage.setItem('is_logged_in', 'true');
        onAdminLogin();
        return;
      }

      // Check any registered society
      const registered = getRegisteredSocieties();
      const match = registered.find(s => s.adminEmail === email && s.adminPassword === password);
      if (match) {
        setCurrentSocietyId(match.id);
        localStorage.setItem('is_logged_in', 'true');
        onAdminLogin();
        return;
      }

      setError('Invalid email or password.');
      setLoading(false);

    } else if (inputType === 'resident') {
      if (password !== '1234') {
        setError('Incorrect password.');
        setLoading(false);
        return;
      }

      // Search by mobile number across ALL societies — always finds the right one
      const { data: found } = await supabase
        .from('members')
        .select('flat, name, society_id, phone')
        .eq('phone', identifier.trim());

      if (!found || found.length === 0) {
        setError('Mobile number not registered. Contact your society secretary.');
        setLoading(false);
        return;
      }

      const match = found[0];
      setCurrentSocietyId(match.society_id);
      localStorage.setItem('resident_flat', match.flat);
      onResidentLogin(match.flat);

    } else {
      setError('Enter your email (admin) or 10-digit mobile number (resident).');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ──────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Society Manager</p>
            <p className="text-indigo-300 text-xs">Smart Housing Management</p>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-black text-white leading-tight">
              Manage your society<br />
              <span className="text-indigo-300">smarter & faster</span>
            </h1>
            <p className="text-indigo-200 mt-4 text-base leading-relaxed max-w-sm">
              Collect maintenance fees, track expenses, send WhatsApp reminders — all from one dashboard.
            </p>
          </div>
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-300" />
                </div>
                <span className="text-indigo-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ value: '₹10,500', label: 'Collected' }, { value: '13/20', label: 'Paid Flats' }, { value: '100%', label: 'Uptime' }].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur border border-white/10">
                <p className="text-white font-bold text-base">{s.value}</p>
                <p className="text-indigo-300 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-indigo-400 text-xs">© 2026 Society Manager</p>
      </div>

      {/* ── Right Panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 bg-slate-50">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-bold text-slate-800">Society Manager</p>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-800">Welcome back</h2>
            <p className="text-slate-500 mt-2">Admins use email · Residents use mobile number</p>
          </div>

          {/* Demo fill buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button"
              onClick={() => { setIdentifier(ADMIN_EMAIL); setPassword(ADMIN_PASSWORD); setError(''); }}
              className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-3 hover:bg-indigo-100 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-indigo-700">Admin Demo</p>
                <p className="text-xs text-indigo-400 truncate">Click to fill</p>
              </div>
            </button>
            <button type="button"
              onClick={() => { setIdentifier('9876543201'); setPassword('1234'); setError(''); }}
              className="flex items-center gap-2.5 bg-teal-50 border border-teal-200 rounded-xl px-3 py-3 hover:bg-teal-100 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-teal-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-teal-700">Resident Demo</p>
                <p className="text-xs text-teal-400 truncate">9876543201 · 1234</p>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Smart identifier field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email or Mobile Number
              </label>
              <div className="relative">
                {inputType === 'resident'
                  ? <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                  : <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                }
                <input
                  type="text"
                  placeholder="admin@society.com  or  9876543201"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setError(''); }}
                  className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white shadow-sm transition-all
                    ${inputType === 'resident' ? 'border-teal-300 focus:ring-teal-500' :
                      inputType === 'admin'    ? 'border-indigo-300 focus:ring-indigo-500' :
                                                 'border-slate-200 focus:ring-indigo-500'}`}
                />
                {inputType && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-full
                    ${inputType === 'resident' ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {inputType === 'resident' ? '📱 Resident' : '🔑 Admin'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {inputType === 'resident' ? 'Signing in as Resident — mobile number detected' :
                 inputType === 'admin'    ? 'Signing in as Society Admin' :
                 'Enter your email (admin) or 10-digit mobile number (resident)'}
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2
                ${inputType === 'resident' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New society?{' '}
            <button onClick={onRegister} className="text-indigo-600 font-semibold hover:underline">
              Register your society
            </button>
          </p>
          <p className="text-center text-xs text-slate-400 mt-3">Society Management System · Demo v1.0</p>
        </div>
      </div>
    </div>
  );
}
