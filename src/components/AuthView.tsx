import { useState, FormEvent } from 'react';
import { CarFront, Lock, User, LogIn, Sparkles } from 'lucide-react';
import { HERO_BANNER_IMAGE } from '../lib/investmentEngine';
import { VehicleImage } from './VehicleImage';

interface AuthViewProps {
  onLogin: (
    identifier: string,
    password: string,
  ) => Promise<{ ok: boolean; message: string }>;
  onRegister: (
    name: string,
    phone: string,
    password: string,
    inviteCode?: string,
  ) => Promise<{ ok: boolean; message: string }>;
}

export function AuthView({ onLogin, onRegister }: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'register') {
        const res = await onRegister(name, identifier, password, inviteCode);
        if (!res.ok) setError(res.message);
      } else {
        const res = await onLogin(identifier, password);
        if (!res.ok) setError(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-[#F6F7FA] dark:bg-[#090D16] md:flex md:items-center md:justify-center md:p-6">
      <div className="w-full md:max-w-4xl min-h-screen md:min-h-[580px] grid grid-cols-1 md:grid-cols-12 md:rounded-3xl md:overflow-hidden bg-white dark:bg-[#111827] md:border md:border-[#E6E8EE] md:dark:border-white/[0.08] md:shadow-sm">
        {/* Luxury BE6 Showroom Showcase (Unobstructed car silhouette on mobile, editorial split on desktop) */}
        <div className="md:col-span-5 relative h-[216px] md:h-auto md:min-h-full flex flex-col justify-between p-6 md:p-8 text-white bg-[#090D16]">
          <VehicleImage
            src={HERO_BANNER_IMAGE}
            alt="Mahindra BE6 Luxury Electric SUV"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/35 to-[#090D16]/45 md:via-[#090D16]/45 md:to-[#090D16]/30"
          />

          <div className="relative z-10 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#090D16]/70 backdrop-blur-md border border-white/15 flex items-center justify-center">
              <CarFront className="w-4 h-4 text-[#E08E45]" />
            </span>
            <span className="text-base font-extrabold tracking-tight text-white">
              Mahindra BE6
            </span>
          </div>

          {/* Desktop editorial proposition; kept clean on mobile so the BE6 SUV shines */}
          <div className="relative z-10 hidden md:block space-y-2.5 max-w-xs">
            <p className="text-[11px] font-semibold tracking-wider text-[#E08E45]">
              Electric Fleet Atelier
            </p>
            <h1 className="text-2xl font-extrabold leading-snug text-balance">
              Fleet plans from ₹250. Earn up to ₹5,000.
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              7–30 day cycles · Max 25% daily return · Verified UPI &amp; QR
              settlements
            </p>
          </div>
        </div>

        {/* Unified Single Portal (Seamlessly overlaps mobile hero with clean top sheet) */}
        <div className="md:col-span-7 -mt-6 md:mt-0 relative z-20 rounded-t-[26px] md:rounded-none bg-white dark:bg-[#111827] px-5 pt-6 pb-8 md:p-10 flex flex-col justify-center space-y-5">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
              {mode === 'login'
                ? 'Sign in to Mahindra BE6'
                : 'Create Fleet Account'}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              {mode === 'login'
                ? 'Enter your mobile number or portal ID and password.'
                : 'New investors receive ₹40 welcome credit upon registration.'}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Account Access"
            className="grid grid-cols-2 border-b border-[#E6E8EE] dark:border-white/[0.08]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`min-h-[44px] text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'border-[#0F172A] dark:border-[#E08E45] text-[#0F172A] dark:text-white'
                  : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`min-h-[44px] text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'border-[#0F172A] dark:border-[#E08E45] text-[#0F172A] dark:text-white'
                  : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-name-input"
                  className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full min-h-[48px] pl-10 pr-4 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#B86B28]"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-id-input"
                className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5"
              >
                {mode === 'login'
                  ? 'Mobile Number or Portal ID'
                  : '10-Digit Mobile Number'}
              </label>
              <input
                id="auth-id-input"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  mode === 'login'
                    ? 'Enter 10-digit mobile number or ID'
                    : 'Enter 10-digit mobile number'
                }
                className="w-full min-h-[48px] px-4 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#090D16] text-sm font-mono-tabular text-[#0F172A] dark:text-white placeholder:font-sans placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#B86B28]"
              />
            </div>

            <div>
              <label
                htmlFor="auth-pwd-input"
                className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-pwd-input"
                  type="password"
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full min-h-[48px] pl-10 pr-4 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#B86B28]"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-invite-input"
                  className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5"
                >
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-invite-input"
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BE6K49R0"
                    className="w-full min-h-[46px] pl-10 pr-4 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F8FAFC] dark:bg-[#090D16] text-sm font-mono-tabular uppercase placeholder:normal-case placeholder:font-sans placeholder:text-[#94A3B8] text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B86B28]"
                  />
                </div>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="text-xs font-semibold text-rose-600 dark:text-rose-400"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] text-white dark:text-[#090D16] text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
              </span>
            </button>
          </form>

          {mode === 'login' && (
            <div className="pt-3 border-t border-[#E6E8EE] dark:border-white/[0.08] flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
              <span>Demo investor account</span>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('8571086754');
                  setPassword('123456');
                  setError(null);
                }}
                className="min-h-[36px] font-semibold text-[#B86B28] dark:text-[#E08E45] hover:underline cursor-pointer"
              >
                Fill 8571086754
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
