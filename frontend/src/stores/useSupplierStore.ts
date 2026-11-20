import { create } from 'zustand';
import { broadcastCrossPortalEvent, subscribeToCrossPortalEvents } from '@/lib/cross-portal-sync';

export interface SupplierUser {
  id: string;
  email: string;
  display_name: string;
  company_name: string;
  vendor_code: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  role: 'SUPPLIER_ADMIN' | 'SUPPLIER_DISPATCHER';
  duns_number: string;
  sap_account_id: string;
  clearance_level: string;
}

export interface SupplierPO {
  id: string;
  sap_po_number: string;
  buyer_org: string;
  item_name: string;
  part_number: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_value: number;
  order_date: string;
  required_delivery_date: string;
  confirmed_delivery_date?: string;
  status: 'NEW' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'REJECTED';
  carrier?: string;
  tracking_number?: string;
  notes?: string;
}

export interface SupplierInventoryItem {
  id: string;
  material_name: string;
  part_number: string;
  category: 'RAW_METALS' | 'AVIONICS' | 'COMPOSITES' | 'FASTENERS';
  stock_on_hand: number;
  unit: string;
  safety_buffer_days: number;
  min_threshold: number;
  max_capacity: number;
  warehouse_location: string;
  last_replenished: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface SupplierDisruptionReport {
  id: string;
  incident_type: 'MATERIAL_SHORTAGE' | 'EQUIPMENT_FAILURE' | 'LOGISTICS_DELAY' | 'FORCE_MAJEURE';
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affected_pos: string[];
  estimated_delay_days: number;
  description: string;
  mitigation_plan: string;
  reported_at: string;
  status: 'ACTIVE' | 'RESOLVING' | 'RESOLVED';
}

export interface SupplierQualityCert {
  id: string;
  cert_name: string;
  part_number: string;
  batch_number: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  compliance_standard: 'AS9100D' | 'ISO9001' | 'ITAR' | 'NADCAP';
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  defect_ppm: number;
}

interface SupplierState {
  token: string | null;
  supplierUser: SupplierUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  purchaseOrders: SupplierPO[];
  inventory: SupplierInventoryItem[];
  disruptions: SupplierDisruptionReport[];
  certificates: SupplierQualityCert[];

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  acknowledgePO: (poId: string, confirmedDate?: string) => void;
  issueASN: (poId: string, carrier: string, trackingNumber: string) => void;
  rejectPO: (poId: string, reason: string) => void;
  updateInventoryStock: (id: string, delta: number) => void;
  reportDisruption: (report: Omit<SupplierDisruptionReport, 'id' | 'reported_at' | 'status'>) => void;
  resolveDisruption: (id: string) => void;
  uploadCertificate: (cert: Omit<SupplierQualityCert, 'id' | 'status'>) => void;
}

const TOKEN_KEY = 'resilienceos.supplier.token';
const USER_KEY = 'resilienceos.supplier.user';

const INITIAL_USER: SupplierUser = {
  id: 'sup-usr-8821',
  email: 'supplier@titanium-forgings.com',
  display_name: 'Marcus Vance',
  company_name: 'Titanium Alloy Forgings Corp',
  vendor_code: 'VEND-8821-TI',
  tier: 'TIER_1',
  role: 'SUPPLIER_ADMIN',
  duns_number: '08-192-4412',
  sap_account_id: 'SAP-VEND-99014',
  clearance_level: 'LEVEL_3_VENDOR',
};

const INITIAL_POS: SupplierPO[] = [
  {
    id: 'PO-2026-9042',
    sap_po_number: '4500891204',
    buyer_org: 'Enterprise Aerospace Corp',
    item_name: 'Titanium Grade 5 High-Pressure Turbine Discs',
    part_number: 'AF-TI-9021',
    quantity: 64,
    unit: 'PCS',
    unit_price: 18450,
    total_value: 1180800,
    order_date: '2026-10-24',
    required_delivery_date: '2026-11-12',
    status: 'NEW',
    notes: 'Urgent AOG safety buffer restocking for Assembly Plant 4.',
  },
  {
    id: 'PO-2026-8991',
    sap_po_number: '4500890112',
    buyer_org: 'Enterprise Aerospace Corp',
    item_name: 'Precision Inconel 718 Fastener Sets',
    part_number: 'INC-718-SET',
    quantity: 500,
    unit: 'LOT',
    unit_price: 420,
    total_value: 210000,
    order_date: '2026-10-18',
    required_delivery_date: '2026-11-05',
    confirmed_delivery_date: '2026-11-04',
    status: 'IN_TRANSIT',
    carrier: 'FedEx Custom Critical Aerospace',
    tracking_number: 'FX-8891029412',
  },
  {
    id: 'PO-2026-8910',
    sap_po_number: '4500889410',
    buyer_org: 'Enterprise Aerospace Corp',
    item_name: 'Nickel-Cobalt Composite Engine Ring Castings',
    part_number: 'NC-CR-4001',
    quantity: 120,
    unit: 'PCS',
    unit_price: 6800,
    total_value: 816000,
    order_date: '2026-10-12',
    required_delivery_date: '2026-11-08',
    confirmed_delivery_date: '2026-11-08',
    status: 'CONFIRMED',
  },
  {
    id: 'PO-2026-8740',
    sap_po_number: '4500881090',
    buyer_org: 'Enterprise Aerospace Corp',
    item_name: 'Monolithic Titanium Structural Spar Billets',
    part_number: 'TI-SPAR-B2',
    quantity: 32,
    unit: 'PCS',
    unit_price: 34500,
    total_value: 1104000,
    order_date: '2026-09-28',
    required_delivery_date: '2026-10-25',
    confirmed_delivery_date: '2026-10-24',
    status: 'DELIVERED',
    carrier: 'DHL Global Forwarding Aerospace',
    tracking_number: 'DHL-AERO-99214',
  },
];

const INITIAL_INVENTORY: SupplierInventoryItem[] = [
  {
    id: 'mat-001',
    material_name: 'Titanium Ti-6Al-4V Certified Ingot Stock',
    part_number: 'INGOT-TI64',
    category: 'RAW_METALS',
    stock_on_hand: 14200,
    unit: 'KG',
    safety_buffer_days: 28,
    min_threshold: 4000,
    max_capacity: 25000,
    warehouse_location: 'Forging Bay 3 - Silo A',
    last_replenished: '2026-10-20',
    status: 'HEALTHY',
  },
  {
    id: 'mat-002',
    material_name: 'Inconel 718 Vacuum-Induction Melted Rods',
    part_number: 'ROD-INC718',
    category: 'RAW_METALS',
    stock_on_hand: 2100,
    unit: 'KG',
    safety_buffer_days: 9,
    min_threshold: 3000,
    max_capacity: 10000,
    warehouse_location: 'Cold Storage Vault B',
    last_replenished: '2026-10-15',
    status: 'WARNING',
  },
  {
    id: 'mat-003',
    material_name: 'Aerospace Grade Silicon-Nitride Seals',
    part_number: 'SEAL-SN-99',
    category: 'FASTENERS',
    stock_on_hand: 850,
    unit: 'PCS',
    safety_buffer_days: 4,
    min_threshold: 1200,
    max_capacity: 5000,
    warehouse_location: 'Cleanroom Depot 1',
    last_replenished: '2026-10-02',
    status: 'CRITICAL',
  },
  {
    id: 'mat-004',
    material_name: 'Pre-preg Carbon Composite Tape (350°F Cure)',
    part_number: 'TAPE-CC-350',
    category: 'COMPOSITES',
    stock_on_hand: 9400,
    unit: 'SQM',
    safety_buffer_days: 35,
    min_threshold: 2500,
    max_capacity: 15000,
    warehouse_location: 'Cryogenic Freezer -18°C',
    last_replenished: '2026-10-26',
    status: 'HEALTHY',
  },
];

const INITIAL_DISRUPTIONS: SupplierDisruptionReport[] = [
  {
    id: 'DIS-SUP-01',
    incident_type: 'EQUIPMENT_FAILURE',
    title: 'Vacuum Arc Remelting (VAR) Furnace #2 Hydraulic Leak',
    severity: 'MEDIUM',
    affected_pos: ['PO-2026-8910'],
    estimated_delay_days: 3,
    description: 'Planned maintenance detected seal degradation. Repaired and undergoing calibration. Secondary VAR unit absorbed load.',
    mitigation_plan: 'Overtime shift scheduled for Nov 3-5 to absorb queue backlog.',
    reported_at: '2026-10-30T09:15:00Z',
    status: 'RESOLVING',
  },
];

const INITIAL_CERTS: SupplierQualityCert[] = [
  {
    id: 'CERT-001',
    cert_name: 'AS9100 Rev D Aerospace Quality System Certification',
    part_number: 'ALL-PRODUCTS',
    batch_number: 'AUDIT-2026-Q3',
    issuer: 'PRI Registrar / SAE International',
    issue_date: '2024-06-15',
    expiry_date: '2027-06-14',
    compliance_standard: 'AS9100D',
    status: 'VALID',
    defect_ppm: 14,
  },
  {
    id: 'CERT-002',
    cert_name: 'Certificate of Analysis: Ti-6Al-4V Melt Lot #9914',
    part_number: 'AF-TI-9021',
    batch_number: 'LOT-9914-A',
    issuer: 'Independent Metrology Labs USA',
    issue_date: '2026-10-18',
    expiry_date: '2027-10-18',
    compliance_standard: 'NADCAP',
    status: 'VALID',
    defect_ppm: 8,
  },
  {
    id: 'CERT-003',
    cert_name: 'ITAR Compliance Registration & Defense Trade Clearance',
    part_number: 'MIL-ALLOYS',
    batch_number: 'ITAR-REG-2026',
    issuer: 'U.S. Directorate of Defense Trade Controls (DDTC)',
    issue_date: '2025-11-30',
    expiry_date: '2026-11-30',
    compliance_standard: 'ITAR',
    status: 'EXPIRING_SOON',
    defect_ppm: 0,
  },
];

let syncListenerInitialized = false;
function initSupplierSyncListener(set: any, get: any) {
  if (typeof window === 'undefined' || syncListenerInitialized) return;
  syncListenerInitialized = true;

  subscribeToCrossPortalEvents((event) => {
    if (event.type === 'KANBAN_REPLENISH_TRIGGERED') {
      const { bin_code, part_number, part_name, capacity } = event.payload || {};
      if (part_number) {
        // Prepend an expedited PO from the manufacturing plant
        const autoPO: SupplierPO = {
          id: `PO-${Date.now().toString().slice(-4)}`,
          sap_po_number: `450099${Math.floor(1000 + Math.random() * 9000)}`,
          buyer_org: 'Aerospace Propulsion Center TX-04',
          item_name: part_name || 'Kanban Expedited Replenish',
          part_number,
          quantity: capacity || 50,
          unit: 'PCS',
          unit_price: 1250,
          total_value: (capacity || 50) * 1250,
          order_date: new Date().toISOString().split('T')[0],
          required_delivery_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          status: 'NEW',
          notes: `Automated pull signal from Shopfloor Bin: ${bin_code}`,
        };
        set((state: any) => ({
          purchaseOrders: [autoPO, ...state.purchaseOrders],
        }));
      }
    }
  });
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  token: null,
  supplierUser: null,
  isAuthenticated: false,
  isLoading: true,
  purchaseOrders: INITIAL_POS,
  inventory: INITIAL_INVENTORY,
  disruptions: INITIAL_DISRUPTIONS,
  certificates: INITIAL_CERTS,

  loadFromStorage: () => {
    initSupplierSyncListener(set, get);
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      const savedUser = userStr ? JSON.parse(userStr) : null;

      if (token && savedUser) {
        set({
          token,
          supplierUser: savedUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          token: 'demo-supplier-token',
          supplierUser: INITIAL_USER,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch {
      set({
        token: 'demo-supplier-token',
        supplierUser: INITIAL_USER,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Demo account acceptance
    const user: SupplierUser = {
      ...INITIAL_USER,
      email: email.trim(),
      display_name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, 'demo-supplier-jwt-token');
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    set({
      token: 'demo-supplier-jwt-token',
      supplierUser: user,
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
      supplierUser: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  acknowledgePO: (poId: string, confirmedDate?: string) => {
    const po = get().purchaseOrders.find((p) => p.id === poId);
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((p) =>
        p.id === poId
          ? {
              ...p,
              status: 'CONFIRMED',
              confirmed_delivery_date: confirmedDate || p.required_delivery_date,
            }
          : p
      ),
    }));

    if (po) {
      broadcastCrossPortalEvent('PO_ACKNOWLEDGED', 'SUPPLIER', {
        poId,
        sap_po_number: po.sap_po_number,
        part_number: po.part_number,
        item_name: po.item_name,
        confirmedDate: confirmedDate || po.required_delivery_date,
      });
    }
  },

  issueASN: (poId: string, carrier: string, trackingNumber: string) => {
    const po = get().purchaseOrders.find((p) => p.id === poId);
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((p) =>
        p.id === poId
          ? {
              ...p,
              status: 'IN_TRANSIT',
              carrier,
              tracking_number: trackingNumber,
            }
          : p
      ),
    }));

    if (po) {
      broadcastCrossPortalEvent('ASN_DISPATCHED', 'SUPPLIER', {
        poId,
        sap_po_number: po.sap_po_number,
        part_number: po.part_number,
        item_name: po.item_name,
        quantity: po.quantity,
        carrier,
        trackingNumber,
      });
    }
  },

  rejectPO: (poId: string, reason: string) => {
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === poId
          ? {
              ...po,
              status: 'REJECTED',
              notes: `Rejected by supplier: ${reason}`,
            }
          : po
      ),
    }));
  },

