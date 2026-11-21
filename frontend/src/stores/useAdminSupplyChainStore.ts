import { create } from 'zustand';
import { broadcastCrossPortalEvent, subscribeToCrossPortalEvents } from '@/lib/cross-portal-sync';
import { useSimulationStore } from '@/stores/useSimulationStore';

export interface AdminSupplier {
  id: string;
  name: string;
  vendor_code: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  category: string;
  country: string;
  status: 'ACTIVE' | 'RESTRICTED' | 'FROZEN';
  otif_sla_percent: number;
  current_otif: number;
  lead_time_days: number;
  lead_time_buffer_days: number;
  active_pos_count: number;
  risk_score: number;
  freeze_reason?: string;
}

export interface AdminPlantLine {
  id: string;
  plant_name: string;
  plant_code: string;
  line_code: string;
  name: string;
  status: 'RUNNING' | 'STARVED' | 'BLOCKED' | 'MAINTENANCE' | 'OFFLINE';
  oee_target: number;
  current_oee: number;
  target_rate_per_hr: number;
  current_rate_per_hr: number;
  starvation_tolerance_mins: number;
  current_work_order: string;
  idle_cost_per_hr: number;
  override_notes?: string;
}

export interface AdminChokepoint {
  id: string;
  name: string;
  type: 'STRAIT' | 'CANAL' | 'PORT_HUB';
  location: string;
  congestion_score: number; // 0-100
  status: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  vessel_queue_count: number;
  avg_delay_days: number;
  affected_routes: string[];
}

export interface AdminPendingPO {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  buyer_org: string;
  item_name: string;
  quantity: number;
  total_value: number;
  status: 'PENDING_ADMIN_APPROVAL' | 'APPROVED' | 'HELD' | 'REJECTED';
  created_at: string;
  high_value_flag: boolean;
}

export interface AiGovernanceConfig {
  autoApproveLimitUsd: number;
  dualApprovalThresholdUsd: number;
  maxLeadTimeDelayDays: number;
  activeAiModel: 'MISTRAL_SMALL' | 'CLAUDE_35_SONNET' | 'GPT_4O' | 'LOCAL_HEURISTIC';
  esgWeight: number; // 0.0 - 1.0
  autoExecuteSapBapi: boolean;
  minConfidenceThreshold: number; // 0-100
}

export interface GlobalAlert {
  id: string;
  target: 'ALL' | 'OPERATOR' | 'SUPPLIER' | 'MANUFACTURER';
  severity: 'INFO' | 'WARNING' | 'CRITICAL_AOG';
  title: string;
  message: string;
  timestamp: string;
  created_by: string;
  active: boolean;
}

export interface TraceabilityEvent {
  id: string;
  timestamp: string;
  source_portal: 'OPERATOR' | 'SUPPLIER' | 'MANUFACTURER' | 'ADMIN';
  event_type: string;
  actor: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

interface AdminSupplyChainState {
  // 1. Supplier Governance
  suppliers: AdminSupplier[];
  freezeSupplier: (id: string, reason: string) => void;
  unfreezeSupplier: (id: string) => void;
  updateSupplierTier: (id: string, tier: 'TIER_1' | 'TIER_2' | 'TIER_3') => void;
  updateSupplierSla: (id: string, otif: number, buffer: number) => void;

  // 2. Manufacturer Plant Lines
  plantLines: AdminPlantLine[];
  overrideLineStatus: (id: string, status: AdminPlantLine['status'], notes?: string) => void;
  setLineOeeTarget: (id: string, target: number) => void;

  // 3. Maritime Chokepoints
  chokepoints: AdminChokepoint[];
  setChokepointStatus: (id: string, status: AdminChokepoint['status'], delayDays: number) => void;

  // 4. Pending High-Value POs
  pendingPOs: AdminPendingPO[];
  approvePO: (id: string) => void;
  holdPO: (id: string, reason: string) => void;
  rejectPO: (id: string, reason: string) => void;

