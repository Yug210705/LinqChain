import { create } from 'zustand';

export type PortalType = 'OPERATOR' | 'SUPPLIER' | 'MANUFACTURER' | 'ADMIN';

export interface AuthorizedUser {
  id: string;
  email: string;
  display_name: string;
  authorized_portal: PortalType;
  role: string;
  organization: string;
  job_title?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string | null;
}

const STORAGE_KEY = 'linqchain_authorized_users_directory';

const DEFAULT_AUTHORIZED_USERS: AuthorizedUser[] = [
  // 1. Operator Portal Users
  {
    id: 'auth-usr-001',
    email: 'operator@linqchain.com',
    display_name: 'Lead Supply Chain Operator',
    authorized_portal: 'OPERATOR',
    role: 'LEAD_OPERATOR',
    organization: 'Enterprise Aerospace Corp',
    job_title: 'Lead Operations Director',
    is_active: true,
    created_at: '2026-01-15T08:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'auth-usr-001b',
    email: 'operator@resilienceos.com',
    display_name: 'Lead Supply Chain Operator',
    authorized_portal: 'OPERATOR',
    role: 'LEAD_OPERATOR',
    organization: 'Enterprise Aerospace Corp',
    job_title: 'Lead Operations Director',
    is_active: true,
    created_at: '2026-01-15T08:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'auth-usr-002',
    email: 'sarah.chen@linqchain.com',
    display_name: 'Sarah Chen (Admin Operator)',
    authorized_portal: 'OPERATOR',
    role: 'OPERATOR',
    organization: 'Enterprise Aerospace Corp',
    job_title: 'Principal Supply Chain Analyst',
    is_active: true,
    created_at: '2026-02-01T09:30:00Z',
    last_login: new Date().toISOString(),
  },

  // 2. Supplier Portal Users
  {
    id: 'auth-usr-003',
    email: 'supplier@titanium-forgings.com',
    display_name: 'Marcus Vance',
    authorized_portal: 'SUPPLIER',
    role: 'TIER_1_SUPPLIER',
    organization: 'Titanium Alloy Forgings Corp',
    job_title: 'VP of Commercial Logistics',
    is_active: true,
    created_at: '2026-01-20T10:15:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'auth-usr-004',
    email: 'logistics@micro-sensors.com',
    display_name: 'Elena Rostova',
    authorized_portal: 'SUPPLIER',
    role: 'TIER_2_SUPPLIER',
    organization: 'Micro-Sensor Dynamics Ltd',
    job_title: 'Shipment Compliance Lead',
    is_active: true,
    created_at: '2026-02-10T11:00:00Z',
    last_login: null,
  },

  // 3. Manufacturer Portal Users
  {
    id: 'auth-usr-005',
    email: 'plant.director@linqchain-aerospace.com',
    display_name: 'Col. Marcus Vance (Ret.)',
    authorized_portal: 'MANUFACTURER',
    role: 'PLANT_DIRECTOR',
    organization: 'Aerospace Propulsion Center TX-04',
    job_title: 'Facility Director & Head of Assembly',
    is_active: true,
    created_at: '2026-01-10T07:45:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'auth-usr-006',
    email: 'jordan.cole@linqchain-aerospace.com',
    display_name: 'Jordan Cole',
    authorized_portal: 'MANUFACTURER',
    role: 'LINE_SUPERVISOR',
    organization: 'Aerospace Propulsion Center TX-04',
    job_title: 'Turbine Cell Lead Engineer',
    is_active: true,
    created_at: '2026-02-15T14:20:00Z',
    last_login: new Date().toISOString(),
  },

  // 4. Admin Portal Users
  {
    id: 'auth-usr-007',
    email: 'admin@linqchain.com',
    display_name: 'Primary Security Administrator',
    authorized_portal: 'ADMIN',
    role: 'SUPER_ADMIN',
    organization: 'LinqChain Global Governance',
    job_title: 'Chief Information Security Officer',
    is_active: true,
    created_at: '2025-11-01T00:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'auth-usr-007b',
    email: 'admin@resilienceos.com',
    display_name: 'Primary Security Administrator',
    authorized_portal: 'ADMIN',
    role: 'SUPER_ADMIN',
    organization: 'LinqChain Global Governance',
    job_title: 'Chief Information Security Officer',
    is_active: true,
    created_at: '2025-11-01T00:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'auth-usr-007c',
    email: 'owner@resilienceos.com',
    display_name: 'System Owner',
    authorized_portal: 'ADMIN',
    role: 'SUPER_ADMIN',
    organization: 'LinqChain Global Governance',
    job_title: 'Chief Executive Owner',
    is_active: true,
    created_at: '2025-11-01T00:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'auth-usr-008',
    email: 'admin@resilienceos.io',
    display_name: 'System Governance Lead',
    authorized_portal: 'ADMIN',
    role: 'SUPER_ADMIN',
    organization: 'LinqChain Global Governance',
    job_title: 'Platform Infrastructure Lead',
    is_active: true,
    created_at: '2025-12-01T00:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'auth-usr-009',
    email: 'sec-ops@resilienceos.io',
    display_name: 'SecOps Auditor',
    authorized_portal: 'ADMIN',
    role: 'SECURITY_ADMIN',
    organization: 'LinqChain Global Governance',
    job_title: 'Airworthiness & ITAR Auditor',
    is_active: true,
    created_at: '2026-01-05T08:00:00Z',
    last_login: new Date().toISOString(),
  },
];

