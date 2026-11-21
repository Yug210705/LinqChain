import fallbackGraph from '@/data/fallback-graph.json';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
// v2.0: single unified backend on :8000 (impact engine + AI/SAP service).
const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://127.0.0.1:8000';

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

// Fetch all persisted plans for the Workspace
export async function fetchPersistedRecoveryPlans(params?: FetchRecoveryPlansParams): Promise<RecoveryPlanListResponse> {
  const query = new URLSearchParams();
  if (params?.limit !== undefined) query.append('limit', params.limit.toString());
  if (params?.offset !== undefined) query.append('offset', params.offset.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  if (params?.disruption_id) query.append('disruption_id', params.disruption_id);

  const res = await authFetch(`${AI_API_URL}/api/recovery/plans?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch recovery plans");
  const data = await res.json();
  
  if (data && data.ranked_plans) {
    throw new Error("API Contract Mismatch: Received legacy candidate options instead of persisted Recovery Plans.");
  }
  
  // Basic validation that we received the expected wrapper object
  if (!data || typeof data.total !== 'number' || !Array.isArray(data.items)) {
    throw new Error("API Contract Mismatch: Expected a paginated RecoveryPlanListResponse.");
  }
  
  return data as RecoveryPlanListResponse;
}

// Fetch single recovery plan by ID
export async function fetchRecoveryPlan(planId: string): Promise<RecoveryPlan> {
  const res = await authFetch(`${AI_API_URL}/api/recovery/plans/${encodeURIComponent(planId)}`);
  if (!res.ok) throw new Error("Failed to fetch recovery plan");
  return res.json();
}

// Update status
export async function updateRecoveryPlanStatus(planId: string, status: string) {
  const res = await authFetch(`${AI_API_URL}/api/recovery/plans/${encodeURIComponent(planId)}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    let detail = '';
    try { detail = ((await res.json()) as { detail?: string })?.detail || ''; } catch { /* ignore */ }
    throw new Error(detail || 'Failed to update status');
  }
  return res.json();
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
  const res = await authFetch(`${AI_API_URL}/api/scenarios${qs ? `?${qs}` : ''}`);
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(detail.detail || 'Failed to fetch scenarios');
  }
  return res.json();
}

export async function generateScenarios(disruptionId: string, materialId: string, force = false): Promise<Scenario[]> {
  const url = force
    ? `${AI_API_URL}/api/scenarios/generate?force=true`
    : `${AI_API_URL}/api/scenarios/generate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ disruption_id: disruptionId, material_id: materialId }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(detail.detail || 'Failed to generate scenarios');
  }
  return res.json();
}

export async function updateScenarioStatus(scenarioId: string, status: string): Promise<Scenario> {
  const res = await authFetch(`${AI_API_URL}/api/scenarios/${scenarioId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update scenario status');
  return res.json();
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
