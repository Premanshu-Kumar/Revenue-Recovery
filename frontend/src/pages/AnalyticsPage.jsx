import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Sparkles, DollarSign, Clock, Percent, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setAnalytics(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading executive analytics...</div>;
  }

  const { summary, channel_performance, failure_types } = analytics;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-['Manrope'] text-slate-800">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Recovery Analytics & ROI</h1>
        <p className="text-xs text-slate-500 mt-1 font-normal">
          Measured incremental financial lift of autonomous AI interventions compared to baseline naive dunning.
        </p>
      </div>

      {/* AI vs Baseline Primary ROI Comparison Hero */}
      <div className="p-6 rounded-3xl glass-ltx-panel border border-white/90 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>AI Revenue Lift Benchmark</span>
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">RecoverAI vs Standard Baseline Strategy</h2>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-sm border border-emerald-200 shadow-xs">
            +{summary.ai_lift}% Lift
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">RecoverAI Settled</span>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-0.5">
              ₹{summary.revenue_recovered.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Total verified recovery</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Baseline Recovery</span>
            <div className="text-2xl font-extrabold text-slate-700 font-mono mt-0.5">
              ₹{summary.baseline_recovered.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">1 retry + 1 email standard</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Incremental AI Value</span>
            <div className="text-2xl font-extrabold text-indigo-600 font-mono mt-0.5">
              ₹{summary.incremental_recovery.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-indigo-700 font-bold">Direct AI revenue lift</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Recovery ROI</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
              {summary.estimated_roi_multiple}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">Net Gain: ₹{summary.net_ai_gain?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Channel Performance & Failure Type Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Channel Performance (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Recovery Performance by Channel</h3>
          <div className="space-y-3">
            {channel_performance.map((ch, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{ch.channel}</span>
                  <span className="font-extrabold text-emerald-600 font-mono">₹{ch.recovered_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Success Rate: {ch.success_rate}%</span>
                  <span>Avg Resolution: {ch.avg_time_hours}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Failure Type Recovery (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Recovery Rate by Risk Type</h3>
          <div className="space-y-3">
            {failure_types.map((ft, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{ft.type}</span>
                  <span className="font-bold text-indigo-700 font-mono">{ft.recovery_rate}% Recovery</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-600"
                    style={{ width: `${Math.max(10, ft.recovery_rate)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                  <span>At Risk: ₹{ft.amount_at_risk.toLocaleString('en-IN')}</span>
                  <span>Settled: ₹{ft.amount_recovered.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
