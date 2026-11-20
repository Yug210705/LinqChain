import { create } from 'zustand';
import { broadcastCrossPortalEvent, subscribeToCrossPortalEvents } from '@/lib/cross-portal-sync';

export interface ManufacturerUser {
  id: string;
  email: string;
  display_name: string;
  plant_name: string;
  plant_code: string;
  role: 'PLANT_DIRECTOR' | 'LINE_SUPERVISOR' | 'MANUFACTURING_ENGINEER';
  clearance_level: string;
  scada_station_id: string;
  shift: 'SHIFT_1_DAY' | 'SHIFT_2_SWING' | 'SHIFT_3_NIGHT';
}

export interface ProductionLine {
  id: string;
  line_code: string;
  name: string;
  status: 'RUNNING' | 'STARVED' | 'BLOCKED' | 'MAINTENANCE' | 'OFFLINE';
  target_rate_per_hr: number;
  current_rate_per_hr: number;
  oee_percentage: number;
  availability_percentage: number;
  performance_percentage: number;
  quality_yield_percentage: number;
  current_work_order_id: string;
  downtime_minutes: number;
  idle_cost_per_hr: number;
  active_alarm: string | null;
  cell_lead: string;
}

export interface BomItem {
  part_number: string;
  part_name: string;
  required: number;
  available: number;
  status: 'IN_STOCK' | 'LOW' | 'SHORTAGE';
  supplier_name: string;
}

export interface WorkOrder {
  id: string;
  wo_number: string;
  product_name: string;
  sku: string;
  line_id: string;
  target_quantity: number;
  completed_quantity: number;
  scrapped_quantity: number;
  start_time: string;
  due_time: string;
  priority: 'ROUTINE' | 'EXPEDITE' | 'CRITICAL_AOG';
  status: 'SCHEDULED' | 'IN_PRODUCTION' | 'PAUSED' | 'COMPLETED' | 'QC_HOLD';
  bom_shortages: BomItem[];
}

export interface KanbanBin {
  id: string;
  bin_code: string;
  station_code: string;
  line_code: string;
  part_number: string;
  part_name: string;
  capacity: number;
  current_level: number;
  status: 'FULL' | 'REPLENISH_TRIGGERED' | 'CRITICAL_EMPTY';
  last_scanned: string;
  supplier_vendor: string;
}

export interface QualityNCR {
  id: string;
  ncr_number: string;
  part_number: string;
  part_name: string;
  lot_number: string;
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL_AIRWORTHINESS';
  disposition: 'SCRAP' | 'REWORK' | 'USE_AS_IS' | 'UNDER_REVIEW';
  defect_code: string;
  description: string;
  reported_by: string;
  reported_at: string;
  status: 'OPEN' | 'INVESTIGATING' | 'DISPOSED' | 'CLOSED';
}

export interface PlantTelemetry {
  scada_connected: boolean;
  plc_cycle_time_ms: number;
  factory_temp_celsius: number;
  power_draw_kw: number;
  cleanroom_iso_class: string;
  last_heartbeat: string;
}

interface ManufacturerState {
  token: string | null;
  manufacturerUser: ManufacturerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lines: ProductionLine[];
  workOrders: WorkOrder[];
  kanbanBins: KanbanBin[];
  ncrs: QualityNCR[];
  telemetry: PlantTelemetry;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  setLineStatus: (lineId: string, status: ProductionLine['status'], alarmReason?: string | null) => void;
  dispatchWorkOrder: (woId: string) => void;
  pauseWorkOrder: (woId: string) => void;
  completeWorkOrder: (woId: string) => void;
  triggerKanbanReplenish: (binId: string) => void;
  restockKanban: (binId: string) => void;
  createNCR: (ncrData: Omit<QualityNCR, 'id' | 'ncr_number' | 'reported_at' | 'status'>) => void;
  resolveNCR: (ncrId: string, disposition: QualityNCR['disposition']) => void;
  expediteShortage: (woId: string, partNumber: string) => void;
}

