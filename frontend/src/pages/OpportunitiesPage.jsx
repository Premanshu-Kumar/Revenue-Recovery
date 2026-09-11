import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { PriorityBadge, StatusBadge, SourceBadge, PolicyBadge } from '../components/common/Badge';
import { api } from '../api/client';

export function OpportunitiesPage({ onSelectCase }) {
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score_desc');

  useEffect(() => {
    loadCases();
  }, [page, statusFilter, priorityFilter, sourceFilter, sortBy]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await api.getCases({
        page,
        limit: 15,
        search,
        status: statusFilter,
        priority: priorityFilter,
        source_type: sourceFilter,
        sort_by: sortBy,
      });
      setCases(res.items || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadCases();
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSourceFilter('ALL');
    setSortBy('score_desc');
    setPage(1);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-['Manrope'] text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <span>Recovery Opportunities & Cases</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full glass-ltx-capsule text-indigo-700 bg-indigo-50/80 border border-indigo-200 font-mono font-bold shadow-xs">
              {total} Cases
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Prioritized revenue opportunities where RecoverAI AI Agent and Policy Engine intervene.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company (ABC Tech), case ID..."
              className="w-full bg-white/80 border border-slate-200/90 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
            />
          </form>

          {/* Priority */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="w-full bg-white/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-xs"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Risk Type */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
              className="w-full bg-white/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-xs"
            >
              <option value="ALL">All Risk Types</option>
              <option value="PAYMENT_FAILURE">Payment Failure</option>
              <option value="OVERDUE_INVOICE">Overdue Invoice</option>
              <option value="SUBSCRIPTION_FAILURE">Subscription Failure</option>
              <option value="CHECKOUT_ABANDONMENT">Checkout Abandonment</option>
              <option value="MANDATE_FAILURE">Mandate Failure</option>
              <option value="PROMISE_TO_PAY">Promise to Pay</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-white/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="Approval Required">Approval Required</option>
              <option value="Detected">Detected</option>
              <option value="Recovery In Progress">In Progress</option>
              <option value="Approved">Approved</option>
              <option value="Recovered">Recovered</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
        </div>

        {/* Sub filter / Sort row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <button
              onClick={() => setSortBy('score_desc')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                sortBy === 'score_desc' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
              }`}
            >
              Recovery Score
            </button>
            <button
              onClick={() => setSortBy('amount_desc')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                sortBy === 'amount_desc' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
              }`}
            >
              Highest Amount
            </button>
            <button
              onClick={() => setSortBy('prob_desc')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                sortBy === 'prob_desc' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
              }`}
            >
              Recovery Prob.
            </button>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-2xl glass-ltx-panel border border-white/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Case / Customer</th>
                <th className="py-3 px-3">Risk Category</th>
                <th className="py-3 px-3">Revenue At Risk</th>
                <th className="py-3 px-3">Recovery Prob.</th>
                <th className="py-3 px-3">Expected Value</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Recommended Intervention</th>
                <th className="py-3 px-3">Policy Check</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
                      <span>Loading recovery cases from engine...</span>
                    </div>
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-500">
                    No recovery cases matched the selected filters.
                  </td>
                </tr>
              ) : (
                cases.map((c) => {
                  const isABC = c.customer_company === 'ABC Technologies' || c.case_number === 'RV-10284';
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCase(c.id)}
                      className={`hover:bg-white/90 cursor-pointer transition-colors ${
                        isABC ? 'bg-indigo-50/50 border-l-2 border-l-indigo-600' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{c.customer_company || c.customer_name}</span>
                          {isABC && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
                              REF SCENARIO
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {c.case_number} • {c.customer_segment}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <SourceBadge source={c.source_type} />
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        ₹{c.amount_at_risk.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-1 font-mono">
                          <span className="font-bold text-indigo-600">
                            {Math.round(c.recovery_probability * 100)}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">
                        ₹{c.expected_recovery.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <div className="flex items-center space-x-1">
                          <span className="font-bold text-slate-900">{c.recovery_score}</span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <PriorityBadge priority={c.priority} />
                      </td>

                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        {c.recommended_action.replace('_', ' ')}
                      </td>

                      <td className="py-3.5 px-3">
                        <PolicyBadge status={c.policy_status} />
                      </td>

                      <td className="py-3.5 px-3">
                        <StatusBadge status={c.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c.id);
                          }}
                          className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          Workspace
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{pages}</strong> ({total} total opportunities)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
