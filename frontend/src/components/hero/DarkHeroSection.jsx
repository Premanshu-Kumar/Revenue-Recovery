import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronDown, LogIn, Sparkles, UserCheck, Target, Cpu, LayoutDashboard } from "lucide-react";
import { ThemeSelector } from "../common/ThemeSelector";

export function Navbar({ onToggleView, onOpenLogin, isAuthenticated }) {
  const handleNavClick = (view) => {
    if (onToggleView) {
      onToggleView(view);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 sm:px-8 py-4 flex items-center justify-between border-b border-slate-200/80 glass-ltx-panel rounded-none">
      {/* Left Section: RecoverAI Brand Logo */}
      <div
        className="flex items-center space-x-3 cursor-pointer group"
        onClick={() => handleNavClick('landing')}
      >
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-['Manrope'] font-extrabold text-slate-900 text-lg tracking-tight">
            RecoverAI
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs">
            Track 03
          </span>
        </div>
      </div>

      {/* Center Section: Navigation Links */}
      <nav className="hidden md:flex items-center gap-7 font-['Manrope']">
        <button
          onClick={() => handleNavClick('overview')}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
        >
          <span>Recovery Platform</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
        <button
          onClick={() => handleNavClick('opportunities')}
          className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
        >
          Opportunities
        </button>
        <button
          onClick={() => handleNavClick('agent')}
          className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
        >
          AI Recovery Agent
        </button>
        <button
          onClick={() => handleNavClick('analytics')}
          className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
        >
          Analytics & ROI
        </button>
      </nav>

      {/* Right Section: Theme Selector + Sign In + Get Started Button */}
      <div className="flex items-center gap-3 font-['Manrope']">
        <ThemeSelector />

        {onOpenLogin && !isAuthenticated && (
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full transition-all cursor-pointer border border-slate-200/90 shadow-2xs"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign In</span>
          </button>
        )}

        <button
          onClick={() => handleNavClick('overview')}
          className="bg-slate-900 text-white rounded-full px-4 py-1.5 font-bold text-xs hover:bg-slate-800 transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
        >
          <span>{isAuthenticated ? 'Open Dashboard →' : 'Launch Platform →'}</span>
        </button>
      </div>
    </header>
  );
}

export function DarkHeroSection({ onOpenApp, onNavigateState, isAuthenticated }) {
  const [hoverIndex, setHoverIndex] = useState(0);

  const STATES = [
    { key: 'identity', name: 'Identity', target: 'login', icon: UserCheck, desc: 'CFO, RevOps & Finance Roles' },
    { key: 'opportunities', name: 'Opportunities', target: 'opportunities', icon: Target, desc: 'Prioritized Cases & Pipeline' },
    { key: 'agent', name: 'AI Recovery Agent', target: 'agent', icon: Cpu, desc: 'Autonomous Diagnostic & Intervention' },
    { key: 'overview', name: 'Overview', target: 'overview', icon: LayoutDashboard, desc: 'Executive Platform KPIs' },
  ];

  const capsulePositions = {
    0: { left: '-4px', width: 'calc(20% + 4px)' },
    1: { left: '20%', width: '20%' },
    2: { left: '40%', width: '20%' },
    3: { left: '60%', width: '20%' },
    4: { left: '80%', width: 'calc(20% + 4px)' },
  };

  const handlePointerMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--glass-x', `${x.toFixed(1)}%`);
    el.style.setProperty('--glass-y', `${y.toFixed(1)}%`);
  };

  const handleStateClick = (stateItem) => {
    if (onNavigateState) {
      onNavigateState(stateItem.target);
    } else if (onOpenApp) {
      onOpenApp();
    }
  };

  return (
    <section
      className="relative w-full min-h-screen h-[100dvh] text-slate-800 overflow-hidden select-none font-['Manrope'] flex flex-col justify-between"
      style={{
        background: 'radial-gradient(120% 120% at 50% -10%, #ffffff 0%, #f4f6fb 40%, #e8edf5 100%)'
      }}
    >
      {/* Daylight decorative atmospheric background glows for glass refraction */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-blue-200/25 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-indigo-200/20 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed top-1/3 left-1/3 w-[600px] h-[600px] bg-sky-100/30 rounded-full blur-[150px] pointer-events-none -z-0" />

      {/* Hero Content - Centered */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12 text-center max-w-5xl mx-auto space-y-8">
        
        {/* Top Tag & Title */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/90 text-xs font-bold text-indigo-900 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Autonomous AI Revenue Recovery Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08] drop-shadow-sm">
            Autonomous Revenue Recovery
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base font-medium leading-relaxed text-slate-600 drop-shadow-2xs">
            Deterministic policy guardrails and autonomous AI agent interventions to salvage dropped checkout flows, failed payments, and overdue B2B receivables in real time.
          </p>
        </div>

        {/* Interactive Frosted Glass State Selector Controller */}
        <div className="w-full max-w-3xl pt-2">
          <div
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIndex(0)}
            className="relative w-full h-[72px] z-20"
          >
            {/* Rear Glass Track */}
            <div className="absolute top-[4px] left-0 w-full h-[64px] rounded-full glass-ltx-track pointer-events-none transition-all duration-700" />

            {/* Foreground Sliding Capsule */}
            <div
              style={capsulePositions[hoverIndex]}
              className="absolute -top-[1px] h-[72px] rounded-full glass-ltx-capsule pointer-events-none transition-all duration-400 ease-out"
            />

            {/* Five Responsive Interactive Cells */}
            <div className="absolute inset-0 grid grid-cols-5 items-center z-10">
              {/* Cell 0: Prompt Label */}
              <div
                className={`flex items-center justify-center h-full px-2 text-xs sm:text-sm font-extrabold tracking-tight text-slate-800 transition-opacity duration-300 ${
                  hoverIndex !== 0 ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <span>Select State &rarr;</span>
              </div>

              {/* Cells 1 to 4: States (Identity, Opportunities, AI Recovery Agent, Overview) */}
              {STATES.map((st, idx) => {
                const cellIndex = idx + 1;
                const isHovered = hoverIndex === cellIndex;

                return (
                  <button
                    key={st.key}
                    onPointerEnter={() => setHoverIndex(cellIndex)}
                    onClick={() => handleStateClick(st)}
                    title={st.desc}
                    className={`flex items-center justify-center h-full px-2 text-xs sm:text-sm font-bold tracking-tight transition-all duration-300 rounded-full cursor-pointer outline-none ${
                      isHovered
                        ? 'text-slate-950 font-extrabold scale-[1.03]'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{st.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium mt-2">
            Click any section above to navigate directly into the platform workspace.
          </p>
        </div>

        {/* Direct Floating Shortcut Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (onNavigateState) onNavigateState('overview');
              else if (onOpenApp) onOpenApp();
            }}
            className="px-7 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm hover:scale-105 transition-all shadow-xl flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Launch RecoverAI Executive Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-6 text-center border-t border-slate-200/70 glass-ltx-panel rounded-none text-xs text-slate-500 font-medium">
        <span>RecoverAI • Razorpay Track 03 Platform • Developed for Premanshu Kumar</span>
      </footer>
    </section>
  );
}
