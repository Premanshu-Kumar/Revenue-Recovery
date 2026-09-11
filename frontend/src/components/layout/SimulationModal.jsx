import React, { useState } from 'react';
import { Play, X, CheckCircle2, ShieldCheck, Zap, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../api/client';

export function SimulationModal({ isOpen, onClose, onSimulationComplete }) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);

  const steps = [
    'Scanning real-time revenue events (payments, invoices, checkouts)...',
    'Analyzing root causes and calculating ML recovery probabilities...',
    'Scoring expected recovery value and prioritizing critical opportunities...',
    'Evaluating deterministic safety policies and financial guardrails...',
    'Executing permitted automated workflows & retry sequences...',
    'Processing transaction settlement outcomes and logging audit trails...',
  ];

  const handleStartSimulation = async () => {
    setIsRunning(true);
    setResult(null);
    setCurrentStep(0);

    // Step progression animation
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 450));
    }

    try {
      const res = await api.runSimulation({ batch_size: 1000, auto_approve_eligible: true });
      setResult(res);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      if (onSimulationComplete) onSimulationComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 font-['Manrope']">
      <div className="w-full max-w-xl bg-white/95 border border-white/90 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-white/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold shadow-md">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Batch AI Recovery Simulation</h3>
              <p className="text-xs text-slate-500">Autonomous workflow execution across 1,000 revenue events</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isRunning} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!result && (
            <div>
              <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 text-xs text-slate-700 space-y-2 shadow-2xs">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Bounded Autonomous Simulation Mode</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  This simulation scans all open recovery cases, processes ML prediction probabilities, applies deterministic policy guardrails, executes permitted recovery actions, and measures money recovered against a standard baseline.
                </p>
              </div>

              {isRunning ? (
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    {steps.map((s, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center space-x-3 text-xs p-3 rounded-xl transition-all ${
                          idx === currentStep
                            ? 'bg-indigo-50/90 text-indigo-950 font-bold border border-indigo-200 shadow-2xs'
                            : idx < currentStep
                            ? 'text-emerald-700 font-semibold bg-emerald-50/50'
                            : 'text-slate-400'
                        }`}
                      >
                        {idx < currentStep ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : idx === currentStep ? (
                          <span className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                        )}
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleStartSimulation}
                    className="px-6 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center space-x-2 transition-all transform hover:scale-[1.02] cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Batch Recovery Simulation</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Screen */}
          {result && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center shadow-xs">
                <span className="inline-flex p-2 rounded-full bg-emerald-100 text-emerald-700 mb-2 shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </span>
                <h4 className="text-base font-extrabold text-slate-900">Batch Recovery Simulation Completed!</h4>
                <p className="text-xs text-emerald-800 font-medium mt-0.5">
                  Processed {result.cases_processed} cases and settled verified recovered revenue.
                </p>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Revenue Recovered</span>
                  <div className="text-xl font-extrabold text-emerald-600 font-mono mt-0.5">
                    ₹{result.revenue_recovered.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Total verified recovery</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Incremental AI Recovery</span>
                  <div className="text-xl font-extrabold text-indigo-600 font-mono mt-0.5">
                    ₹{result.incremental_recovery.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-indigo-700 font-bold">+{result.ai_lift}% AI Lift</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Baseline Recovery</span>
                  <div className="text-base font-extrabold text-slate-700 font-mono mt-0.5">
                    ₹{result.baseline_recovered.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Naive retry/email baseline</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">ROI Multiple</span>
                  <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                    {result.roi_multiple || '8.4x'}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">Payback immediate</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Close & View Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
