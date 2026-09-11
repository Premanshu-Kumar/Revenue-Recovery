import React, { useState, useEffect } from 'react';
import { Receipt, AlertTriangle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

export function ReceivablesPage({ onSelectCase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceivables();
  }, []);

  const loadReceivables = async () => {
    setLoading(true);
    try {
      const res = await api.getReceivables();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading receivables data...</div>;
  }

  const { kpis, aging_buckets, promises_to_pay } = data;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-['Manrope'] text-slate-800">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Receivables & Aging Control</h1>
        <p className="text-xs text-slate-500 mt-1 font-normal">
          B2B invoice aging analysis, overdue receivables chasers, and Promise-to-Pay tracking.
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Receivables</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">₹{kpis.total_receivables.toLocaleString('en-IN')}</div>
        </div>
        <div className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Overdue</span>
          <div className="text-2xl font-extrabold text-rose-600 font-mono mt-0.5">₹{kpis.total_overdue.toLocaleString('en-IN')}</div>
        </div>
        <div className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Average Overdue</span>
          <div className="text-2xl font-extrabold text-amber-600 font-mono mt-0.5">{kpis.average_days_overdue} Days</div>
        </div>
        <div className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Broken Promises</span>
          <div className="text-2xl font-extrabold text-indigo-600 font-mono mt-0.5">{kpis.broken_promises_count} High Urgency</div>
        </div>
      </div>

      {/* Aging Buckets Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Aging Buckets Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {aging_buckets.map((b) => (
            <div key={b.key} className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{b.bucket}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  b.risk_level === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  b.risk_level === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  b.risk_level === 'MEDIUM' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {b.risk_level}
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                ₹{b.amount.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-500 font-mono font-medium">{b.count} invoices</div>
            </div>
          ))}
        </div>
      </div>

      {/* Promise To Pay Tracking Table */}
      <div className="rounded-2xl glass-ltx-panel border border-white/90 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Promise-To-Pay Tracker</h3>
            <p className="text-xs text-slate-500">Customer payment commitments and broken promise escalation signals</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3">Invoice Ref</th>
                <th className="py-3 px-3">Promised Amount</th>
                <th className="py-3 px-3">Promise Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Escalation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 font-medium">
              {promises_to_pay.map((p) => (
                <tr key={p.id} className="hover:bg-white/90 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.customer_company}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">
                    {p.invoice_number}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-extrabold text-slate-900">
                    ₹{p.promised_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">
                    {new Date(p.promise_date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      p.is_broken
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : p.status === 'FULFILLED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {p.is_broken && (
                      <span className="text-[11px] font-bold text-amber-600">
                        ⚡ Upgraded to Critical Priority
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
