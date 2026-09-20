import React, { useState, useEffect } from 'react';
import { Search, CreditCard, CheckCircle2, AlertOctagon, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/Badge';

export function PaymentsPage({ onSelectCase }) {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('FAILED');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.getPayments({ page, limit: 15, status: statusFilter, search });
      setPayments(res.items || []);
      setSummary(res.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-['Manrope'] text-slate-800">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payment Operations & Failure Triage</h1>
        <p className="text-xs text-slate-500 mt-1 font-normal">
          Gateway transaction stream, decline code root-cause classification, and automated retry sequencers.
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Transactions</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{summary.total_transactions}</div>
          </div>
          <div className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Successful</span>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-0.5">{summary.successful_transactions}</div>
          </div>
          <div className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Failed / At Risk</span>
            <div className="text-2xl font-extrabold text-rose-600 font-mono mt-0.5">{summary.failed_transactions}</div>
          </div>
          <div className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Failure Rate</span>
            <div className="text-2xl font-extrabold text-amber-600 font-mono mt-0.5">{summary.failure_rate}%</div>
          </div>
        </div>
      )}

      {/* Filter row */}
      <div className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500 font-semibold">Filter Status:</span>
          {['ALL', 'FAILED', 'SUCCESS', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st ? 'bg-slate-900 text-white shadow-xs' : 'bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl glass-ltx-panel border border-white/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Failure Reason</th>
                <th className="py-3 px-3">Retries</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-4 text-right">Recovery Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 font-medium">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-white/90 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.customer_company}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-extrabold text-slate-900">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">
                    {p.payment_method}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3.5 px-3 font-mono text-rose-600 text-[11px] font-semibold">
                    {p.failure_reason || '—'}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">
                    {p.retry_count} / 3
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {p.recovery_case_id ? (
                      <button
                        onClick={() => onSelectCase(p.recovery_case_id)}
                        className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                      >
                        Inspect Case
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">No Case</span>
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