  // 5. AI Recovery Governance
  aiGovernance: AiGovernanceConfig;
  updateAiGovernance: (config: Partial<AiGovernanceConfig>) => void;

  // 6. Global Broadcast Alerts
  alerts: GlobalAlert[];
  broadcastAlert: (alert: Omit<GlobalAlert, 'id' | 'timestamp' | 'active'>) => void;
  dismissAlert: (id: string) => void;

  // 7. Chaos & Disruption Control
  injectDisruption: (params: {
    entityId: string;
    entityType: string;
    severity: number;
    durationDays: number;
    reason: string;
  }) => void;
  resetAllDisruptions: () => void;

  // 8. SAP CAP Event Mesh & BAPI Queue
  bapiQueue: { id: string; po_number: string; destination: string; status: string; value: number }[];
  flushBapiQueue: () => void;
  sapMockMode: boolean;
  toggleSapMockMode: () => void;

  // 9. Cross-Portal Unified Traceability Log
  auditTrail: TraceabilityEvent[];
  addAuditEvent: (evt: Omit<TraceabilityEvent, 'id' | 'timestamp'>) => void;

  // 10. Portal Federation Context
  activeImpersonatedPortal: 'ADMIN' | 'OPERATOR' | 'SUPPLIER' | 'MANUFACTURER';
  federatePortalClearance: (portal: 'OPERATOR' | 'SUPPLIER' | 'MANUFACTURER') => void;
}

const INITIAL_SUPPLIERS: AdminSupplier[] = [
  {
    id: 'SUP-001',
    name: 'Titanium Alloy Forgings Corp',
    vendor_code: 'VEND-TIT-01',
    tier: 'TIER_1',
    category: 'RAW_METALS',
    country: 'United States',
    status: 'ACTIVE',
    otif_sla_percent: 98.0,
    current_otif: 99.2,
    lead_time_days: 14,
    lead_time_buffer_days: 5,
    active_pos_count: 8,
    risk_score: 18,
  },
  {
    id: 'SUP-002',
    name: 'Micro-Sensor Dynamics Ltd',
    vendor_code: 'VEND-SEN-02',
    tier: 'TIER_2',
    category: 'AVIONICS',
    country: 'Germany',
    status: 'ACTIVE',
    otif_sla_percent: 95.0,
    current_otif: 93.8,
    lead_time_days: 21,
    lead_time_buffer_days: 7,
    active_pos_count: 5,
    risk_score: 42,
  },
  {
    id: 'SUP-007',
    name: 'Pacific Aero Composites Inc',
    vendor_code: 'VEND-COM-07',
    tier: 'TIER_1',
    category: 'COMPOSITES',
    country: 'Japan',
    status: 'RESTRICTED',
    otif_sla_percent: 97.5,
    current_otif: 82.1,
    lead_time_days: 28,
    lead_time_buffer_days: 10,
    active_pos_count: 12,
    risk_score: 74,
    freeze_reason: 'Hydraulic furnace disruption under mitigation',
  },
  {
    id: 'SUP-012',
    name: 'Nordic Cryo Sealings AB',
    vendor_code: 'VEND-SEA-12',
    tier: 'TIER_2',
    category: 'FASTENERS',
    country: 'Sweden',
    status: 'ACTIVE',
    otif_sla_percent: 99.0,
    current_otif: 98.6,
    lead_time_days: 10,
    lead_time_buffer_days: 3,
    active_pos_count: 4,
    risk_score: 12,
  },
];

const INITIAL_PLANT_LINES: AdminPlantLine[] = [
  {
    id: 'LINE-TX04-01',
    plant_name: 'Aerospace Propulsion Center TX-04',
    plant_code: 'PLANT-TX04',
    line_code: 'LN-TURBO-01',
    name: 'Turbofan Core Engine Cell',
    status: 'RUNNING',
    oee_target: 85.0,
    current_oee: 84.6,
    target_rate_per_hr: 12,
    current_rate_per_hr: 11.8,
    starvation_tolerance_mins: 45,
    current_work_order: 'WO-2026-9041',
    idle_cost_per_hr: 14500,
  },
  {
    id: 'LINE-TX04-02',
    plant_name: 'Aerospace Propulsion Center TX-04',
    plant_code: 'PLANT-TX04',
    line_code: 'LN-AVION-02',
    name: 'Avionics Wiring Harness Bay',
    status: 'RUNNING',
    oee_target: 88.0,
    current_oee: 89.1,
    target_rate_per_hr: 20,
    current_rate_per_hr: 19.5,
    starvation_tolerance_mins: 60,
    current_work_order: 'WO-2026-9042',
    idle_cost_per_hr: 8900,
  },
  {
    id: 'LINE-WA01-01',
    plant_name: 'Composite Airframe Facility WA-01',
    plant_code: 'PLANT-WA01',
    line_code: 'LN-FUSE-01',
    name: 'Fuselage Section 41 Robotic Layup',
    status: 'STARVED',
    oee_target: 82.0,
    current_oee: 61.2,
    target_rate_per_hr: 4,
    current_rate_per_hr: 2.1,
    starvation_tolerance_mins: 30,
    current_work_order: 'WO-2026-8802',
    idle_cost_per_hr: 28000,
    override_notes: 'Starved for Pre-preg Carbon Tape due to Port Beta bottleneck',
  },
];

const INITIAL_CHOKEPOINTS: AdminChokepoint[] = [
  {
    id: 'CHK-ROT',
    name: 'Port of Rotterdam Terminal Gate',
    type: 'PORT_HUB',
    location: 'Netherlands',
    congestion_score: 42,
    status: 'NOMINAL',
    vessel_queue_count: 8,
    avg_delay_days: 0.8,
    affected_routes: ['RT-EU-AMER-01', 'RT-NORDIC-04'],
  },
  {
    id: 'CHK-BETA',
    name: 'Port Beta Transit Corridor',
    type: 'PORT_HUB',
    location: 'South China Sea / Singapore',
    congestion_score: 86,
    status: 'CRITICAL',
    vessel_queue_count: 27,
    avg_delay_days: 4.2,
    affected_routes: ['RT-ASIA-AMER-02', 'RT-ASIA-EU-01'],
  },
  {
    id: 'CHK-SUEZ',
    name: 'Suez Maritime Chokepoint',
    type: 'CANAL',
    location: 'Egypt / Red Sea',
    congestion_score: 71,
    status: 'ELEVATED',
    vessel_queue_count: 19,
    avg_delay_days: 2.5,
    affected_routes: ['RT-ASIA-EU-01'],
  },
  {
    id: 'CHK-PAN',
    name: 'Panama Canal Locks',
    type: 'CANAL',
    location: 'Panama',
    congestion_score: 55,
    status: 'NOMINAL',
    vessel_queue_count: 12,
    avg_delay_days: 1.2,
    affected_routes: ['RT-AMER-COAST-03'],
  },
];

const INITIAL_PENDING_POS: AdminPendingPO[] = [
  {
    id: 'po-pen-001',
    po_number: 'PO-2026-9810',
    supplier_id: 'SUP-001',
    supplier_name: 'Titanium Alloy Forgings Corp',
    buyer_org: 'Enterprise Aerospace Corp',
    item_name: 'Ti-6Al-4V Billet Forgings Lot #84',
    quantity: 12000,
    total_value: 184500,
    status: 'PENDING_ADMIN_APPROVAL',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    high_value_flag: true,
  },
  {
    id: 'po-pen-002',
    po_number: 'PO-2026-9811',
    supplier_id: 'SUP-007',
    supplier_name: 'Pacific Aero Composites Inc',
    buyer_org: 'Aerospace Propulsion Center TX-04',
    item_name: 'Pre-preg Carbon Composite Tape (350°F Cure)',
    quantity: 8500,
    total_value: 127500,
    status: 'PENDING_ADMIN_APPROVAL',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    high_value_flag: true,
  },
];

const INITIAL_AI_GOVERNANCE: AiGovernanceConfig = {
  autoApproveLimitUsd: 75000,
  dualApprovalThresholdUsd: 100000,
  maxLeadTimeDelayDays: 3.5,
  activeAiModel: 'CLAUDE_35_SONNET',
  esgWeight: 0.35,
  autoExecuteSapBapi: true,
  minConfidenceThreshold: 85,
};

const INITIAL_ALERTS: GlobalAlert[] = [
  {
    id: 'alt-001',
    target: 'ALL',
    severity: 'WARNING',
    title: 'Port Beta Maritime Bottleneck Active',
    message: 'All Asian supplier cargo shipments rerouting via Alternate Port 4. Operator AI mitigations running.',
    timestamp: new Date().toISOString(),
    created_by: 'Primary Security Administrator',
    active: true,
  },
];

const STORAGE_PREFIX = 'linqchain.admin.sc.';

export const useAdminSupplyChainStore = create<AdminSupplyChainState>((set, get) => ({
  suppliers: INITIAL_SUPPLIERS,
  plantLines: INITIAL_PLANT_LINES,
  chokepoints: INITIAL_CHOKEPOINTS,
  pendingPOs: INITIAL_PENDING_POS,
  aiGovernance: INITIAL_AI_GOVERNANCE,
  alerts: INITIAL_ALERTS,
  activeImpersonatedPortal: 'ADMIN',

  bapiQueue: [
    { id: 'bapi-01', po_number: 'PO-2026-8910', destination: 'SAP S/4HANA (CAP)', status: 'QUEUED', value: 89400 },
    { id: 'bapi-02', po_number: 'PO-2026-9041', destination: 'SAP S/4HANA (CAP)', status: 'QUEUED', value: 145000 },
  ],
  sapMockMode: false,

  auditTrail: [
    {
      id: 'aud-trc-01',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      source_portal: 'ADMIN',
      event_type: 'AI_POLICY_UPDATED',
      actor: 'admin@linqchain.com',
      details: 'Adjusted autonomous reroute threshold to $75,000',
      severity: 'INFO',
    },
    {
      id: 'aud-trc-02',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      source_portal: 'OPERATOR',
      event_type: 'SIMULATION_EXECUTED',
      actor: 'operator@linqchain.com',
      details: 'Simulated disruption on SUP-007 (Severity 1.0, 10 Days)',
      severity: 'WARNING',
    },
    {
      id: 'aud-trc-03',
      timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
      source_portal: 'MANUFACTURER',
      event_type: 'LINE_STARVATION_ALARM',
      actor: 'plant.director@linqchain-aerospace.com',
      details: 'Line WA01-01 reported material shortage for Pre-preg Carbon Tape',
      severity: 'CRITICAL',
    },
  ],

  // 1. Supplier Governance
  freezeSupplier: (id, reason) => {
    set((state) => {
      const updated = state.suppliers.map((s) =>
        s.id === id ? { ...s, status: 'FROZEN' as const, freeze_reason: reason } : s
      );
      get().addAuditEvent({
        source_portal: 'ADMIN',
        event_type: 'SUPPLIER_EMERGENCY_FREEZE',
        actor: 'admin@linqchain.com',
        details: `Froze supplier ${id}: ${reason}`,
        severity: 'CRITICAL',
      });
      broadcastCrossPortalEvent('DISRUPTION_REPORTED', 'ADMIN', {
        type: 'SUPPLIER_FROZEN',
        supplier_id: id,
        reason,
      });
      return { suppliers: updated };
    });
  },

  unfreezeSupplier: (id) => {
    set((state) => {
      const updated = state.suppliers.map((s) =>
        s.id === id ? { ...s, status: 'ACTIVE' as const, freeze_reason: undefined } : s
      );
      get().addAuditEvent({
        source_portal: 'ADMIN',
        event_type: 'SUPPLIER_RESTORED',
        actor: 'admin@linqchain.com',
        details: `Restored supplier ${id} to active status`,
        severity: 'INFO',
      });
      return { suppliers: updated };
    });
  },

  updateSupplierTier: (id, tier) => {
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, tier } : s)),
    }));
  },

  updateSupplierSla: (id, otif, buffer) => {
    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === id ? { ...s, otif_sla_percent: otif, lead_time_buffer_days: buffer } : s
      ),
    }));
  },

  // 2. Manufacturer Plant Lines
  overrideLineStatus: (id, status, notes) => {
    set((state) => {
      const updated = state.plantLines.map((l) =>
        l.id === id ? { ...l, status, override_notes: notes } : l
      );
      get().addAuditEvent({
        source_portal: 'ADMIN',
        event_type: 'PLANT_LINE_OVERRIDE',
        actor: 'admin@linqchain.com',
        details: `Overrode ${id} status to ${status}${notes ? ` (${notes})` : ''}`,
        severity: status === 'RUNNING' ? 'INFO' : 'WARNING',
      });
      broadcastCrossPortalEvent('DISRUPTION_REPORTED', 'ADMIN', {
        type: 'LINE_STATUS_OVERRIDE',
        line_id: id,
        status,
        notes,
      });
      return { plantLines: updated };
    });
  },

  setLineOeeTarget: (id, target) => {
    set((state) => ({
      plantLines: state.plantLines.map((l) => (l.id === id ? { ...l, oee_target: target } : l)),
    }));
  },

  // 3. Maritime Chokepoints
  setChokepointStatus: (id, status, delayDays) => {
    set((state) => ({
      chokepoints: state.chokepoints.map((c) =>
        c.id === id ? { ...c, status, avg_delay_days: delayDays } : c
      ),
    }));
  },

  // 4. Pending High-Value POs
  approvePO: (id) => {
    set((state) => {
      const target = state.pendingPOs.find((p) => p.id === id);
      const updated = state.pendingPOs.map((p) =>
        p.id === id ? { ...p, status: 'APPROVED' as const } : p
      );
      get().addAuditEvent({
        source_portal: 'ADMIN',
        event_type: 'PO_DUAL_CUSTODY_APPROVED',
        actor: 'admin@linqchain.com',
        details: `Approved high-value PO ${target?.po_number || id} ($${target?.total_value.toLocaleString() || '0'})`,
        severity: 'INFO',
      });
      broadcastCrossPortalEvent('PO_ACKNOWLEDGED', 'ADMIN', {
        po_id: id,
        status: 'APPROVED',
      });
      return { pendingPOs: updated };
    });
  },

  holdPO: (id, reason) => {
    set((state) => ({
      pendingPOs: state.pendingPOs.map((p) =>
        p.id === id ? { ...p, status: 'HELD' as const } : p
      ),
    }));
  },

  rejectPO: (id, reason) => {
    set((state) => ({
      pendingPOs: state.pendingPOs.map((p) =>
        p.id === id ? { ...p, status: 'REJECTED' as const } : p
      ),
    }));
  },

  // 5. AI Recovery Governance
  updateAiGovernance: (config) => {
    set((state) => {
      const updated = { ...state.aiGovernance, ...config };
      get().addAuditEvent({
        source_portal: 'ADMIN',
        event_type: 'AI_GOVERNANCE_CONFIG_UPDATED',
        actor: 'admin@linqchain.com',
        details: `Updated AI guardrails (Auto-cap: $${updated.autoApproveLimitUsd.toLocaleString()})`,
        severity: 'INFO',
      });
      return { aiGovernance: updated };
    });
  },

  // 6. Global Broadcast Alerts
  broadcastAlert: (alertPayload) => {
    const newAlert: GlobalAlert = {
      ...alertPayload,
      id: `alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      active: true,
    };
    set((state) => {
      get().addAuditEvent({
        source_portal: 'ADMIN',
        event_type: 'GLOBAL_ALERT_BROADCAST',
        actor: 'admin@linqchain.com',
        details: `Broadcasted [${newAlert.severity}] alert to ${newAlert.target}: "${newAlert.title}"`,
        severity: 'WARNING',
      });
      broadcastCrossPortalEvent('DISRUPTION_REPORTED', 'ADMIN', {
        type: 'SYSTEM_BROADCAST_ALERT',
        alert: newAlert,
      });
      return { alerts: [newAlert, ...state.alerts] };
    });
  },

  dismissAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, active: false } : a)),
    }));
  },

  // 7. Chaos & Disruption Control
  injectDisruption: (params) => {
    // 1. Update simulation store
    const fullPrefix = params.entityType.toLowerCase();
    const fullId = `${fullPrefix}:${params.entityId}`;
    useSimulationStore.getState().setActiveDisruption({
      disruption: {
        affected_entity_id: params.entityId,
        disruption_type: params.entityType,
        severity: params.severity,
        duration_days: params.durationDays,
        reason: params.reason,
      },
    });

    // 2. Broadcast across mesh to Operator, Supplier, and Manufacturer
    broadcastCrossPortalEvent('DISRUPTION_REPORTED', 'ADMIN', {
      entity_id: params.entityId,
      full_entity_id: fullId,
      type: params.entityType,
      severity: params.severity,
      duration: params.durationDays,
      reason: params.reason,
    });

    get().addAuditEvent({
      source_portal: 'ADMIN',
      event_type: 'CHAOS_DISRUPTION_INJECTED',
      actor: 'admin@linqchain.com',
      details: `Injected disruption on ${params.entityId} (${params.entityType}) - Severity ${params.severity}`,
      severity: 'CRITICAL',
    });
  },

  resetAllDisruptions: () => {
    useSimulationStore.getState().clearDisruption();
    broadcastCrossPortalEvent('DISRUPTION_RESOLVED', 'ADMIN', {
      status: 'ALL_RESOLVED',
    });
    get().addAuditEvent({
      source_portal: 'ADMIN',
      event_type: 'NETWORK_DISRUPTIONS_RESET',
      actor: 'admin@linqchain.com',
      details: 'Admin triggered global network reset — restored all nodes to nominal status',
      severity: 'INFO',
    });
  },

  // 8. SAP CAP Event Mesh & BAPI Queue
  flushBapiQueue: () => {
    set((state) => {
      get().addAuditEvent({
        source_portal: 'ADMIN',
        event_type: 'SAP_BAPI_QUEUE_FLUSHED',
        actor: 'admin@linqchain.com',
        details: `Flushed ${state.bapiQueue.length} queued BAPIs to SAP CAP S/4HANA`,
        severity: 'INFO',
      });
      return { bapiQueue: [] };
    });
  },

  toggleSapMockMode: () => {
    set((state) => ({ sapMockMode: !state.sapMockMode }));
  },

  // 9. Cross-Portal Unified Traceability Log
  addAuditEvent: (evt) => {
    const fullEvt: TraceabilityEvent = {
      ...evt,
      id: `trc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      auditTrail: [fullEvt, ...state.auditTrail.slice(0, 99)],
    }));
  },

  // 10. Portal Federation Context
  federatePortalClearance: (portal) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('linqchain.active_portal', portal);
      const email =
        portal === 'OPERATOR'
          ? 'operator@linqchain.com'
          : portal === 'SUPPLIER'
          ? 'supplier@titanium-forgings.com'
          : 'plant.director@linqchain-aerospace.com';
      localStorage.setItem('linqchain.user_email', email);
    }
    set({ activeImpersonatedPortal: portal });
  },
}));

