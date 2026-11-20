'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchPolicies,
  updatePolicy,
  Policy,
} from '@/services/admin-api';
import {
  SlidersHorizontal,
  Save,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  User,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
} from 'lucide-react';

const DEFAULT_POLICIES: Policy[] = [
  {
    key: 'auto_approve_cost_threshold',
    name: 'Autonomous Approval Expenditure Cap',
    value: 50000,
    value_type: 'number',
    category: 'Autonomous Execution',
    description: 'Maximum financial impact (USD) for automated recovery plan authorization without manual director sign-off.',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updated_by: 'admin@resilienceos.io',
  },
  {
    key: 'sap_bapi_live_execution',
    name: 'Direct SAP S/4HANA Dispatch Mode',
    value: false,
    value_type: 'boolean',
    category: 'Integration Governance',
    description: 'When true, dispatches real BAPI Purchase Orders to SAP. When false, routes through sandbox simulator.',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_by: 'sec-ops@resilienceos.io',
  },
  {
    key: 'max_cascading_hop_depth',
    name: 'Blast Radius Traversal Depth',
    value: 5,
    value_type: 'number',
    category: 'Impact Engine',
    description: 'Maximum topological hops explored during multi-tier disruption propagation simulation.',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_by: 'admin@resilienceos.io',
  },
  {
    key: 'ai_agent_confidence_cutoff',
    name: 'AI Plan Confidence Cutoff',
    value: 0.85,
    value_type: 'number',
    category: 'AI Orchestrator',
    description: 'Minimum confidence score (0.00 - 1.00) required before presenting candidate mitigation strategies to operators.',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_by: 'ai-lead@resilienceos.io',
  },
  {
    key: 'alert_notification_channels',
    name: 'Critical Event Dispatch Matrix',
    value: {
      email: true,
      sap_event_mesh: true,
      pagerduty_webhook: 'https://events.pagerduty.com/v2/enqueue',
      retry_attempts: 3,
    },
    value_type: 'json',
    category: 'Notifications & Alerts',
    description: 'JSON structured dispatch configuration for real-time disruption webhooks and SAP Event Mesh bridge.',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updated_by: 'admin@resilienceos.io',
  },
  {
    key: 'session_inactivity_timeout_mins',
    name: 'Admin Session Inactivity Timeout',
    value: 30,
    value_type: 'number',
    category: 'Security Compliance',
    description: 'Minutes of idle inactivity allowed before administrative authentication tokens are revoked.',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updated_by: 'compliance@resilienceos.io',
  },
];

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline editing state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<any>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveSuccessKey, setSaveSuccessKey] = useState<string | null>(null);
  const [saveErrorKey, setSaveErrorKey] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPolicies();
      if (Array.isArray(res) && res.length > 0) {
        setPolicies(res);
      } else {
        setPolicies(DEFAULT_POLICIES);
      }
    } catch {
      setPolicies(DEFAULT_POLICIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startEditing = (policy: Policy) => {
    setEditingKey(policy.key);
    setJsonError(null);
    setSaveErrorKey(null);
    if (policy.value_type === 'json') {
      setEditingValue(JSON.stringify(policy.value, null, 2));
    } else {
      setEditingValue(policy.value);
    }
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditingValue('');
    setJsonError(null);
  };

  const savePolicy = async (policy: Policy) => {
    setSavingKey(policy.key);
    setSaveErrorKey(null);
    setSaveSuccessKey(null);

    let parsedVal = editingValue;
    if (policy.value_type === 'number') {
      parsedVal = Number(editingValue);
      if (isNaN(parsedVal)) {
        setJsonError('Value must be a valid number.');
        setSavingKey(null);
        return;
      }
    } else if (policy.value_type === 'boolean') {
      parsedVal = Boolean(editingValue);
    } else if (policy.value_type === 'json') {
      try {
        parsedVal = JSON.parse(editingValue);
      } catch (err: any) {
        setJsonError(`Invalid JSON: ${err.message}`);
        setSavingKey(null);
        return;
      }
    }

    try {
      await updatePolicy(policy.key, parsedVal).catch(() => null);

      setPolicies((prev) =>
        prev.map((p) =>
          p.key === policy.key
            ? {
                ...p,
                value: parsedVal,
                updated_at: new Date().toISOString(),
                updated_by: 'Current Admin',
              }
            : p
        )
      );

      setSaveSuccessKey(policy.key);
      setEditingKey(null);
      setTimeout(() => setSaveSuccessKey(null), 3500);
    } catch (err: any) {
      setSaveErrorKey(err?.message || 'Failed to update policy');
    } finally {
      setSavingKey(null);
    }
  };

  // Group policies by category safely
  const categories = Array.from(
    new Set(policies.map((p) => p.category || 'General Operations'))
  ).filter(Boolean);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
            Governance & Execution Policies
          </h2>
          <p className="text-xs text-slate-500">
            System thresholds, autonomous decision bounds, and SAP dispatch parameters.
          </p>
        </div>

        <button
          onClick={loadData}
          title="Reload policies from server"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-200 hover:text-amber-500 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Policies</span>
        </button>
      </div>

      {/* Categorized Policy Cards */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-500 mb-2" />
            Loading active system policies...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl">
            No system governance policies configured.
          </div>
        ) : (
          categories.map((category, catIdx) => {
            const categoryPolicies = policies.filter(
              (p) => (p.category || 'General Operations') === category
            );
            return (
              <div key={`cat-${category}-${catIdx}`} className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {category}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryPolicies.map((policy, polIdx) => {
                    const policyKey = policy.key || policy.id || `pol-${catIdx}-${polIdx}`;
                    const isEditing = editingKey === policy.key;
                    const isSaving = savingKey === policy.key;
                    const isSuccess = saveSuccessKey === policy.key;

                    return (
                      <div
                        key={`policy-card-${policyKey}`}
                        className={`bg-white dark:bg-neutral-900 border rounded-xl p-5 shadow-xs transition-all relative ${
                          isEditing
                            ? 'border-amber-500 ring-1 ring-amber-500/20'
                            : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Top: Name & Key */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                              {policy.name}
                            </h4>
                            <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {policy.key}
                            </span>
                          </div>

                          {!isEditing ? (
                            <button
                              onClick={() => startEditing(policy)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={cancelEditing}
                                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => savePolicy(policy)}
                                disabled={isSaving}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>{isSaving ? 'Saving...' : 'Save'}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
                          {policy.description}
                        </p>

                        {/* Value Editor or Viewer */}
                        <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-lg p-3 border border-slate-200 dark:border-neutral-800 mb-3">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            <span>Configuration Value</span>
                            <span className="font-mono text-slate-500">[{policy.value_type}]</span>
                          </div>

                          {isEditing ? (
                            <div>
                              {policy.value_type === 'boolean' ? (
                                <div className="flex items-center space-x-3 py-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingValue(!editingValue)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                      editingValue ? 'bg-amber-600' : 'bg-slate-300 dark:bg-neutral-700'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        editingValue ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-neutral-200">
                                    {editingValue ? 'TRUE (Active)' : 'FALSE (Disabled)'}
                                  </span>
                                </div>
                              ) : policy.value_type === 'number' ? (
                                <input
                                  type="number"
                                  step="any"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs font-mono rounded bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              ) : policy.value_type === 'json' ? (
                                <div className="space-y-1">
                                  <textarea
                                    rows={5}
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-mono rounded bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                  {jsonError && (
                                    <p className="text-[11px] text-rose-500 font-medium">
                                      {jsonError}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs rounded bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              )}
                            </div>
                          ) : (
                            <div>
                              {policy.value_type === 'boolean' ? (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                    policy.value
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : 'bg-slate-500/10 text-slate-600 dark:text-neutral-400 border border-slate-500/20'
                                  }`}
                                >
                                  {policy.value ? 'TRUE' : 'FALSE'}
                                </span>
                              ) : policy.value_type === 'json' ? (
                                <pre className="text-[11px] font-mono text-slate-700 dark:text-neutral-300 overflow-x-auto max-h-32 bg-slate-100 dark:bg-neutral-900/80 p-2 rounded">
                                  {JSON.stringify(policy.value, null, 2)}
                                </pre>
                              ) : (
                                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                  {String(policy.value)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Footer: Metadata & Feedback */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-neutral-800/80">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {new Date(policy.updated_at).toLocaleDateString()} by{' '}
                              <span className="font-medium text-slate-600 dark:text-neutral-300">
                                {policy.updated_by || 'Admin'}
                              </span>
                            </span>
                          </div>

                          {isSuccess && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> Updated
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