  updateInventoryStock: (id: string, delta: number) => {
    set((state) => ({
      inventory: state.inventory.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock_on_hand + delta);
          const status =
            newStock <= item.min_threshold / 2
              ? 'CRITICAL'
              : newStock <= item.min_threshold
              ? 'WARNING'
              : 'HEALTHY';
          return { ...item, stock_on_hand: newStock, status };
        }
        return item;
      }),
    }));
  },

  reportDisruption: (report) => {
    const newReport: SupplierDisruptionReport = {
      ...report,
      id: `DIS-SUP-${Date.now().toString().slice(-4)}`,
      reported_at: new Date().toISOString(),
      status: 'ACTIVE',
    };
    set((state) => ({
      disruptions: [newReport, ...state.disruptions],
    }));

    broadcastCrossPortalEvent('DISRUPTION_REPORTED', 'SUPPLIER', newReport);
  },

  resolveDisruption: (id: string) => {
    set((state) => ({
      disruptions: state.disruptions.map((d) => (d.id === id ? { ...d, status: 'RESOLVED' } : d)),
    }));

    broadcastCrossPortalEvent('DISRUPTION_RESOLVED', 'SUPPLIER', { id });
  },

  uploadCertificate: (cert) => {
    const newCert: SupplierQualityCert = {
      ...cert,
      id: `CERT-${Date.now().toString().slice(-3)}`,
      status: 'VALID',
    };
    set((state) => ({
      certificates: [newCert, ...state.certificates],
    }));
  },
}));