const TOKEN_KEY = 'resilienceos.manufacturer.token';
const USER_KEY = 'resilienceos.manufacturer.user';

const INITIAL_USER: ManufacturerUser = {
  id: 'usr-mfg-092',
  email: 'plant.director@linqchain-aerospace.com',
  display_name: 'Col. Marcus Vance (Ret.)',
  plant_name: 'Aerospace Propulsion Center - Plant TX-04',
  plant_code: 'PLANT-TX-04',
  role: 'PLANT_DIRECTOR',
  clearance_level: 'LEVEL_4_PLANT_OPS',
  scada_station_id: 'SCADA-TX4-MASTER-CON',
  shift: 'SHIFT_1_DAY',
};

const INITIAL_LINES: ProductionLine[] = [
  {
    id: 'line-1',
    line_code: 'LINE-HP-TURBINE',
    name: 'High-Pressure Turbine Rotor Automated Cell',
    status: 'RUNNING',
    target_rate_per_hr: 4,
    current_rate_per_hr: 3.8,
    oee_percentage: 89.2,
    availability_percentage: 94.5,
    performance_percentage: 95.0,
    quality_yield_percentage: 99.1,
    current_work_order_id: 'wo-101',
    downtime_minutes: 0,
    idle_cost_per_hr: 24500,
    active_alarm: null,
    cell_lead: 'Eng. Sarah Jenkins',
  },
  {
    id: 'line-2',
    line_code: 'LINE-AVIONICS-INT',
    name: 'Integrated Fly-By-Wire Avionics Assembly',
    status: 'STARVED',
    target_rate_per_hr: 12,
    current_rate_per_hr: 0,
    oee_percentage: 61.4,
    availability_percentage: 64.0,
    performance_percentage: 96.0,
    quality_yield_percentage: 99.8,
    current_work_order_id: 'wo-102',
    downtime_minutes: 74,
    idle_cost_per_hr: 18200,
    active_alarm: 'Material Starvation: Micro-Sensor Sub-Assemblies (PN: SN-9021-AV)',
    cell_lead: 'Tech. Elena Rostova',
  },
  {
    id: 'line-3',
    line_code: 'LINE-NACELLE-WELD',
    name: 'Titanium Nacelle Electron Beam Automated Welding',
    status: 'RUNNING',
    target_rate_per_hr: 2,
    current_rate_per_hr: 2.1,
    oee_percentage: 93.6,
    availability_percentage: 97.2,
    performance_percentage: 105.0,
    quality_yield_percentage: 98.4,
    current_work_order_id: 'wo-103',
    downtime_minutes: 0,
    idle_cost_per_hr: 31000,
    active_alarm: null,
    cell_lead: 'Lead Specialist Dave Cho',
  },
  {
    id: 'line-4',
    line_code: 'LINE-ACTUATOR-CAL',
    name: 'Hydraulic Flight Control Actuator Final Cal Cell',
    status: 'BLOCKED',
    target_rate_per_hr: 8,
    current_rate_per_hr: 1.5,
    oee_percentage: 54.8,
    availability_percentage: 60.0,
    performance_percentage: 91.3,
    quality_yield_percentage: 100.0,
    current_work_order_id: 'wo-104',
    downtime_minutes: 112,
    idle_cost_per_hr: 14750,
    active_alarm: 'Buffer Stage Overflow: Line-Side Curing Chamber Saturation',
    cell_lead: 'Eng. Vikram Rao',
  },
];

