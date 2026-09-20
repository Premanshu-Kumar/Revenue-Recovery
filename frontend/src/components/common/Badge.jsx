import React from 'react';

export function PriorityBadge({ priority }) {
  const styles = {
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200/90 font-bold',
    HIGH: 'bg-amber-50 text-amber-800 border-amber-200/90 font-bold',
    MEDIUM: 'bg-sky-50 text-sky-700 border-sky-200/90 font-bold',
    LOW: 'bg-slate-100 text-slate-600 border-slate-200/90 font-semibold',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border shadow-xs ${styles[priority] || styles.MEDIUM}`}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    Recovered: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    'Approval Required': 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse font-bold',
    'Recovery In Progress': 'bg-sky-50 text-sky-700 border-sky-200 font-semibold',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    Detected: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
    Paused: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    Diagnosing: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    PAST_DUE: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    BROKEN: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs border shadow-xs ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  );
}

export function PolicyBadge({ status }) {
  const styles = {
    ALLOWED: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 font-semibold',
    APPROVAL_REQUIRED: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    BLOCKED: 'bg-rose-50 text-rose-700 border-rose-200/90 font-semibold',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border shadow-xs ${styles[status] || styles.ALLOWED}`}>
      {status === 'APPROVAL_REQUIRED' ? '⚠️ Human Approval Required' : status === 'BLOCKED' ? '🛑 Policy Blocked' : '✓ Permitted (Autonomous)'}
    </span>
  );
}

export function SourceBadge({ source }) {
  const formatSource = (s) => {
    switch (s) {
      case 'PAYMENT_FAILURE': return 'Payment Failure';
      case 'OVERDUE_INVOICE': return 'Overdue Invoice';
      case 'SUBSCRIPTION_FAILURE': return 'Subscription';
      case 'CHECKOUT_ABANDONMENT': return 'Abandoned Cart';
      case 'MANDATE_FAILURE': return 'Mandate Failure';
      case 'PROMISE_TO_PAY': return 'Promise to Pay';
      default: return s;
    }
  };

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100/90 text-slate-700 border border-slate-200/90 shadow-xs">
      {formatSource(source)}
    </span>
  );
}
