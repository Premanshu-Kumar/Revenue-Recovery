import React from 'react';
import { Settings, ShieldCheck, DollarSign, Bell, Palette, Sparkles, CheckCircle2 } from 'lucide-react';
import { ThemeSelector } from '../components/common/ThemeSelector';
import { useTheme } from '../context/ThemeContext';

export function SettingsPage() {
  const { theme, currentThemeId, setTheme, availableThemes } = useTheme();

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl mx-auto font-['Manrope'] text-slate-800">
      <div className="pb-2 border-b border-slate-200/80">
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
          <span>Platform Customization & Governance</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Settings & Appearance</h1>
        <p className="text-xs text-slate-500 mt-1 font-normal">
          Configure visual themes, autonomous recovery ceilings, human approval thresholds, and dunning rules.
        </p>
      </div>

      <div className="space-y-6">
        {/* Color Theme Selector Section */}
        <div className="p-6 rounded-3xl glass-ltx-panel border border-white/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div className="flex items-center space-x-2.5">
              <Palette className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Webpage Color Scheme & Theme</h3>
                <p className="text-[11px] text-slate-500">Select your preferred white frosted glass color scheme across all dashboards, charts, and buttons.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold border border-slate-200 bg-white/80 text-slate-800 shadow-xs">
              Active: {theme.name}
            </span>
          </div>

          <ThemeSelector variant="pills" />
        </div>

        {/* Policy Guardrails Config */}
        <div className="p-6 rounded-3xl glass-ltx-panel border border-white/90 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-extrabold text-slate-900">Deterministic Financial Thresholds</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs">
              <div>
                <div className="font-bold text-slate-900">Full Autonomous Recovery Ceiling</div>
                <div className="text-[11px] text-slate-500">Transactions below this amount execute automatically without human sign-off.</div>
              </div>
              <div className="font-mono font-extrabold text-emerald-600 text-sm">₹10,000</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs">
              <div>
                <div className="font-bold text-slate-900">Limited Autonomous Range</div>
                <div className="text-[11px] text-slate-500">Permitted for standard payment retries and predefined email reminders.</div>
              </div>
              <div className="font-mono font-extrabold text-indigo-600 text-sm">₹10,000 – ₹50,000</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs">
              <div>
                <div className="font-bold text-slate-900">Human Approval Mandatory Ceiling</div>
                <div className="text-[11px] text-slate-500">Any case exceeding this value strictly blocks autonomous dispatch until CFO approval.</div>
              </div>
              <div className="font-mono font-extrabold text-rose-600 text-sm">&gt; ₹50,000</div>
            </div>
          </div>
        </div>

        {/* Stopping Rules Config */}
        <div className="p-6 rounded-3xl glass-ltx-panel border border-white/90 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-4">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-extrabold text-slate-900">Dunning Stopping Rules & Frequency Limits</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs">
              <div>
                <div className="font-bold text-slate-900">Maximum Payment Retry Attempts</div>
                <div className="text-[11px] text-slate-500">Exceeding this limit freezes gateway retries to protect merchant reliability score.</div>
              </div>
              <div className="font-mono font-extrabold text-slate-900 text-sm">3 Attempts</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs">
              <div>
                <div className="font-bold text-slate-900">Maximum Communication Outreach</div>
                <div className="text-[11px] text-slate-500">Caps total email and WhatsApp messages per overdue cycle to avoid spam penalties.</div>
              </div>
              <div className="font-mono font-extrabold text-slate-900 text-sm">3 Messages</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs">
              <div>
                <div className="font-bold text-slate-900">Active Dispute Outreach Freeze</div>
                <div className="text-[11px] text-slate-500">Immediately pauses all automated recovery outreach when customer opens a billing inquiry.</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200 shadow-xs">ENFORCED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