const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-101',
    wo_number: 'WO-2026-TX4-001',
    product_name: 'GE-9X Stage 2 Blisk Rotor Assembly',
    sku: 'BLK-GE9X-S2-77',
    line_id: 'line-1',
    target_quantity: 48,
    completed_quantity: 36,
    scrapped_quantity: 1,
    start_time: '2026-10-31T06:00:00Z',
    due_time: '2026-11-03T18:00:00Z',
    priority: 'EXPEDITE',
    status: 'IN_PRODUCTION',
    bom_shortages: [
      { part_number: 'TI-6AL-4V-INGOT', part_name: 'Titanium Grade 5 Forging Blank', required: 48, available: 52, status: 'IN_STOCK', supplier_name: 'Titanium Forgings Corp' },
      { part_number: 'BLD-COAT-CERAMIC', part_name: 'Thermal Barrier Plasma Coating', required: 48, available: 48, status: 'IN_STOCK', supplier_name: 'Praxair Surface Tech' },
      { part_number: 'FAST-LOCK-TI-M8', part_name: 'Aerospace Self-Locking Pin M8', required: 384, available: 400, status: 'IN_STOCK', supplier_name: 'Arconic Fasteners' },
    ],
  },
  {
    id: 'wo-102',
    wo_number: 'WO-2026-TX4-002',
    product_name: 'Primary Flight Control Computer Unit (FCCU)',
    sku: 'FCCU-GEN5-AV09',
    line_id: 'line-2',
    target_quantity: 120,
    completed_quantity: 42,
    scrapped_quantity: 0,
    start_time: '2026-11-01T07:00:00Z',
    due_time: '2026-11-04T12:00:00Z',
    priority: 'CRITICAL_AOG',
    status: 'PAUSED',
    bom_shortages: [
      { part_number: 'SN-9021-AV', part_name: 'MEMS Dual-Axis Inertial Gyro Sensor', required: 240, available: 84, status: 'SHORTAGE', supplier_name: 'Apex MicroSensors GmbH' },
      { part_number: 'PCB-MULTILAYER-12', part_name: '12-Layer Radiation-Hardened Mainboard', required: 120, available: 120, status: 'IN_STOCK', supplier_name: 'TTM Technologies' },
      { part_number: 'CON-MIL-DTL-38999', part_name: 'Harsh Environment Mil-Spec Connector', required: 480, available: 310, status: 'LOW', supplier_name: 'Amphenol Aerospace' },
    ],
  },
  {
    id: 'wo-103',
    wo_number: 'WO-2026-TX4-003',
    product_name: 'Center Nacelle Acoustic Cowl Rib Frame',
    sku: 'NAC-COWL-R99',
    line_id: 'line-3',
    target_quantity: 24,
    completed_quantity: 18,
    scrapped_quantity: 0,
    start_time: '2026-10-30T14:00:00Z',
    due_time: '2026-11-03T10:00:00Z',
    priority: 'ROUTINE',
    status: 'IN_PRODUCTION',
    bom_shortages: [
      { part_number: 'CF-UNIDIR-PREPREG', part_name: 'Carbon Fiber HexTow IM7 Prepreg', required: 120, available: 180, status: 'IN_STOCK', supplier_name: 'Hexcel Composites' },
      { part_number: 'HONEYCOMB-NOMEX-1', part_name: 'Aramid Honeycomb Core 1/2in', required: 48, available: 50, status: 'IN_STOCK', supplier_name: 'Plascore Inc' },
    ],
  },
  {
    id: 'wo-104',
    wo_number: 'WO-2026-TX4-004',
    product_name: 'Aileron Electro-Hydrostatic Actuator',
    sku: 'EHA-FLT-CTRL-50',
    line_id: 'line-4',
    target_quantity: 64,
    completed_quantity: 14,
    scrapped_quantity: 2,
    start_time: '2026-11-02T05:30:00Z',
    due_time: '2026-11-05T16:00:00Z',
    priority: 'ROUTINE',
    status: 'QC_HOLD',
    bom_shortages: [
      { part_number: 'HYD-SEAL-FLUORO', part_name: 'High-Temp Fluorosilicone O-Ring', required: 256, available: 600, status: 'IN_STOCK', supplier_name: 'Parker Hannifin' },
      { part_number: 'SOLENOID-VALVE-3W', part_name: 'Proportional 3-Way Servo Valve', required: 64, available: 64, status: 'IN_STOCK', supplier_name: 'Moog Aerospace' },
    ],
  },
];

