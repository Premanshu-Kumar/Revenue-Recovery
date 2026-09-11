import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

export function MetricCard({
  title,
  value,
  subvalue,
  trend,
  trendType = 'positive',
  icon: Icon,
  tooltip,
  highlight = false,
  badgeText
}) {
  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${
        highlight
          ? 'glass-ltx-capsule bg-white/95 border-white shadow-[0_12px_28px_rgba(15,23,42,0.06),0_2px_6px_rgba(15,23,42,0.04)] ring-1 ring-blue-500/10'
          : 'glass-ltx-panel border-white/90 bg-white/80 hover:bg-white/95 hover:border-white hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]'
      }`}
    >
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-['Manrope']">
            {title}
          </span>
          {tooltip && (
            <div className="group relative cursor-pointer text-slate-400 hover:text-slate-700">
              <Info className="w-3.5 h-3.5" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 text-xs bg-white/95 border border-slate-200 text-slate-700 rounded-lg shadow-xl z-50 pointer-events-none backdrop-blur-md">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={`p-2 rounded-xl border ${
              highlight
                ? 'bg-blue-50 text-blue-600 border-blue-200/80 shadow-xs'
                : 'bg-slate-100/90 text-slate-600 border-slate-200/80'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between relative z-10">
        <div>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900 font-['Manrope']">
            {value}
          </div>
          {subvalue && (
            <div className="text-xs text-slate-500 mt-1 font-medium font-['Manrope']">
              {subvalue}
            </div>
          )}
        </div>

        {trend && (
          <div
            className={`flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
              trendType === 'positive'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : trendType === 'negative'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {trendType === 'positive' ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : trendType === 'negative' ? (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            ) : null}
            {trend}
          </div>
        )}

        {badgeText && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 backdrop-blur-md shadow-xs">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
