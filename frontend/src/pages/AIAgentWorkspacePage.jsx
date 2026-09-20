import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Globe,
  DollarSign,
  Clock,
  User,
  Building,
  CheckCircle,
  Copy,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PriorityBadge, StatusBadge, PolicyBadge, SourceBadge } from '../components/common/Badge';
import { api } from '../api/client';

export function AIAgentWorkspacePage({ selectedCaseId, onCaseChange }) {
  const [caseData, setCaseData] = useState(null);
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [executionState, setExecutionState] = useState(null);

  // Hinglish Generator State
  const [selectedLang, setSelectedLang] = useState('Hinglish'); // English, Hindi, Hinglish
  const [selectedTone, setSelectedTone] = useState('Urgent & Professional');
  const [generatedMessage, setGeneratedMessage] = useState(null);
  const [generatingMsg, setGeneratingMsg] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCaseSelector();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadCaseDetail(selectedCaseId);
    }
  }, [selectedCaseId]);

  const loadCaseSelector = async () => {
    try {
      const res = await api.getCases({ limit: 30, sort_by: 'score_desc' });
      setAllCases(res.items || []);
      if (!selectedCaseId && res.items && res.items.length > 0) {
        // Default to ABC Technologies if present, else first case
        const abc = res.items.find((c) => c.customer_company === 'ABC Technologies');
        const targetId = abc ? abc.id : res.items[0].id;
        onCaseChange(targetId);
        loadCaseDetail(targetId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadCaseDetail = async (id) => {
    setLoading(true);
    setExecutionState(null);
    try {
      const res = await api.getCaseDetail(id);
      setCaseData(res);
      // Auto-fetch communication template
      fetchGeneratedMessage(res.id, selectedLang, selectedTone);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneratedMessage = async (caseId, lang, tone) => {
    setGeneratingMsg(true);
    try {
      const msg = await api.generateMessage({
        case_id: caseId,
        language: lang,
        tone: tone,
        channel: 'WhatsApp',
      });
      setGeneratedMessage(msg);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingMsg(false);
    }
  };

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    if (caseData) {
      fetchGeneratedMessage(caseData.id, lang, selectedTone);
    }
  };

  const handleToneChange = (tone) => {
    setSelectedTone(tone);
    if (caseData) {
      fetchGeneratedMessage(caseData.id, selectedLang, tone);
    }
  };

  const handleApprove = async () => {
    if (!caseData) return;
    try {
      await api.approveCase(caseData.id);
      loadCaseDetail(caseData.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteRecovery = async () => {
    if (!caseData) return;
    setExecuting(true);
    setExecutionState({ step: 1, text: 'Validating policy rules & autonomous guardrails...' });

    await new Promise((r) => setTimeout(r, 600));
    setExecutionState({ step: 2, text: 'Dispatching recovery action via Razorpay Gateway & WhatsApp...' });

    await new Promise((r) => setTimeout(r, 800));
    setExecutionState({ step: 3, text: 'Simulating transaction settlement and customer reconciliation...' });

    try {
      const res = await api.executeCase(caseData.id, {
        action_type: caseData.recommended_action,
        override_policy: true,
      });

      await new Promise((r) => setTimeout(r, 500));
      setExecutionState({ step: 4, text: 'Settlement Confirmed! Revenue Recovered.', success: true });

      if (res.is_recovered) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
      loadCaseDetail(caseData.id);
    } catch (e) {
      console.error(e);
      setExecutionState({ step: 4, text: `Execution paused: ${e.message}`, error: true });
    } finally {
      setExecuting(false);
    }
  };

  const handlePause = async () => {
    if (!caseData) return;
    try {
      await api.pauseCase(caseData.id);
      loadCaseDetail(caseData.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyMessage = () => {
    if (generatedMessage?.body) {
      navigator.clipboard.writeText(generatedMessage.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || !caseData) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-4">
        <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
        <p className="text-sm font-medium">Loading AI Agent Recovery Workspace...</p>
      </div>
    );
  }

  const cust = caseData.customer || {};
  const rec = caseData.recommendations && caseData.recommendations.length > 0 ? caseData.recommendations[0] : null;
  const isRecovered = caseData.status === 'Recovered';
  const isApprovalRequired = caseData.status === 'Approval Required' || caseData.policy_status === 'APPROVAL_REQUIRED';

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-['Manrope'] text-slate-800">
      {/* Workspace Header with Case Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Recovery Agent Control Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold font-mono shadow-xs">
              {caseData.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Explainable AI diagnosis, deterministic policy evaluation, and simulated recovery execution.
          </p>
        </div>

        {/* Case Switcher Dropdown */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-500">Select Case:</span>
          <select
            value={caseData.id}
            onChange={(e) => {
              onCaseChange(e.target.value);
              loadCaseDetail(e.target.value);
            }}
            className="bg-white/90 border border-slate-200/90 text-slate-800 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 shadow-xs max-w-xs truncate cursor-pointer"
          >
            {allCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customer_company || c.customer_name} ({c.case_number} - ₹{c.amount_at_risk.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Customer 360 & Revenue Risk Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Revenue Risk Summary Card */}
          <div className="p-6 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Revenue At Risk
              </span>
              <SourceBadge source={caseData.source_type} />
            </div>

            <div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                ₹{caseData.amount_at_risk.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-rose-600 mt-0.5 font-semibold">
                {caseData.days_overdue} days past scheduled settlement
              </div>
            </div>

            {/* Score & Prob Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/70">
              <div className="p-3 rounded-xl bg-white/70 border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium">ML Recovery Prob.</span>
                <div className="text-xl font-bold text-indigo-600 font-mono mt-0.5">
                  {Math.round(caseData.recovery_probability * 100)}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/70 border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium">Expected Recovery</span>
                <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
                  ₹{caseData.expected_recovery.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs font-bold text-indigo-950">Recovery Score</div>
                <div className="text-[11px] text-indigo-700">Composite priority index</div>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-indigo-700 font-mono">
                  {caseData.recovery_score}
                </span>
                <span className="text-xs text-indigo-400 font-semibold">/100</span>
              </div>
            </div>
          </div>

          {/* Customer 360 Context Card */}
          <div className="p-6 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>Customer 360</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {cust.segment || 'Enterprise'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Company Name</span>
                <span className="font-bold text-slate-900">{cust.company || 'ABC Technologies'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Contact Person</span>
                <span className="font-semibold text-slate-800">{cust.name || 'Rajesh Khanna'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Account Health</span>
                <span className="font-bold text-emerald-600">{cust.customer_health || 'Healthy'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Lifetime Value (LTV)</span>
                <span className="font-bold font-mono text-slate-900">
                  ₹{(cust.lifetime_value || 840000).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Payment Reliability</span>
                <span className="font-bold font-mono text-indigo-600">
                  {Math.round((cust.payment_success_rate || 0.93) * 100)}%
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Avg Settlement Delay</span>
                <span className="font-semibold text-slate-800">{cust.average_payment_delay || 5} days</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Dispute History</span>
                <span className="font-semibold text-slate-700">{cust.dispute_count || 0} disputes</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Diagnosis, Multi-Step Strategy, Policy Check, Action Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Root Cause Diagnosis Card */}
          <div className="p-6 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">AI Root Cause Diagnosis</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Confidence: {Math.round((caseData.root_cause_confidence || 0.91) * 100)}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/70 border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Primary Classification
              </div>
              <div className="text-sm font-bold text-indigo-700 font-mono">
                {caseData.root_cause || 'LATE_B2B_PAYMENT_CYCLE'}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {rec?.diagnosis || 'Client historically settles within standard vendor billing cycles. Zero formal billing disputes reported.'}
              </p>
            </div>

            {/* Supporting Signals */}
            {rec?.supporting_signals && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-600">Observed Supporting Signals:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rec.supporting_signals.map((sig, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs p-2.5 rounded-xl bg-white/60 border border-slate-200/70 text-slate-700 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Multi-Step Strategy & Policy Check */}
          <div className="p-6 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recommended Intervention Sequence</h3>
                <p className="text-xs text-slate-500">Sequential, multi-touch dunning calibrated for maximum conversion</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-white shadow-xs">
                Primary: {caseData.recommended_action.replace('_', ' ')}
              </span>
            </div>

            {/* Workflow steps stepper */}
            {rec?.multi_step_strategy && (
              <div className="space-y-2.5">
                {rec.multi_step_strategy.map((st, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      i === 0
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-bold shadow-xs'
                        : 'bg-white/60 border-slate-200/70 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-xs">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${i === 0 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                        {st.step}
                      </span>
                      <span>{st.action.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono font-medium">{st.timing}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Policy Check Guardrail Banner */}
            <div className={`p-4 rounded-xl border space-y-2 shadow-xs ${
              isApprovalRequired
                ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Deterministic Policy Engine Evaluation</span>
                </span>
                <PolicyBadge status={caseData.policy_status} />
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {caseData.policy_reason || 'Transaction exceeds autonomous recovery threshold (₹50,000). Human approval mandatory.'}
              </p>
            </div>
          </div>

          {/* Hinglish Multi-lingual Message Generator */}
          <div className="p-6 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Multi-Lingual Communication Generator</h3>
              </div>

              {/* Language & Tone Selectors */}
              <div className="flex items-center space-x-2">
                <div className="flex rounded-full bg-white/90 p-0.5 border border-slate-200/90 text-xs shadow-xs">
                  {['English', 'Hindi', 'Hinglish'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLangChange(lang)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        selectedLang === lang ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated Copy Preview Box */}
            <div className="relative p-4 rounded-xl bg-white/80 border border-slate-200/90 text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-line shadow-xs">
              {generatingMsg ? (
                <div className="text-slate-500 py-4 text-center">Generating personalized {selectedLang} message...</div>
              ) : (
                generatedMessage?.body || 'Loading copy...'
              )}

              <button
                onClick={handleCopyMessage}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                title="Copy message to clipboard"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Center Buttons & Live Execution State */}
          <div className="p-6 rounded-2xl glass-ltx-panel border border-white/90 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Execute Intervention</h4>
                <p className="text-xs text-slate-500">Trigger recovery workflow within policy safety limits</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {isApprovalRequired && caseData.status !== 'Approved' && (
                  <button
                    onClick={handleApprove}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    ✓ Grant CFO Approval
                  </button>
                )}

                <button
                  onClick={handleExecuteRecovery}
                  disabled={executing || isRecovered}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md ${
                    isRecovered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRecovered ? 'Revenue Settled & Recovered' : 'Execute Recovery Action'}</span>
                </button>

                <button
                  onClick={handlePause}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 mr-1 inline" />
                  Pause
                </button>
              </div>
            </div>

            {/* Live workflow execution progress bar */}
            {executionState && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 shadow-xs ${
                executionState.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : executionState.error
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-950'
              }`}>
                <div className="flex items-center space-x-2 font-bold">
                  {executionState.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : executing ? (
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : null}
                  <span>{executionState.text}</span>
                </div>
                {executionState.success && (
                  <p className="text-[11px] text-emerald-700 font-mono font-semibold">
                    Successfully recovered ₹{caseData.amount_at_risk.toLocaleString('en-IN')}! Case status updated to RECOVERED and logged into audit trail.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