const INITIAL_KANBAN_BINS: KanbanBin[] = [
  {
    id: 'bin-01',
    bin_code: 'BIN-TX4-A1-01',
    station_code: 'STATION-BLISK-02',
    line_code: 'LINE-HP-TURBINE',
    part_number: 'FAST-LOCK-TI-M8',
    part_name: 'Aerospace Self-Locking Pin M8',
    capacity: 200,
    current_level: 164,
    status: 'FULL',
    last_scanned: '2026-11-02T08:30:00Z',
    supplier_vendor: 'Arconic Fasteners',
  },
  {
    id: 'bin-02',
    bin_code: 'BIN-TX4-A2-04',
    station_code: 'STATION-AVIONICS-01',
    line_code: 'LINE-AVIONICS-INT',
    part_number: 'SN-9021-AV',
    part_name: 'MEMS Dual-Axis Inertial Gyro Sensor',
    capacity: 100,
    current_level: 0,
    status: 'CRITICAL_EMPTY',
    last_scanned: '2026-11-02T07:14:00Z',
    supplier_vendor: 'Apex MicroSensors GmbH',
  },
  {
    id: 'bin-03',
    bin_code: 'BIN-TX4-A2-09',
    station_code: 'STATION-AVIONICS-03',
    line_code: 'LINE-AVIONICS-INT',
    part_number: 'CON-MIL-DTL-38999',
    part_name: 'Harsh Environment Mil-Spec Connector',
    capacity: 150,
    current_level: 28,
    status: 'REPLENISH_TRIGGERED',
    last_scanned: '2026-11-02T09:45:00Z',
    supplier_vendor: 'Amphenol Aerospace',
  },
  {
    id: 'bin-04',
    bin_code: 'BIN-TX4-A3-02',
    station_code: 'STATION-WELD-01',
    line_code: 'LINE-NACELLE-WELD',
    part_number: 'TI-WELD-WIRE-GR5',
    part_name: 'Titanium TIG/EB Filler Wire 1.6mm',
    capacity: 50,
    current_level: 42,
    status: 'FULL',
    last_scanned: '2026-11-02T06:12:00Z',
    supplier_vendor: 'Perryman Company',
  },
  {
    id: 'bin-05',
    bin_code: 'BIN-TX4-A4-06',
    station_code: 'STATION-ACTUATOR-02',
    line_code: 'LINE-ACTUATOR-CAL',
    part_number: 'HYD-SEAL-FLUORO',
    part_name: 'High-Temp Fluorosilicone O-Ring',
    capacity: 300,
    current_level: 110,
    status: 'REPLENISH_TRIGGERED',
    last_scanned: '2026-11-02T10:02:00Z',
    supplier_vendor: 'Parker Hannifin',
  },
];

const INITIAL_NCRS: QualityNCR[] = [
  {
    id: 'ncr-01',
    ncr_number: 'NCR-2026-TX4-0089',
    part_number: 'BLK-GE9X-S2-77',
    part_name: 'Stage 2 Blisk Rotor #37',
    lot_number: 'LOT-2026-OCT-881',
    severity: 'MAJOR',
    disposition: 'SCRAP',
    defect_code: 'DEF-BLADE-MICROCRACK',
    description: 'Eddy-current probe revealed 0.18mm surface flaw on trailing edge foil #14 after multi-axis milling.',
    reported_by: 'Inspector David Klein (Badge #4012)',
    reported_at: '2026-11-01T15:20:00Z',
    status: 'DISPOSED',
  },
  {
    id: 'ncr-02',
    ncr_number: 'NCR-2026-TX4-0094',
    part_number: 'EHA-FLT-CTRL-50',
    part_name: 'Aileron Actuator Body #12',
    lot_number: 'LOT-2026-NOV-002',
    severity: 'CRITICAL_AIRWORTHINESS',
    disposition: 'UNDER_REVIEW',
    defect_code: 'DEF-HYD-PRESSURE-FAIL',
    description: 'Internal seal bypassed at 4,800 PSI hydrostatic proof test (rated 5,000 PSI). Quarantined at Station 04.',
    reported_by: 'Eng. Sarah Jenkins (Badge #1109)',
    reported_at: '2026-11-02T08:15:00Z',
    status: 'INVESTIGATING',
  },
  {
    id: 'ncr-03',
    ncr_number: 'NCR-2026-TX4-0095',
    part_number: 'NAC-COWL-R99',
    part_name: 'Center Nacelle Cowl Rib #21',
    lot_number: 'LOT-2026-OCT-990',
    severity: 'MINOR',
    disposition: 'REWORK',
    defect_code: 'DEF-TOL-RIVET-HOLE',
    description: 'Rivet counter-sink depth exceeded nominal by +0.06mm on flange C. Approved for oversize rivet bushing rework.',
    reported_by: 'Lead Specialist Dave Cho (Badge #2241)',
    reported_at: '2026-11-02T09:40:00Z',
    status: 'OPEN',
  },
];

