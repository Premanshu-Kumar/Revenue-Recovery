import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertOctagon,
  Sparkles,
  Percent,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
  FileText,
  Sliders,
  Filter
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { PriorityBadge, StatusBadge, SourceBadge, PolicyBadge } from '../components/common/Badge';
import { api } from '../api/client';

export function DashboardPage({ onSelectCase, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState('7D');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 bg-slate-200/60 rounded-2xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/60 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="h-72 bg-slate-200/60 rounded-2xl lg:col-span-5"></div>
          <div className="h-72 bg-slate-200/60 rounded-2xl lg:col-span-7"></div>
        </div>
      </div>
    );
  }

  const { kpis, risk_breakdown, funnel, recent_activity, top_opportunities } = data;

  const timeRanges = ['24H', '7D', '30D', '90D', 'YTD'];
  const categories = ['ALL', 'FAILED_PAYMENT', 'INVOICE_OVERDUE', 'CHECKOUT_ABANDONED'];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-['Manrope'] text-slate-800">
      {/* Page Header with Glass Pill Controller */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Revenue Recovery Overview
            </h1>
            <span className="text-xs px-3 py-1 rounded-full glass-ltx-capsule text-emerald-700 bg-emerald-50/80 font-bold tracking-wide border border-emerald-200 shadow-xs">
              Autonomous Model Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1.5 font-normal">
            Autonomous AI detection, deterministic policy guardrails, and verified revenue reclamation.
          </p>
        </div>

        {/* Time Horizon Glass Controller */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="glass-ltx-track flex items-center p-1 rounded-full gap-1 border border-white/90 bg-white/70 shadow-sm">
            {timeRanges.map((range) => {
              const isActive = activeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? 'glass-ltx-capsule text-slate-900 bg-white shadow-sm border border-slate-200/60 font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              );
            })}
          </div>

          {kpis.pending_approvals > 0 && (
            <button
              onClick={() => onNavigate('opportunities')}
              className="flex items-center space-x-2 px-4 py-2 rounded-full glass-ltx-capsule text-amber-800 bg-amber-50/90 border border-amber-300 text-xs font-bold shadow-sm hover:brightness-105 transition-all cursor-pointer"
            >
              <AlertOctagon className="w-4 h-4 animate-bounce text-amber-600" />
              <span>{kpis.pending_approvals} Approvals Required</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hero KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue At Risk"
          value={`₹${kpis.revenue_at_risk.toLocaleString('en-IN')}`}
          subvalue={`${kpis.active_cases} active unresolved events`}
          trend="+4.2% this wk"
          trendType="neutral"
          icon={AlertOctagon}
          tooltip="Total potential revenue slipping away from failed payments, overdue invoices, and abandoned checkouts."
        />

        <MetricCard
          title="Revenue Recovered"
          value={`₹${kpis.revenue_recovered.toLocaleString('en-IN')}`}
          subvalue={`${kpis.recovered_cases} cases successfully settled`}
          trend="+18.4%"
          trendType="positive"
          icon={TrendingUp}
          highlight={true}
          tooltip="Total money successfully won back by RecoverAI autonomous interventions."
        />

        <MetricCard
          title="Incremental AI Recovery"
          value={`₹${kpis.incremental_recovery.toLocaleString('en-IN')}`}
          subvalue={`Baseline: ₹${kpis.baseline_recovered.toLocaleString('en-IN')}`}
          badgeText={`+${kpis.ai_lift}% AI Lift`}
          icon={Sparkles}
          tooltip="Extra revenue recovered above what naive single-retry dunning would have captured."
        />

        <MetricCard
          title="Recovery Rate"
          value={`${kpis.recovery_rate}%`}
          subvalue="Target: >35.0%"
          trend="+6.1% vs avg"
          trendType="positive"
          icon={Percent}
          tooltip="Percentage of at-risk revenue successfully converted to settled funds."
        />
      </div>

      {/* AI Revenue Impact & Funnel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Primary Business Value Hero Card (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-3xl glass-ltx-panel border border-white/90 bg-white/80 flex flex-col justify-between relative overflow-hidden shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>RecoverAI Business Impact</span>
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full glass-ltx-capsule text-slate-600 font-mono border border-slate-200 bg-white/80 shadow-xs">
                Model v1.0 • RF
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  ₹{kpis.revenue_recovered.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  Total Verified Revenue Recovered
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="p-3.5 rounded-2xl glass-ltx-track border border-white/90 bg-white/80 shadow-xs">
                  <div className="text-xl font-extrabold text-indigo-600">
                    ₹{kpis.incremental_recovery.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">Incremental AI Recovery</div>
                </div>

                <div className="p-3.5 rounded-2xl glass-ltx-track border border-white/90 bg-white/80 shadow-xs">
                  <div className="text-xl font-extrabold text-slate-900">
                    +{kpis.ai_lift}%
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">AI Lift vs Baseline</div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed pt-2 font-normal">
                RecoverAI identifies at-risk revenue, predicts payment recovery likelihood, applies deterministic policy guardrails, and automates multi-channel resolution.
              </p>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-200/70 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-500 font-medium">Policy Guardrails:</span>
            <span className="text-slate-800 font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Policy Bound</span>
            </span>
          </div>
        </div>

        {/* Revenue Recovery Funnel (7 cols) */}
        <div className="lg:col-span-7 p-7 rounded-3xl glass-ltx-panel border border-white/90 bg-white/80 flex flex-col justify-between relative overflow-hidden shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Revenue Recovery Funnel</h3>
                <p className="text-xs text-slate-500">Conversion stages from risk detection to settled recovery</p>
              </div>
              <span className="text-xs font-mono text-slate-600 px-2.5 py-1 rounded-full glass-ltx-track border border-white/90 bg-white/80 shadow-xs">
                {kpis.active_cases + kpis.recovered_cases} Total Cases
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              {funnel.map((stage, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{stage.stage}</span>
                    <div className="flex items-center space-x-3 font-mono">
                      <span className="text-slate-500">{stage.count} cases</span>
                      <span className="text-slate-900 font-bold">₹{stage.amount.toLocaleString('en-IN')}</span>
                      <span className="text-indigo-600 font-bold w-12 text-right">{stage.conversion_pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100/90 border border-slate-200/70 overflow-hidden p-[1px]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        idx === funnel.length - 1
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_2px_8px_rgba(99,102,241,0.3)]'
                          : 'bg-gradient-to-r from-blue-400 to-sky-400'
                      }`}
                      style={{ width: `${Math.max(8, stage.conversion_pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/70 mt-5 flex items-center justify-between text-xs text-slate-500 relative z-10">
            <span>Click any funnel stage to inspect case cohort</span>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-slate-800 hover:text-indigo-600 font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>View All Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Highest-Value Opportunities Table */}
      <div className="p-7 rounded-3xl glass-ltx-panel border border-white/90 bg-white/80 space-y-5 shadow-[0_16px_36px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2.5">
              <span>Highest Value Recovery Opportunities</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full glass-ltx-capsule text-indigo-700 bg-indigo-50/80 border border-indigo-200 shadow-xs">
                AI Prioritized
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by Expected Recovery Value (Amount × Recovery Probability) and Urgency.
            </p>
          </div>

          <button
            onClick={() => onNavigate('opportunities')}
            className="text-xs font-bold text-slate-800 hover:text-indigo-600 flex items-center space-x-1 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <span>View all opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto relative z-10 rounded-2xl border border-slate-200/80 bg-white/70 shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80 backdrop-blur-md">
              <tr>
                <th className="py-3.5 px-4">Case / Customer</th>
                <th className="py-3.5 px-3">Risk Type</th>
                <th className="py-3.5 px-3">Revenue at Risk</th>
                <th className="py-3.5 px-3">Recovery Prob.</th>
                <th className="py-3.5 px-3">Expected Value</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">AI Recommendation</th>
                <th className="py-3.5 px-3">Policy Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-medium">
              {top_opportunities.map((c) => {
                const isABC = c.customer_company === 'ABC Technologies' || c.case_number === 'RV-10284';
                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className={`hover:bg-slate-50/90 cursor-pointer transition-colors ${
                      isABC ? 'bg-blue-50/40 border-l-2 border-l-blue-600' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 flex items-center space-x-2">
                        <span>{c.customer_company || c.customer_name}</span>
                        {isABC && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold shadow-xs">
                            CANONICAL
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {c.case_number} • {c.customer_segment}
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <SourceBadge source={c.source_type} />
                    </td>

                    <td className="py-4 px-3 font-mono font-bold text-slate-900">
                      ₹{c.amount_at_risk.toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-3">
                      <div className="flex items-center space-x-1.5 font-mono">
                        <span className="font-bold text-emerald-600">
                          {Math.round(c.recovery_probability * 100)}%
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-3 font-mono font-bold text-indigo-600">
                      ₹{c.expected_recovery.toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-3">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    <td className="py-4 px-3">
                      <span className="text-slate-600 font-medium">
                        {c.recommended_action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <PolicyBadge status={c.policy_status} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c.id);
                        }}
                        className="px-3.5 py-1.5 rounded-full glass-ltx-capsule bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs hover:shadow-sm transition-all border border-slate-200/90 cursor-pointer"
                      >
                        Open Workspace
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Breakdown & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Breakdown by Source (6 cols) */}
        <div className="lg:col-span-6 p-7 rounded-3xl glass-ltx-panel border border-white/90 bg-white/80 space-y-4 shadow-[0_16px_36px_rgba(15,23,42,0.05)] relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Revenue Risk by Category</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono px-2.5 py-0.5 rounded-full glass-ltx-track border border-white/90 bg-white/80 shadow-xs">
              Live Telemetry
            </span>
          </div>

          <div className="space-y-3 relative z-10">
            {risk_breakdown.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl glass-ltx-track border border-white/90 bg-white/80 flex items-center justify-between hover:bg-white hover:border-slate-200 transition-all shadow-xs">
                <div>
                  <div className="text-xs font-bold text-slate-900">{item.display_name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.cases_count} cases detected</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-rose-600">
                    ₹{item.revenue_at_risk.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-indigo-600 font-bold mt-0.5">
                    {item.recovery_rate}% recovered
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Recovery Activity Feed (6 cols) */}
        <div className="lg:col-span-6 p-7 rounded-3xl glass-ltx-panel border border-white/90 bg-white/80 space-y-4 shadow-[0_16px_36px_rgba(15,23,42,0.05)] relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Live Recovery Activity Feed</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono px-2.5 py-0.5 rounded-full glass-ltx-track border border-white/90 bg-white/80 shadow-xs">
              Immutable Stream
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 relative z-10">
            {recent_activity.map((act) => (
              <div key={act.id} className="p-3.5 rounded-2xl glass-ltx-track border border-white/90 bg-white/80 flex items-start space-x-3.5 shadow-xs">
                <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 shrink-0 mt-0.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate">{act.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.reason || act.actor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
