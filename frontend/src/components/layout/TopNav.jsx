import React from 'react';
import {
  Search,
  Sparkles,
  Play,
  RotateCcw,
  Building2,
  ShieldCheck,
  LogOut,
  User,
  Palette
} from 'lucide-react';
import { ThemeSelector } from '../common/ThemeSelector';
import { useTheme } from '../../context/ThemeContext';

export function TopNav({
  currentUser,
  onOpenSearch,
  onOpenAI,
  onOpenSimulation,
  onResetDemo,
  isResetting,
  onLogout,
  onNavigate
}) {
  const { theme } = useTheme();

  return (
    <header
      className="h-16 px-6 flex items-center justify-between sticky top-0 z-20 border-b border-slate-200/80 font-['Manrope'] shadow-[0_4px_20px_rgba(15,23,42,0.03)]"
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
      }}
    >
      {/* Left Workspace Indicator */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full glass-ltx-track border border-white/90 bg-white/70 text-xs font-medium text-slate-700 shadow-sm">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Production Hub: <strong className="text-slate-900 font-bold">Razorpay Cloud India</strong></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>

        <div className="hidden xl:flex items-center space-x-1.5 text-[11px] font-medium text-slate-600 px-2.5 py-1.5 rounded-full glass-ltx-track border border-white/90 bg-white/70 shadow-sm">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Policy Engine Active (&lt;₹50k Auto, &gt;₹50k Approval)</span>
        </div>
      </div>

      {/* Center Search / Command K Bar */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2 rounded-full glass-ltx-track border border-white/90 bg-white/70 text-slate-500 hover:text-slate-900 hover:bg-white/90 hover:border-slate-300 text-xs transition-all duration-300 group shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
            <span>Search customers, invoices, cases...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 bg-slate-100/90 rounded-md border border-slate-200 shadow-xs">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center space-x-2.5">
        {/* Dynamic Theme Color Picker */}
        <ThemeSelector />

        {/* Global AI Assistant Trigger */}
        <button
          onClick={onOpenAI}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full glass-ltx-track border border-white/90 bg-white/80 text-slate-700 hover:text-slate-900 hover:bg-white hover:border-slate-300 text-xs font-semibold transition-all duration-300 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Run Demo Simulation Button */}
        <button
          onClick={onOpenSimulation}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all duration-300 shadow-sm hover:shadow cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current text-white" />
          <span>Run Batch</span>
        </button>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          title="Reset dataset to initial state"
          className="p-2 rounded-full glass-ltx-track border border-white/90 bg-white/80 text-slate-500 hover:text-slate-800 hover:bg-white text-xs transition-all duration-300 disabled:opacity-40 shadow-sm"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-slate-900' : ''}`} />
        </button>

        {/* User Account / Logout */}
        <div className="flex items-center pl-2.5 ml-0.5 border-l border-slate-200/80">
          <button
            onClick={onLogout}
            title={`Logged in as ${currentUser?.name || 'Premanshu Kumar'}. Click to switch identity or log out.`}
            className="flex items-center space-x-2 p-1 pl-2 rounded-full glass-ltx-track border border-white/90 bg-white/80 text-slate-700 hover:text-slate-900 hover:bg-white transition-all duration-300 text-xs font-semibold group shadow-sm"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white bg-slate-900 shadow-sm">
              {currentUser?.avatar || 'PK'}
            </div>
            <span className="hidden lg:inline text-xs font-bold text-slate-800">{currentUser?.name?.split(' ')[0] || 'Premanshu'}</span>
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}
