import React from 'react';
import {
  LayoutDashboard,
  Target,
  Sparkles,
  Users,
  CreditCard,
  Receipt,
  Layers,
  BarChart3,
  ShieldCheck,
  Cpu,
  Settings,
  Zap,
  TrendingUp,
  FolderTree,
  ChevronDown,
  Globe,
  LogIn,
  LogOut,
  Palette
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Sidebar({ currentView, setCurrentView, currentUser, onLogout, pendingApprovalsCount = 0 }) {
  const { theme } = useTheme();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'recovery',
      label: 'Recovery',
      icon: Target,
      subItems: [
        { id: 'opportunities', label: 'Opportunities', badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null },
        { id: 'cases', label: 'All Cases' },
        { id: 'campaigns', label: 'Campaigns' },
      ],
    },
    { id: 'agent', label: 'AI Recovery Agent', icon: Sparkles, highlight: true },
    { id: 'landing', label: 'Executive Platform', icon: Globe },
    { id: 'login', label: 'Login & Identity', icon: LogIn },
    { id: 'customers', label: 'Customers 360', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'receivables', label: 'Receivables & Aging', icon: Receipt },
    { id: 'analytics', label: 'Executive Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
    { id: 'integrations', label: 'Integrations', icon: Cpu },
    { id: 'settings', label: 'Settings & Themes', icon: Settings },
  ];

  return (
    <aside
      className="w-64 flex flex-col justify-between select-none h-screen sticky top-0 z-30 font-['Manrope'] border-r border-slate-200/80 shadow-[4px_0_24px_rgba(15,23,42,0.03)]"
      style={{
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
      }}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200/70">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('overview')}>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-[15px]">RecoverAI</span>
                <span className="text-[9px] uppercase font-semibold tracking-wider px-1.5 py-[1px] rounded-full border border-slate-200 text-slate-600 bg-slate-100/90 shadow-sm">
                  Track 03
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">
                Autonomous Revenue Agent
              </p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.subItems && item.subItems.some((s) => s.id === currentView));

            if (item.subItems) {
              return (
                <div key={item.id} className="pt-3">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase flex items-center justify-between">
                    <span>{item.label}</span>
                  </div>
                  <div className="space-y-0.5 mt-1 pl-1">
                    {item.subItems.map((sub) => {
                      const isSubActive = currentView === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setCurrentView(sub.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
                            isSubActive
                              ? 'text-slate-900 font-bold bg-white/95 border border-white shadow-[0_4px_14px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)]'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.4)]' : 'bg-slate-300'}`} />
                            <span>{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-slate-900 font-bold bg-white/95 border border-white shadow-[0_4px_14px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)]'
                    : item.highlight
                    ? 'text-indigo-900 font-semibold bg-indigo-50/70 border border-indigo-200/70 hover:bg-indigo-100/70 hover:text-indigo-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-600' : item.highlight ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User / Workspace Footer */}
      <div className="p-3 border-t border-slate-200/70">
        <div className="p-2.5 rounded-2xl glass-ltx-track border border-white/90 bg-white/80 flex items-center justify-between group shadow-sm">
          <div
            className="flex items-center space-x-2.5 overflow-hidden cursor-pointer"
            onClick={onLogout}
            title="Click to switch identity or log in as a different user"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white bg-slate-900 border border-white/60 shadow-sm shrink-0"
            >
              {currentUser?.avatar || 'PK'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                {currentUser?.name || 'Premanshu Kumar'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate">
                {currentUser?.role || 'CFO • Razorpay FinTech'}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out & Return to Login Screen"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