const INITIAL_TELEMETRY: PlantTelemetry = {
  scada_connected: true,
  plc_cycle_time_ms: 18.4,
  factory_temp_celsius: 21.2,
  power_draw_kw: 1420.5,
  cleanroom_iso_class: 'ISO 7 (Class 10,000)',
  last_heartbeat: new Date().toISOString(),
};

let mfgSyncInitialized = false;
function initManufacturerSyncListener(set: any, get: any) {
  if (typeof window === 'undefined' || mfgSyncInitialized) return;
  mfgSyncInitialized = true;

  subscribeToCrossPortalEvents((event) => {
    // If supplier issued ASN for part
    if (event.type === 'ASN_DISPATCHED') {
      const partNumber = event.payload?.part_number;
      if (partNumber) {
        set((state: any) => ({
          workOrders: state.workOrders.map((wo: any) => ({
            ...wo,
            bom_shortages: wo.bom_shortages.map((item: any) =>
              item.part_number === partNumber || item.part_number.includes(partNumber)
                ? { ...item, status: 'IN_STOCK', available: item.required }
                : item
            ),
          })),
          // Unstarve lines
          lines: state.lines.map((line: any) =>
            line.status === 'STARVED'
              ? {
                  ...line,
                  status: 'RUNNING',
                  active_alarm: null,
                  current_rate_per_hr: line.target_rate_per_hr,
                }
              : line
          ),
        }));
      }
    }
  });
}

