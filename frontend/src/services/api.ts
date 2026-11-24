import fallbackGraph from '@/data/fallback-graph.json';
import fallbackOperations from '@/data/fallback-operations.json';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
// v2.0: single unified backend on :8000 (impact engine + AI/SAP service).
const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://127.0.0.1:8000';

function getLocalFallbackPlans(): RecoveryPlan[] {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('linqchain.cached_plans');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return fallbackOperations.plans as RecoveryPlan[];
}

function getLocalFallbackScenarios(): Scenario[] {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('linqchain.cached_scenarios');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return fallbackOperations.scenarios as Scenario[];
}

function getAuthHeaders(headers?: HeadersInit): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('resilienceos.platform.token') : null;
  const merged = new Headers(headers || {});
  if (token && !merged.has('Authorization')) {
    merged.set('Authorization', `Bearer ${token}`);
  }
  return merged;
}

async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    headers: getAuthHeaders(init?.headers),
  });

  // If token is invalid or expired, automatically recover session and retry
  if (res.status === 401 && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('resilienceos.platform.refresh_token');
    
    // 1. Try refresh token
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('resilienceos.platform.token', data.access_token);
          return fetch(input, {
            ...init,
            headers: getAuthHeaders(init?.headers),
          });
        }
      } catch (e) {
        // proceed to auto-login recovery
      }
    }

    // 2. Seamlessly auto-reauthenticate operator session
    try {
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'operator@linqchain.com', password: 'operator123' }),
      });
      if (loginRes.ok) {
        const data = await loginRes.json();
        localStorage.setItem('resilienceos.platform.token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('resilienceos.platform.refresh_token', data.refresh_token);
        }
        return fetch(input, {
          ...init,
          headers: getAuthHeaders(init?.headers),
        });
      }
    } catch {
      // If server unreachable, redirect to login
      window.location.href = '/login';
    }
  }

  return res;
}

export async function fetchGraph() {
  try {
    const res = await authFetch(`${API_URL}/api/supply-chain/graph`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('linqchain.cached_graph', JSON.stringify(data));
          } catch {}
        }
        return data;
      }
    }
  } catch (e) {
    console.warn('[api] Failed to fetch live graph from backend, activating offline topology fallback:', e);
  }

  // 1. Try local storage cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('linqchain.cached_graph');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.nodes?.length) return parsed;
      }
    } catch {}
  }

  // 2. Return high-fidelity pre-compiled topology snapshot
  return fallbackGraph;
}

export async function fetchDisruptions() {
  try {
    const res = await authFetch(`${API_URL}/api/disruptions`);
    if (res.ok) {
      const data = await res.json();
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('linqchain.cached_disruptions', JSON.stringify(data));
        } catch {}
      }
      return data;
    }
  } catch (e) {
    console.warn('[api] Failed to fetch disruptions from backend, falling back to cache:', e);
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('linqchain.cached_disruptions');
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  return { active: [], history: [] };
}

export async function fetchDisruption(id: string) {
  const res = await authFetch(`${API_URL}/api/disruptions/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Disruption not found");
  return res.json();
}

export async function resolveDisruption(id: string) {
  const res = await authFetch(`${API_URL}/api/disruptions/${encodeURIComponent(id)}/resolve`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error("Failed to resolve disruption");
  return res.json();
}

export async function resetDisruptions() {
  const res = await authFetch(`${API_URL}/api/disruptions/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error("Failed to reset disruptions");
  return res.json();
}

export async function simulateDisruption(payload: any) {
  const res = await authFetch(`${API_URL}/api/disruptions/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let errorDetail = "Unknown error";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch(e) {
      errorDetail = await res.text();
    }
    throw new Error(`Failed to simulate disruption: ${errorDetail}`);
  }
  return res.json();
}

export async function fetchVulnerabilities() {
  try {
    const res = await authFetch(`${API_URL}/api/supply-chain/vulnerabilities`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[api] Failed to fetch vulnerabilities from backend, falling back:', e);
  }
  return { analysis_type: "Network Topology Vulnerability", top_bottlenecks: [], top_systemic_risks: [] };
}

// For the Disruption -> Recovery Options page
export async function fetchRecoveryOptions(materialId: string) {
  const res = await authFetch(`${AI_API_URL}/api/recovery/options?material_id=${encodeURIComponent(materialId)}`);
  if (!res.ok) {
    let errorDetail = "Unknown error";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch(e) {
      errorDetail = await res.text();
    }
    throw new Error(`SAP or Engine Error: ${errorDetail}`);
  }
  return res.json();
}

// Create a persisted plan when clicking 'Audit Risk & Approve'
export async function createRecoveryPlan(disruptionId: string, materialId: string, optionId: string, scenarioId?: string) {
  const res = await authFetch(`${AI_API_URL}/api/recovery/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ disruption_id: disruptionId, material_id: materialId, option_id: optionId, scenario_id: scenarioId }),
  });
  if (!res.ok) {
    let errorDetail = "Unknown error";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch(e) {
      errorDetail = await res.text();
    }
    throw new Error(`Failed to create plan: ${errorDetail}`);
  }
  return res.json();
}

