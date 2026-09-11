import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
  Zap,
  UserCheck,
  Palette,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { ThemeSelector } from '../components/common/ThemeSelector';
import { useTheme } from '../context/ThemeContext';

export function LoginPage({ onLogin, onBackToLanding }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('cfo@recoverai.demo');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState('cfo');
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    {
      id: 'cfo',
      name: 'Premanshu Kumar',
      role: 'CFO • Razorpay FinTech',
      title: 'Executive Financial Authority',
      email: 'cfo@recoverai.demo',
      desc: 'Full autonomous approval & financial risk oversight (>₹50k limits)',
      avatar: 'PK',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      id: 'revops',
      name: 'Rahul Verma',
      role: 'RevOps Lead',
      title: 'Revenue Operations Specialist',
      email: 'revops@recoverai.demo',
      desc: 'Campaign builder, ML funnel & retry sequences',
      avatar: 'RV',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'collections',
      name: 'Aman Gupta',
      role: 'Finance & Collections Lead',
      title: 'Receivables Strategist',
      email: 'finance@recoverai.demo',
      desc: 'B2B overdue receivables & Promise-to-Pay tracking',
      avatar: 'AG',
      color: 'from-blue-600 to-indigo-600',
    },
  ];

  const handleSelectDemoAccount = (acc) => {
    setSelectedRole(acc.id);
    setEmail(acc.email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const activeAcc = demoAccounts.find((a) => a.id === selectedRole) || {
        id: 'custom',
        name: email.split('@')[0] || 'Premanshu Kumar',
        role: 'Authorized Executive',
        email: email,
        avatar: (email[0] || 'U').toUpperCase(),
      };
      setIsLoading(false);
      onLogin(activeAcc);
    }, 500);
  };

  return (
    <div
      className="min-h-screen text-slate-800 flex flex-col justify-between relative overflow-hidden font-['Manrope'] select-none"
      style={{
        background: 'radial-gradient(120% 120% at 50% -10%, #ffffff 0%, #f4f6fb 40%, #e8edf5 100%)'
      }}
    >
      {/* Soft daylight decorative atmospheric background glows for glass refraction */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-blue-200/25 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-indigo-200/20 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed top-1/3 left-1/3 w-[600px] h-[600px] bg-sky-100/30 rounded-full blur-[150px] pointer-events-none -z-0" />

      {/* Top Brand Bar with Navigation & Color Switcher */}
      <header className="px-6 sm:px-10 py-4 flex items-center justify-between relative z-10 border-b border-slate-200/80 glass-ltx-panel rounded-none">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md cursor-pointer transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
              boxShadow: `0 4px 14px var(--color-glow)`,
            }}
            onClick={onBackToLanding}
          >
            <TrendingUp className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                RecoverAI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-xs">
                Track 03
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Autonomous AI Revenue Recovery Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Color Picker */}
          <ThemeSelector />

          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Executive Platform</span>
            </button>
          )}

          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 pl-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SOC2 Type II • 256-Bit TLS</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div
          className="w-full max-w-xl rounded-3xl p-8 sm:p-10 shadow-2xl space-y-7 border border-white/90 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.84)',
            boxShadow: '0 24px 60px -15px rgba(15, 23, 42, 0.08), 0 2px 8px -2px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
          }}
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
              <span>Sign In to Executive Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Recover revenue before it disappears.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Real-time intervention engine for failed payments, checkout drop-offs, subscription dunning, and B2B overdue receivables.
            </p>
          </div>

          {/* Quick Demo Profile Selector */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between px-1">
              <span className="flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Select Demo Identity (1-Click Switch)</span>
              </span>
              <span className="font-semibold text-xs text-indigo-600">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {demoAccounts.map((acc) => {
                const isSelected = selectedRole === acc.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectDemoAccount(acc)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500/80 bg-white shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white/60 border-slate-200/80 hover:bg-white hover:border-slate-300 text-slate-600 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-tr ${acc.color} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        {acc.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{acc.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{acc.role.split('•')[0]}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 mt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active Profile</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Executive Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/80 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">Password / SSO Passkey</label>
                <span className="text-[11px] text-slate-400">Demo Mode (Bypassed)</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/80 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer transform hover:scale-[1.01] shadow-lg"
              style={{
                background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
                boxShadow: `0 8px 25px -4px var(--color-glow)`,
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Authenticating Workspace...</span>
                </>
              ) : (
                <>
                  <span>
                    Sign In to Dashboard as {demoAccounts.find((a) => a.id === selectedRole)?.name || 'Premanshu Kumar'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Policy Guardrail Notice */}
          <div className="p-3.5 rounded-2xl bg-white/60 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between shadow-xs">
            <span className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Bounded AI Autonomy & Approval Limits Enforced</span>
            </span>
            <span className="text-emerald-700 font-semibold">Policy Engine Active</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 text-center text-xs text-slate-500 relative z-10 border-t border-slate-200/70 glass-ltx-panel rounded-none">
        <p>&copy; 2026 RecoverAI • Razorpay Track 03 Platform • Developed for Premanshu Kumar</p>
      </footer>
    </div>
  );
}