export const useManufacturerStore = create<ManufacturerState>((set, get) => ({
  token: null,
  manufacturerUser: null,
  isAuthenticated: false,
  isLoading: true,
  lines: INITIAL_LINES,
  workOrders: INITIAL_WORK_ORDERS,
  kanbanBins: INITIAL_KANBAN_BINS,
  ncrs: INITIAL_NCRS,
  telemetry: INITIAL_TELEMETRY,

  login: async (email: string, _password: string) => {
    // Generate secure synthetic JWT session for plant operations
    const mockToken = `mfg_sec_jwt_${btoa(email)}_${Date.now()}`;
    const user = {
      ...INITIAL_USER,
      email,
      display_name: email.includes('director') ? 'Col. Marcus Vance (Ret.)' : 'Lead Eng. Jordan Cole',
      role: email.includes('director') ? ('PLANT_DIRECTOR' as const) : ('LINE_SUPERVISOR' as const),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    set({
      token: mockToken,
      manufacturerUser: user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    set({
      token: null,
      manufacturerUser: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  loadFromStorage: () => {
    initManufacturerSyncListener(set, get);
    if (typeof window === 'undefined') return;
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userRaw = localStorage.getItem(USER_KEY);
      if (token && userRaw) {
        set({
          token,
          manufacturerUser: JSON.parse(userRaw),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          token: null,
          manufacturerUser: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      set({
        token: null,
        manufacturerUser: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setLineStatus: (lineId, status, alarmReason = null) => {
    set((state) => ({
      lines: state.lines.map((line) => {
        if (line.id !== lineId) return line;
        return {
          ...line,
          status,
          active_alarm: alarmReason !== undefined ? alarmReason : line.active_alarm,
          current_rate_per_hr: status === 'RUNNING' ? line.target_rate_per_hr : status === 'MAINTENANCE' ? 0 : line.current_rate_per_hr,
          downtime_minutes: status === 'RUNNING' ? 0 : line.downtime_minutes + 15,
        };
      }),
    }));
  },

  dispatchWorkOrder: (woId) => {
    set((state) => ({
      workOrders: state.workOrders.map((wo) => {
        if (wo.id !== woId) return wo;
        return { ...wo, status: 'IN_PRODUCTION' };
      }),
    }));
  },

  pauseWorkOrder: (woId) => {
    set((state) => ({
      workOrders: state.workOrders.map((wo) => {
        if (wo.id !== woId) return wo;
        return { ...wo, status: 'PAUSED' };
      }),
    }));
  },

  completeWorkOrder: (woId) => {
    set((state) => ({
      workOrders: state.workOrders.map((wo) => {
        if (wo.id !== woId) return wo;
        return { ...wo, status: 'COMPLETED', completed_quantity: wo.target_quantity };
      }),
    }));
  },

  triggerKanbanReplenish: (binId) => {
    const bin = get().kanbanBins.find((b) => b.id === binId);
    set((state) => ({
      kanbanBins: state.kanbanBins.map((b) => {
        if (b.id !== binId) return b;
        return {
          ...b,
          status: 'REPLENISH_TRIGGERED',
          last_scanned: new Date().toISOString(),
        };
      }),
    }));

    if (bin) {
      broadcastCrossPortalEvent('KANBAN_REPLENISH_TRIGGERED', 'MANUFACTURER', {
        binId,
        bin_code: bin.bin_code,
        station_code: bin.station_code,
        line_code: bin.line_code,
        part_number: bin.part_number,
        part_name: bin.part_name,
        capacity: bin.capacity,
        supplier_vendor: bin.supplier_vendor,
      });
    }
  },

  restockKanban: (binId) => {
    const bin = get().kanbanBins.find((b) => b.id === binId);
    set((state) => ({
      kanbanBins: state.kanbanBins.map((b) => {
        if (b.id !== binId) return b;
        return {
          ...b,
          current_level: b.capacity,
          status: 'FULL',
          last_scanned: new Date().toISOString(),
        };
      }),
    }));

    if (bin) {
      broadcastCrossPortalEvent('KANBAN_RESTOCKED', 'MANUFACTURER', {
        binId,
        bin_code: bin.bin_code,
        part_number: bin.part_number,
      });
    }
  },

  createNCR: (ncrData) => {
    const newNCR: QualityNCR = {
      ...ncrData,
      id: `ncr-${Date.now()}`,
      ncr_number: `NCR-2026-TX4-${Math.floor(1000 + Math.random() * 9000)}`,
      reported_at: new Date().toISOString(),
      status: 'OPEN',
    };
    set((state) => ({
      ncrs: [newNCR, ...state.ncrs],
    }));
  },

  resolveNCR: (ncrId, disposition) => {
    set((state) => ({
      ncrs: state.ncrs.map((ncr) => {
        if (ncr.id !== ncrId) return ncr;
        return {
          ...ncr,
          disposition,
          status: disposition === 'SCRAP' || disposition === 'USE_AS_IS' ? 'DISPOSED' : 'INVESTIGATING',
        };
      }),
    }));
  },

  expediteShortage: (woId, partNumber) => {
    set((state) => ({
      workOrders: state.workOrders.map((wo) => {
        if (wo.id !== woId) return wo;
        return {
          ...wo,
          bom_shortages: wo.bom_shortages.map((item) => {
            if (item.part_number !== partNumber) return item;
            return {
              ...item,
              status: 'IN_STOCK',
              available: item.required,
            };
          }),
        };
      }),
    }));
  },
}));
