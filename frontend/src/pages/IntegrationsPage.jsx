import React from 'react';
import { Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export function IntegrationsPage() {
  const integrations = [
    { name: 'Razorpay Payment Gateway & Subscriptions', status: 'Connected', desc: 'Real-time webhook ingestion for payments, refunds, and mandate failures.', icon: '💳' },
    { name: 'WhatsApp Business API (Direct UPI Links)', status: 'Connected', desc: 'Interactive conversational payment collection with authenticated Razorpay payment links.', icon: '💬' },
    { name: 'Razorpay Invoicing & B2B Billing Portal', status: 'Connected', desc: 'Automatic invoice aging ingestion and promise-to-pay settlement reconciliation.', icon: '🧾' },
    { name: 'Salesforce / HubSpot CRM Sync', status: 'Active', desc: 'Two-way synchronization of high-value account escalations and dispute flags.', icon: '🏢' },
    { name: 'Slack / Teams Executive Escalation Webhooks', status: 'Connected', desc: 'Instant alerts sent to CFO channel whenever high-value recovery approvals are required.', icon: '🔔' }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-['Manrope'] text-slate-800">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">FinTech Integrations & Data Sources</h1>
        <p className="text-xs text-slate-500 mt-1 font-normal">
          Connectors powering automated risk detection, payment retries, and multi-channel customer dunning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item, idx) => (
          <div key={idx} className="p-6 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-2xl">{item.icon}</div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold font-mono shadow-xs">
                  {item.status}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{item.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-200/70 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono font-medium">Telemetry Active</span>
              <button className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer transition-colors">
                <span>Manage Webhooks</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
