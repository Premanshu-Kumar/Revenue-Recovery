import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, CheckCircle2, User, Sparkles, ChevronRight, X } from 'lucide-react';
import { api } from '../api/client';

export function AuditTrailPage({ onSelectCase }) {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadAudit();
  }, [page, actorFilter]);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditEvents({ page, limit: 20, actor: actorFilter });
      setEvents(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-['Manrope'] text-slate-800">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span>Immutable Audit Trail & Explainability Logs</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-normal">
          Complete cryptographic and operational record of all AI diagnoses, policy checks, CFO approvals, and settlement outcomes.
        </p>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold">Filter Actor:</span>
          {['ALL', 'RecoverAI Agent', 'Policy Engine', 'Premanshu Kumar (CFO)', 'Batch Simulation Engine'].map((act) => (
            <button
              key={act}
              onClick={() => { setActorFilter(act); setPage(1); }}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                actorFilter === act ? 'bg-slate-900 text-white shadow-xs' : 'bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono font-semibold text-slate-500">{total} Total Events Logged</span>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl glass-ltx-panel border border-white/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Actor</th>
                <th className="py-3 px-3">Event Action</th>
                <th className="py-3 px-3">Result</th>
                <th className="py-3 px-3">Reason / Context</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 font-medium">
              {events.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSelectedEvent(e)}
                  className="hover:bg-white/90 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {new Date(e.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-indigo-700">
                    {e.case_number || '—'}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-900">{e.actor}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-800">
                    {e.action}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {e.result || 'RECORDED'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                    {e.reason}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">
                      Inspect Trace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Explainability Drawer / Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-white/95 border border-white/90 rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Audit Event Explainability Trace</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Actor & Action</span>
                <div className="text-sm font-extrabold text-slate-900">{selectedEvent.actor}</div>
                <div className="text-xs text-indigo-600 font-bold">{selectedEvent.action}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Decision Rationale</span>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedEvent.reason}</p>
              </div>

              {selectedEvent.audit_metadata && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Payload Metadata</span>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 overflow-x-auto">
                    {JSON.stringify(selectedEvent.audit_metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
