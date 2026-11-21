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
  Search,
  Filter,
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
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
        setSaveErrorKey('Please enter a valid numeric value');
        setSavingKey(null);
        return;
      }
    } else if (policy.value_type === 'boolean') {
      parsedVal = Boolean(editingValue);
    } else if (policy.value_type === 'json') {
      try {
        parsedVal = JSON.parse(editingValue);
      } catch (err: any) {
        setJsonError(`Invalid JSON: ${err?.message}`);
        setSavingKey(null);
        return;
      }
    }

    try {
      await updatePolicy(policy.key, parsedVal);
      setPolicies((prev) =>
        prev.map((p) =>
          p.key === policy.key
            ? {
                ...p,
                value: parsedVal,
                updated_at: new Date().toISOString(),
                updated_by: 'current-admin@resilienceos.io',
              }
            : p
        )
      );
      setSaveSuccessKey(policy.key);
      cancelEditing();
      setTimeout(() => setSaveSuccessKey(null), 3500);
    } catch (err: any) {
      setSaveErrorKey(err?.message || 'Failed to update policy on server');
    } finally {
      setSavingKey(null);
    }
  };

  const categories = Array.from(
    new Set(policies.map((p) => p.category || 'General Operations'))
  );

  const filteredPolicies = policies.filter((p) => {
    const matchesCat =
      selectedCategory === 'ALL' || (p.category || 'General Operations') === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
              GOVERNANCE ENGINE
            </span>
            <span className="text-xs text-slate-400 dark:text-neutral-500">
              {policies.length} Active System Rules
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 mt-1">
            Platform Policies & Guardrails
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
            Configure system thresholds, autonomous decision bounds, and SAP dispatch parameters.
          </p>
        </div>

        <button
          onClick={loadData}
          title="Reload policies from server"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 p-3.5 rounded-xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies by name, key, or parameter..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
            }`}
          >
            All ({policies.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Policy Cards: balanced responsive 3-column layout */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500 mb-2" />
          <span>Loading system policies...</span>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl">
          No policies match your filter query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPolicies.map((policy) => {
            const isEditing = editingKey === policy.key;
            const isSaving = savingKey === policy.key;
            const isSuccess = saveSuccessKey === policy.key;

            return (
              <div
                key={policy.key}
                className={`bg-white dark:bg-[#18181b] border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isEditing
                    ? 'border-blue-500 ring-1 ring-blue-500/20'
                    : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
                }`}
              >
                <div>
                  {/* Category Pill & Key */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 truncate max-w-[200px]">
                      {policy.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-neutral-700/80">
                      {policy.key}
                    </span>
                  </div>

                  {/* Policy Title */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 leading-snug">
                      {policy.name}
                    </h3>

                    {!isEditing ? (
                      <button
                        onClick={() => startEditing(policy)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Saving...' : 'Save'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4 min-h-[34px] leading-relaxed">
                    {policy.description}
                  </p>

                  {/* Value Configuration Block */}
                  <div className="bg-slate-50 dark:bg-neutral-900/60 rounded-lg p-3 border border-slate-200 dark:border-neutral-800 mb-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">
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
                                editingValue ? 'bg-blue-600' : 'bg-slate-300 dark:bg-neutral-700'
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
                            className="w-full px-3 py-1.5 text-xs font-mono rounded bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                          />
                        ) : policy.value_type === 'json' ? (
                          <div>
                            <textarea
                              rows={5}
                              value={editingValue}
                              onChange={(e) => {
                                setEditingValue(e.target.value);
                                setJsonError(null);
                              }}
                              className="w-full px-3 py-2 text-xs font-mono rounded bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                            />
                            {jsonError && (
                              <p className="text-[11px] text-rose-500 mt-1 font-mono">
                                {jsonError}
                              </p>
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-mono rounded bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
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
                                : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400'
                            }`}
                          >
                            {policy.value ? 'TRUE' : 'FALSE'}
                          </span>
                        ) : policy.value_type === 'json' ? (
                          <pre className="text-[11px] font-mono text-slate-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 p-2 rounded border border-slate-200 dark:border-neutral-800 overflow-x-auto max-h-24">
                            {JSON.stringify(policy.value, null, 2)}
                          </pre>
                        ) : (
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-neutral-100">
                            {policy.value_type === 'number' && policy.key.includes('threshold')
                              ? `$${Number(policy.value).toLocaleString()}`
                              : String(policy.value)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 text-[11px] text-slate-400 dark:text-neutral-500 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{new Date(policy.updated_at).toLocaleDateString()}</span>
                    <span>by</span>
                    <span className="font-mono truncate">{policy.updated_by}</span>
                  </div>
                  {isSuccess && (
                    <span className="text-emerald-500 flex items-center gap-1 text-[11px] font-semibold shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
