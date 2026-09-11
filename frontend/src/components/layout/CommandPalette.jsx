import React, { useState, useEffect } from 'react';
import { Search, X, User, Receipt, FileText, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';

export function CommandPalette({ isOpen, onClose, onSelectCase }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }
    loadInitial();
  }, [isOpen]);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const data = await api.getCases({ limit: 6, sort_by: 'score_desc' });
      setResults(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (val) => {
    setQuery(val);
    if (!val.trim()) {
      loadInitial();
      return;
    }
    setLoading(true);
    try {
      const data = await api.getCases({ search: val, limit: 8 });
      setResults(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 backdrop-blur-md p-4 font-['Manrope']">
      <div className="w-full max-w-2xl bg-white/95 border border-white/90 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200/80 flex items-center space-x-3">
          <Search className="w-5 h-5 text-indigo-600" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search cases, customers (e.g. ABC Technologies), invoice INV-4821..."
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm font-semibold focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500 font-medium">Searching records...</div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 font-medium">No matching revenue opportunities found.</div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {query ? 'Matching Recovery Opportunities' : 'Top Critical Priority Cases'}
              </div>
              {results.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectCase(c.id);
                    onClose();
                  }}
                  className="p-3 rounded-2xl hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono text-xs font-bold border border-indigo-200 shadow-2xs">
                      {c.case_number.substring(0, 4)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <span>{c.customer_company || c.customer_name}</span>
                        <span className="text-xs font-normal text-slate-500 font-mono">({c.case_number})</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {c.source_type.replace('_', ' ')} • Overdue: {c.days_overdue}d • Prob: {Math.round(c.recovery_probability * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-3">
                    <div>
                      <div className="text-sm font-extrabold text-emerald-600 font-mono">
                        ₹{c.amount_at_risk.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Exp: ₹{c.expected_recovery.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 px-4">
          <span>Navigate with mouse or arrow keys</span>
          <span className="font-mono">ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
