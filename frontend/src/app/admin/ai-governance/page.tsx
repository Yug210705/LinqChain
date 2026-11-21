'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Brain,
  Shield,
  Sliders,
  DollarSign,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Cpu,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAdminSupplyChainStore, AiGovernanceConfig } from '@/stores/useAdminSupplyChainStore';

export default function AiGovernanceAdminPage() {
  const { aiGovernance, updateAiGovernance, addAuditEvent } = useAdminSupplyChainStore();

  const [form, setForm] = useState<AiGovernanceConfig>({ ...aiGovernance });
  const [saved, setSaved] = useState(false);

  // Live Scenario Simulation state
  const [testCost, setTestCost] = useState(48000);
  const [testDelayDays, setTestDelayDays] = useState(2.5);
  const [testConfidence, setTestConfidence] = useState(88);

  const handleSave = () => {
    updateAiGovernance(form);
    addAuditEvent({
      source_portal: 'ADMIN',
      event_type: 'AI_GOVERNANCE_UPDATED',
      actor: 'Admin Chief Risk Officer',
      details: `Updated AI Guardrails: Max auto-approve: $${form.autoApproveLimitUsd.toLocaleString()}, Dual-approval threshold: $${form.dualApprovalThresholdUsd.toLocaleString()}, Model: ${form.activeAiModel}`,
      severity: 'WARNING',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Evaluate test scenario against current parameters
  const evaluateScenario = () => {
    if (testConfidence < form.minConfidenceThreshold) {
      return {
        decision: 'BLOCKED: INSUFFICIENT CONFIDENCE',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        reason: `Confidence (${testConfidence}%) falls below safety floor (${form.minConfidenceThreshold}%). Requires manual operator review.`,
      };
    }
    if (testDelayDays > form.maxLeadTimeDelayDays) {
      return {
        decision: 'ESCALATION REQUIRED',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        reason: `Delay (+${testDelayDays}d) exceeds max allowable lead-time tolerance (+${form.maxLeadTimeDelayDays}d).`,
      };
    }
    if (testCost > form.dualApprovalThresholdUsd) {
      return {
        decision: 'DUAL EXECUTIVE SIGN-OFF REQUIRED',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        reason: `Order value ($${testCost.toLocaleString()}) exceeds the dual-custody threshold ($${form.dualApprovalThresholdUsd.toLocaleString()}).`,
      };
    }
    if (testCost <= form.autoApproveLimitUsd) {
      return {
        decision: 'AUTONOMOUS APPROVAL PERMITTED',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        reason: `Within autonomous auto-spend cap ($${form.autoApproveLimitUsd.toLocaleString()}) and SLAs. S/4HANA PO can be committed immediately.`,
      };
    }
    return {
      decision: 'OPERATOR 1-CLICK CONFIRMATION NEEDED',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      reason: `Between auto-approve cap and dual-approval threshold. Single operator click executes re-routing.`,
    };
  };

  const simulationResult = evaluateScenario();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              AGENTIC AUTONOMY BOUNDARIES
            </span>
            <span className="text-xs text-slate-400 dark:text-neutral-500">ISO 42001 & EU AI Act Guardrails</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 mt-1">
            Autonomous AI Recovery Guardrails
          </h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
            Define strict financial spending limits, delay tolerance thresholds, and model governance for automated supply chain recovery.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-2 transition-all shadow-xs shrink-0"
        >
          <Save className="w-4 h-4" />
          Save & Apply Guardrails
        </button>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>AI recovery parameters updated! Dr. Supply and Operator autonomous agents now operate within these limits.</span>
        </div>
      )}

      {/* Main Form & Simulation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Guardrail Configuration Sliders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Financial & Approval Limits */}
          <div className="border border-slate-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#18181b] p-5 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-neutral-800">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                Financial Expenditure Guardrails
              </h2>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                <span>Autonomous Auto-Approve Spending Cap</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ${form.autoApproveLimitUsd.toLocaleString()} USD
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="5000"
                value={form.autoApproveLimitUsd}
                onChange={(e) => setForm({ ...form, autoApproveLimitUsd: Number(e.target.value) })}
                className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                Recovery rerouting purchase orders below this amount execute without requiring human intervention.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                <span>Dual-Custody Executive Approval Floor</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                  ${form.dualApprovalThresholdUsd.toLocaleString()} USD
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="500000"
                step="10000"
                value={form.dualApprovalThresholdUsd}
                onChange={(e) => setForm({ ...form, dualApprovalThresholdUsd: Number(e.target.value) })}
                className="w-full accent-purple-500 h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                Any expedite or reroute purchase exceeding this value freezes and requires Admin or VP sign-off.
              </p>
            </div>
          </div>

          {/* Card 2: Delay & Model Configuration */}
          <div className="border border-slate-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#18181b] p-5 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-neutral-800">
              <Cpu className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                Cognitive Model & Lead-Time Tolerances
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Primary Reasoning Foundation Model
                </label>
                <select
                  value={form.activeAiModel}
                  onChange={(e) => setForm({ ...form, activeAiModel: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                >
                  <option value="MISTRAL_SMALL">Mistral Small (Low Latency / High Throughput)</option>
                  <option value="CLAUDE_35_SONNET">Claude 3.5 Sonnet (Complex Graph Heuristics)</option>
                  <option value="GPT_4O">GPT-4o Omnimodal Reasoning</option>
                  <option value="LOCAL_HEURISTIC">Local Heuristic Fallback (Zero Egress)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  <span>Max Allowable Schedule Delay</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    +{form.maxLeadTimeDelayDays} Days
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  step="0.5"
                  value={form.maxLeadTimeDelayDays}
                  onChange={(e) => setForm({ ...form, maxLeadTimeDelayDays: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  <span>Minimum AI Confidence Floor</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                    {form.minConfidenceThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="98"
                  step="2"
                  value={form.minConfidenceThreshold}
                  onChange={(e) => setForm({ ...form, minConfidenceThreshold: Number(e.target.value) })}
                  className="w-full accent-blue-500 h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  <span>Scope 3 Carbon Penalty Weight</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {(form.esgWeight * 100).toFixed(0)}% ESG Priority
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={form.esgWeight}
                  onChange={(e) => setForm({ ...form, esgWeight: Number(e.target.value) })}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-neutral-100 block">
                  Direct SAP BAPI Execution
                </span>
                <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                  Allow approved AI recovery plans to write PO adjustments directly to SAP S/4HANA via BAPI_PO_CHANGE.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, autoExecuteSapBapi: !form.autoExecuteSapBapi })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  form.autoExecuteSapBapi ? 'bg-amber-500' : 'bg-slate-300 dark:bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    form.autoExecuteSapBapi ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Guardrail Decision Simulator */}
        <div className="border border-slate-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#18181b] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-neutral-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                Guardrail Decision Sandbox
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2">
              Simulate an incoming disruption rerouting scenario to test how the current policy triggers auto-approval, escalations, or dual sign-off.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">
                  Reroute Cost: ${testCost.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={testCost}
                  onChange={(e) => setTestCost(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">
                  Delay Impact: +{testDelayDays} days
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={testDelayDays}
                  onChange={(e) => setTestDelayDays(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">
                  AI Model Confidence: {testConfidence}%
                </label>
                <input
                  type="range"
                  min="40"
                  max="99"
                  step="1"
                  value={testConfidence}
                  onChange={(e) => setTestConfidence(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Verdict Box */}
            <div className="mt-5 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-500 block mb-1">
                Real-Time Policy Verdict
              </span>
              <div
                className={`px-2.5 py-1 rounded-md text-xs font-bold border inline-block ${simulationResult.color}`}
              >
                {simulationResult.decision}
              </div>
              <p className="text-xs text-slate-600 dark:text-neutral-300 mt-2">
                {simulationResult.reason}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-neutral-800">
            <Link
              href="/admin/portals"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-between"
            >
              <span>View Active Dual-Custody Approval Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
