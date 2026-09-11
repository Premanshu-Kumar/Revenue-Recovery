import React, { useState, useEffect } from 'react';
import { Target, Plus, Play, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.getCampaigns();
      setCampaigns(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-['Manrope'] text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recovery Campaigns & Workflow Builder</h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Automated dunning orchestrations across Failed Payments, B2B Invoices, Subscriptions, and Checkouts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => (
          <div key={c.id} className="p-6 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold font-mono shadow-xs">
                  {c.status}
                </span>
                <span className="text-xs font-extrabold text-indigo-600 font-mono">
                  {c.recovery_rate}% Success
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">{c.name}</h3>
                <span className="text-[11px] text-slate-500 font-mono font-medium">{c.type}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70">
                <div className="p-2.5 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">At Risk</span>
                  <div className="text-sm font-extrabold text-rose-600 font-mono mt-0.5">
                    ₹{c.revenue_at_risk.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Recovered</span>
                  <div className="text-sm font-extrabold text-emerald-600 font-mono mt-0.5">
                    ₹{c.revenue_recovered.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Workflow Stepper */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-600">Intervention Sequence:</div>
                {c.workflow_steps?.map((ws, i) => (
                  <div key={i} className="flex items-center space-x-2 text-[11px] text-slate-700 p-2 rounded-xl bg-white/60 border border-slate-200/70 shadow-2xs">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                      {ws.step || i + 1}
                    </span>
                    <span className="font-semibold">{ws.action?.replace('_', ' ')}</span>
                    <span className="text-slate-500 text-[10px] ml-auto font-mono">({ws.delay || ws.timing})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono font-medium">{c.total_cases} active cases</span>
              <button className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer transition-colors">
                <span>Configure Steps</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
