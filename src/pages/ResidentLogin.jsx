import { useState } from 'react';
import { Building2, Home, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';

export default function ResidentLogin({ onLogin, onBackToAdmin }) {
  const [flat, setFlat]         = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const VALID_FLATS = [
    '101','102','103','104','105','106','107','108','109','110',
    '201','202','203','204','205','206','207','208','209','210',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!flat.trim())     { setError('Please enter your flat number.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setLoading(true);
    setTimeout(() => {
      if (VALID_FLATS.includes(flat.trim()) && password === '1234') {
        onLogin(flat.trim());
      } else if (!VALID_FLATS.includes(flat.trim())) {
        setError('Flat number not found in this society.');
        setLoading(false);
      } else {
        setError('Incorrect password. Use demo password: 1234');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-teal-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Top banner */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-8 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-white font-black text-xl">Sunrise Apartments</h1>
            <p className="text-teal-100 text-sm mt-1">Resident Portal · Kolkata</p>
          </div>

          <div className="px-8 py-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-slate-800">Resident Login</h2>
              <p className="text-slate-500 text-sm mt-1">View your dues, payments & receipts</p>
            </div>

            {/* Demo hint */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-6">
              <p className="text-xs font-semibold text-teal-700 mb-1">Demo — Try any flat</p>
              <p className="text-xs text-teal-600">Flat number: <strong>101–210</strong> &nbsp;·&nbsp; Password: <strong>1234</strong></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Flat number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Flat Number</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. 101"
                    value={flat}
                    onChange={e => setFlat(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  />
                </div>
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
                    className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all shadow-sm disabled:opacity-70 mt-2"
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

            {/* Back to admin */}
            <button
              onClick={onBackToAdmin}
              className="w-full flex items-center justify-center gap-2 mt-4 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Admin Login
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">Society Management System · Demo v1.0</p>
      </div>
    </div>
  );
}
