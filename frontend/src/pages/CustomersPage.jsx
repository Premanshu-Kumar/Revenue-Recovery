import React, { useState, useEffect } from 'react';
import { Search, Building, User, ChevronRight, CheckCircle2, AlertOctagon, TrendingUp } from 'lucide-react';
import { api } from '../api/client';

export function CustomersPage({ onSelectCustomer, onSelectCase }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCust, setSelectedCust] = useState(null);
  const [custDetail, setCustDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('ALL');

  useEffect(() => {
    loadCustomers();
  }, [segmentFilter]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers({ limit: 40, segment: segmentFilter, search });
      setCustomers(res.items || []);
      if (res.items && res.items.length > 0 && !selectedCust) {
        handleCustomerClick(res.items[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = async (id) => {
    setSelectedCust(id);
    try {
      const detail = await api.getCustomerDetail(id);
      setCustDetail(detail);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-['Manrope'] text-slate-800">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer 360 Portfolio</h1>
        <p className="text-xs text-slate-500 mt-1 font-normal">
          Comprehensive customer profiles, payment reliability scores, LTV, and active recovery risk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer List (5 cols) */}
        <div className="lg:col-span-5 glass-ltx-panel rounded-2xl border border-white/90 p-4 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadCustomers()}
                placeholder="Search company (e.g. ABC Technologies)..."
                className="w-full bg-white/80 border border-slate-200/90 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-xs"
              />
            </div>
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="bg-white/80 border border-slate-200/90 text-xs text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-xs cursor-pointer"
            >
              <option value="ALL">All Segments</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Mid-Market">Mid-Market</option>
              <option value="SMB">SMB</option>
              <option value="Startup">Startup</option>
            </select>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => handleCustomerClick(c.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedCust === c.id
                    ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs'
                    : 'bg-white/60 border-slate-200/70 hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 truncate">{c.company}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    c.customer_health === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {c.customer_health}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>LTV: ₹{c.lifetime_value.toLocaleString('en-IN')}</span>
                  <span>Reliability: {Math.round(c.payment_success_rate * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Detail (7 cols) */}
        <div className="lg:col-span-7 glass-ltx-panel rounded-2xl border border-white/90 p-6 space-y-6 shadow-sm">
          {custDetail ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{custDetail.customer.company}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Contact: {custDetail.customer.name} • {custDetail.customer.email || 'billing@domain.com'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 shadow-xs">
                  {custDetail.customer.segment} Segment
                </span>
              </div>

              {/* Financial KPIs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Lifetime Value</span>
                  <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                    ₹{custDetail.customer.lifetime_value.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Revenue Recovered</span>
                  <div className="text-base font-extrabold text-emerald-600 font-mono mt-0.5">
                    ₹{custDetail.total_revenue_recovered.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Payment Success</span>
                  <div className="text-base font-extrabold text-indigo-600 font-mono mt-0.5">
                    {Math.round(custDetail.customer.payment_success_rate * 100)}%
                  </div>
                </div>
              </div>

              {/* Active Recovery Cases */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recovery Cases ({custDetail.cases?.length || 0})
                </h3>
                {custDetail.cases?.length === 0 ? (
                  <p className="text-xs text-slate-500">No active recovery cases for this customer.</p>
                ) : (
                  <div className="space-y-2">
                    {custDetail.cases.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => onSelectCase(c.id)}
                        className="p-3 rounded-xl bg-white/70 hover:bg-white border border-slate-200/80 shadow-2xs cursor-pointer flex items-center justify-between transition-all"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 font-mono">{c.case_number}</div>
                          <div className="text-[11px] text-slate-500">
                            Exp: ₹{c.expected_recovery?.toLocaleString('en-IN')} • Prob: {Math.round((c.probability || 0.8) * 100)}%
                          </div>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                          <div className="text-xs font-extrabold text-emerald-600 font-mono">
                            ₹{c.amount?.toLocaleString('en-IN')}
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-medium">Select a customer to view 360 profile.</div>
          )}
        </div>
      </div>
    </div>
  );
}