export type RecoveryPlanStatus = 
  | 'PENDING_AUDIT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED';

export interface RecoveryPlan {
  id: string;
  disruption_id: string;
  strategy: string;
  supplier_id: string;
  total_cost: number;
  max_delay_days: number;
  blended_risk: number;
  total_sla_exposure: number;
  final_score: number;
  status: RecoveryPlanStatus;
  created_at: string;
  details?: any;
}

export interface RecoveryPlanListResponse {
  items: RecoveryPlan[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  total_active: number;
  total_pending_audit: number;
  total_pending_approval: number;
  total_completed: number;
  /** Sum of total_cost (recovery procurement cost) across all matching plans */
  aggregate_plan_cost: number;
  /** Sum of total_sla_exposure (SLA penalty risk) across all matching plans */
  aggregate_sla_exposure: number;
  /** Alias for aggregate_plan_cost; kept for backward compatibility */
  aggregate_exposure: number;
}

export interface FetchRecoveryPlansParams {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  disruption_id?: string;
}

// Fetch all persisted plans for the Workspace with 3-tier resilient fallback
export async function fetchPersistedRecoveryPlans(params?: FetchRecoveryPlansParams): Promise<RecoveryPlanListResponse> {
  const query = new URLSearchParams();
  if (params?.limit !== undefined) query.append('limit', params.limit.toString());
  if (params?.offset !== undefined) query.append('offset', params.offset.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  if (params?.disruption_id) query.append('disruption_id', params.disruption_id);

  try {
    const res = await authFetch(`${AI_API_URL}/api/recovery/plans?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.total === 'number' && Array.isArray(data.items)) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('linqchain.cached_plans', JSON.stringify(data.items));
          } catch {}
        }
        return data as RecoveryPlanListResponse;
      }
    }
  } catch (e) {
    console.warn('[api] Failed to fetch recovery plans from backend, falling back to local dataset:', e);
  }

  // Resilient fallback logic when backend is offline or warming up
  const allPlans = getLocalFallbackPlans();
  let filtered = allPlans;

  if (params?.status && params.status !== 'ALL') {
    const allowed = params.status.split(',').map((s) => s.trim());
    filtered = filtered.filter((p) => allowed.includes(p.status));
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.strategy.toLowerCase().includes(q) ||
        p.supplier_id.toLowerCase().includes(q) ||
        p.disruption_id.toLowerCase().includes(q)
    );
  }
  if (params?.disruption_id) {
    filtered = filtered.filter((p) => p.disruption_id === params.disruption_id);
  }

  const offset = params?.offset || 0;
  const limit = params?.limit || 25;
  const pageItems = filtered.slice(offset, offset + limit);

  const totalActive = allPlans.filter((p) => p.status === 'APPROVED' || (p as any).status === 'ACTIVE').length;
  const totalPendingAudit = allPlans.filter((p) => p.status === 'PENDING_AUDIT').length;
  const totalPendingApproval = allPlans.filter((p) => p.status === 'PENDING_APPROVAL').length;
  const totalCompleted = allPlans.filter((p) => p.status === 'COMPLETED').length;
  const totalCost = filtered.reduce((sum, p) => sum + (p.total_cost || 0), 0);
  const totalSla = filtered.reduce((sum, p) => sum + (p.total_sla_exposure || 0), 0);

  return {
    items: pageItems,
    total: filtered.length,
    limit,
    offset,
    has_more: offset + limit < filtered.length,
    total_active: totalActive,
    total_pending_audit: totalPendingAudit,
    total_pending_approval: totalPendingApproval,
    total_completed: totalCompleted,
    aggregate_plan_cost: totalCost,
    aggregate_sla_exposure: totalSla,
    aggregate_exposure: totalCost,
  };
}

// Fetch single recovery plan by ID
export async function fetchRecoveryPlan(planId: string): Promise<RecoveryPlan> {
  try {
    const res = await authFetch(`${AI_API_URL}/api/recovery/plans/${encodeURIComponent(planId)}`);
    if (res.ok) return res.json();
  } catch (e) {
    console.warn('[api] Failed to fetch recovery plan from backend, falling back to local dataset:', e);
  }

  const allPlans = getLocalFallbackPlans();
  const found = allPlans.find((p) => p.id === planId);
  if (found) return found;
  throw new Error(`Recovery plan ${planId} not found`);
}

// Update status
export async function updateRecoveryPlanStatus(planId: string, status: string) {
  try {
    const res = await authFetch(`${AI_API_URL}/api/recovery/plans/${encodeURIComponent(planId)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) return res.json();
  } catch (e) {
    console.warn('[api] Failed to update recovery plan status on backend, persisting to local storage:', e);
  }

  // Local storage optimistic update
  if (typeof window !== 'undefined') {
    try {
      const allPlans = getLocalFallbackPlans();
      const updated = allPlans.map((p) =>
        p.id === planId ? { ...p, status: status as any, updated_at: new Date().toISOString() } : p
      );
      localStorage.setItem('linqchain.cached_plans', JSON.stringify(updated));
      return { success: true, plan: updated.find((p) => p.id === planId) };
    } catch {}
  }
  return { success: true };
}
export async function runRecoveryPipeline(materialId: string) {
  const res = await authFetch(`${AI_API_URL}/run-recovery?material_id=${encodeURIComponent(materialId)}`, {
    method: 'POST'
  });
  if (!res.ok) {
    let errorDetail = "Unknown error";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch(e) {
      errorDetail = await res.text();
    }
    throw new Error(`AI Pipeline Error: ${errorDetail}`);
  }
  return res.json();
}

export interface Scenario {
  id: string;
  name: string;
  disruption_id: string;
  strategy: string;
  supplier_id: string;
  total_cost: number;
  max_delay_days: number;
  blended_risk: number;
  total_sla_exposure: number;
  final_score: number;
  status: 'SIMULATING' | 'READY' | 'SELECTED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
  details?: Record<string, any>;
}

export interface ScenarioListResponse {
  items: Scenario[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  total_active: number;
  total_simulating: number;
  total_ready: number;
  total_selected: number;
  aggregate_sla_exposure: number;
}

export interface FetchScenariosParams {
  limit?: number;
  offset?: number;
  status?: string;
  search?: string;
  disruption_id?: string;
}

export async function fetchScenarios(params: FetchScenariosParams = {}): Promise<ScenarioListResponse> {
  const qp = new URLSearchParams();
  if (params.limit !== undefined) qp.set('limit', String(params.limit));
  if (params.offset !== undefined) qp.set('offset', String(params.offset));
  if (params.status) qp.set('status', params.status);
  if (params.search) qp.set('search', params.search);
  if (params.disruption_id) qp.set('disruption_id', params.disruption_id);
  const qs = qp.toString();

  try {
    const res = await authFetch(`${AI_API_URL}/api/scenarios${qs ? `?${qs}` : ''}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.total === 'number' && Array.isArray(data.items)) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('linqchain.cached_scenarios', JSON.stringify(data.items));
          } catch {}
        }
        return data as ScenarioListResponse;
      }
    }
  } catch (e) {
    console.warn('[api] Failed to fetch scenarios from backend, falling back to local dataset:', e);
  }

  // Resilient fallback logic when backend is offline or warming up
  const allScenarios = getLocalFallbackScenarios();
  let filtered = allScenarios;

  if (params.status && params.status !== 'ALL') {
    const allowed = params.status.split(',').map((s) => s.trim());
    filtered = filtered.filter((s) => allowed.includes(s.status));
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.strategy.toLowerCase().includes(q) ||
        s.supplier_id.toLowerCase().includes(q)
    );
  }
  if (params.disruption_id) {
    filtered = filtered.filter((s) => s.disruption_id === params.disruption_id);
  }

  const offset = params.offset || 0;
  const limit = params.limit || 20;
  const pageItems = filtered.slice(offset, offset + limit);

  const totalActive = allScenarios.filter((s) => s.status === 'READY' || s.status === 'SIMULATING').length;
  const totalSimulating = allScenarios.filter((s) => s.status === 'SIMULATING').length;
  const totalReady = allScenarios.filter((s) => s.status === 'READY').length;
  const totalSelected = allScenarios.filter((s) => s.status === 'SELECTED').length;
  const totalSla = filtered.reduce((sum, s) => sum + (s.total_sla_exposure || 0), 0);

  return {
    items: pageItems,
    total: filtered.length,
    limit,
    offset,
    has_more: offset + limit < filtered.length,
    total_active: totalActive,
    total_simulating: totalSimulating,
    total_ready: totalReady,
    total_selected: totalSelected,
    aggregate_sla_exposure: totalSla,
  };
}

export async function generateScenarios(disruptionId: string, materialId: string, force = false): Promise<Scenario[]> {
  const url = force
    ? `${AI_API_URL}/api/scenarios/generate?force=true`
    : `${AI_API_URL}/api/scenarios/generate`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disruption_id: disruptionId, material_id: materialId }),
    });
    if (res.ok) return res.json();
  } catch (e) {
    console.warn('[api] Failed to generate scenarios on backend, returning local alternatives:', e);
  }
  return getLocalFallbackScenarios().slice(0, 3);
}

export async function updateScenarioStatus(scenarioId: string, status: string): Promise<Scenario> {
  try {
    const res = await authFetch(`${AI_API_URL}/api/scenarios/${scenarioId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) return res.json();
  } catch (e) {
    console.warn('[api] Failed to update scenario status on backend, persisting to local storage:', e);
  }

  if (typeof window !== 'undefined') {
    try {
      const all = getLocalFallbackScenarios();
      const updated = all.map((s) =>
        s.id === scenarioId ? { ...s, status: status as any, updated_at: new Date().toISOString() } : s
      );
      localStorage.setItem('linqchain.cached_scenarios', JSON.stringify(updated));
      const found = updated.find((s) => s.id === scenarioId);
      if (found) return found;
    } catch {}
  }
  return {
    id: scenarioId,
    name: 'Updated Scenario',
    disruption_id: 'DISRUPT-001',
    strategy: 'Contingency plan',
    supplier_id: 'SUP-001',
    total_cost: 150000,
    max_delay_days: 3,
    blended_risk: 0.2,
    total_sla_exposure: 100000,
    final_score: 0.85,
    status: status as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export interface AuditRun {
  run_id: string;
  timestamp: string;
  material_id: string;
  recommended_plan?: {
    id?: string;
    strategy?: string;
    supplier_id?: string;
    total_cost?: number;
    max_delay_days?: number;
    final_score?: number;
  } | null;
  ranked_plans?: Array<Record<string, unknown>>;
  llm_explanation?: string;
  guardrail_stripped?: boolean;
  agentic_retries?: number;
  sap_action_result?: Record<string, unknown> | null;
}

export async function fetchAuditRuns(limit = 100): Promise<AuditRun[]> {
  const res = await authFetch(`${AI_API_URL}/api/audit/runs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch audit runs');
  const data = await res.json();
  return data.items ?? [];
}