function loadStoredUsers(): AuthorizedUser[] {
  if (typeof window === 'undefined') return DEFAULT_AUTHORIZED_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_AUTHORIZED_USERS));
      return DEFAULT_AUTHORIZED_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Error loading authorized users from localStorage:', e);
  }
  return DEFAULT_AUTHORIZED_USERS;
}

function saveStoredUsers(users: AuthorizedUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving authorized users to localStorage:', e);
  }
}

interface AuthorizedUsersState {
  users: AuthorizedUser[];
  getAuthorizedUserByEmail: (email: string) => AuthorizedUser | undefined;
  addAuthorizedUser: (user: Omit<AuthorizedUser, 'id' | 'created_at'>) => AuthorizedUser;
  updateAuthorizedUser: (id: string, updates: Partial<AuthorizedUser>) => void;
  toggleUserStatus: (id: string) => void;
  deleteAuthorizedUser: (id: string) => void;
  resetToDefaults: () => void;
}

export const useAuthorizedUsersStore = create<AuthorizedUsersState>((set, get) => ({
  users: loadStoredUsers(),

  getAuthorizedUserByEmail: (email: string) => {
    let cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'admin') cleanEmail = 'admin@linqchain.com';
    if (cleanEmail === 'operator') cleanEmail = 'operator@linqchain.com';
    if (cleanEmail === 'supplier') cleanEmail = 'supplier@titanium-forgings.com';
    if (cleanEmail === 'manufacturer') cleanEmail = 'plant.director@linqchain-aerospace.com';

    const currentUsers = get().users || [];
    let match = currentUsers.find((u) => u.email.trim().toLowerCase() === cleanEmail);
    if (!match) {
      match = DEFAULT_AUTHORIZED_USERS.find((u) => u.email.trim().toLowerCase() === cleanEmail);
    }
    return match;
  },

  addAuthorizedUser: (userPayload) => {
    const newUser: AuthorizedUser = {
      ...userPayload,
      id: `auth-usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
      last_login: null,
    };

    const updated = [newUser, ...get().users];
    saveStoredUsers(updated);
    set({ users: updated });
    return newUser;
  },

  updateAuthorizedUser: (id: string, updates: Partial<AuthorizedUser>) => {
    const updated = get().users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    saveStoredUsers(updated);
    set({ users: updated });
  },

  toggleUserStatus: (id: string) => {
    const updated = get().users.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u));
    saveStoredUsers(updated);
    set({ users: updated });
  },

  deleteAuthorizedUser: (id: string) => {
    const updated = get().users.filter((u) => u.id !== id);
    saveStoredUsers(updated);
    set({ users: updated });
  },

  resetToDefaults: () => {
    saveStoredUsers(DEFAULT_AUTHORIZED_USERS);
    set({ users: DEFAULT_AUTHORIZED_USERS });
  },
}));
