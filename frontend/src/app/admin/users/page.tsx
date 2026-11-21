'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  fetchPlatformUsers,
  createPlatformUser,
  updatePlatformUser,
  deletePlatformUser,
  fetchOrganizations,
  AdminUser,
  PlatformUser,
  Organization,
} from '@/services/admin-api';
import {
  Users,
  Shield,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Building,
  RefreshCw,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  KeyRound,
} from 'lucide-react';
import {
  useAuthorizedUsersStore,
  AuthorizedUser,
  PortalType,
} from '@/stores/useAuthorizedUsersStore';
import { broadcastCrossPortalEvent } from '@/lib/cross-portal-sync';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'authorized' | 'admin' | 'platform'>('authorized');
  
  // Authorized Directory Store
  const {
    users: authorizedUsers,
    addAuthorizedUser,
    updateAuthorizedUser,
    toggleUserStatus,
    deleteAuthorizedUser,
    resetToDefaults,
  } = useAuthorizedUsersStore();

  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [platformList, setPlatformList] = useState<PlatformUser[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [portalFilter, setPortalFilter] = useState<'ALL' | PortalType>('ALL');
  const [orgFilter, setOrgFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
    authorized_portal: PortalType;
    organization: string;
    job_title: string;
    org_id: string;
    is_active: boolean;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR',
    authorized_portal: 'OPERATOR',
    organization: 'Enterprise Aerospace Corp',
    job_title: 'Operations Analyst',
    org_id: '',
    is_active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete / Deactivate confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'toggle_status' | 'delete';
    userId: string;
    userName: string;
    currentStatus?: boolean;
  }>({
    isOpen: false,
    type: 'toggle_status',
    userId: '',
    userName: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, platformRes, orgsRes] = await Promise.allSettled([
        fetchAdminUsers(),
        fetchPlatformUsers({ page: 1, limit: 100 }),
        fetchOrganizations({ limit: 100 }),
      ]);

      if (adminsRes.status === 'fulfilled' && Array.isArray(adminsRes.value)) {
        setAdminList(adminsRes.value);
      } else {
        setAdminList([
          {
            id: 'adm-01',
            email: 'admin@resilienceos.io',
            display_name: 'Primary Administrator',
            role: 'SUPER_ADMIN',
            is_active: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
            last_login: new Date().toISOString(),
          },
          {
            id: 'adm-02',
            email: 'sec-ops@resilienceos.io',
            display_name: 'Security Lead',
            role: 'SECURITY_ADMIN',
            is_active: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
            last_login: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          },
          {
            id: 'adm-03',
            email: 'compliance-auditor@resilienceos.io',
            display_name: 'SOC2 Auditor',
            role: 'AUDITOR',
            is_active: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            last_login: null,
          },
        ]);
      }

      if (platformRes.status === 'fulfilled' && platformRes.value?.items) {
        setPlatformList(platformRes.value.items);
      } else {
        setPlatformList([
          {
            id: 'usr-101',
            email: 'elena.rostova@acme-aerospace.com',
            full_name: 'Elena Rostova',
            role: 'SUPPLY_CHAIN_DIRECTOR',
            organization_id: 'org-1',
            organization_name: 'Acme Aerospace Global',
            is_active: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
            last_login: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          },
          {
            id: 'usr-102',
            email: 'marcus.vance@acme-aerospace.com',
            full_name: 'Marcus Vance',
            role: 'OPERATIONS_MANAGER',
            organization_id: 'org-1',
            organization_name: 'Acme Aerospace Global',
            is_active: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
            last_login: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          },
          {
            id: 'usr-103',
            email: 'chen.wei@nexus-logistics.de',
            full_name: 'Chen Wei',
            role: 'LOGISTICS_LEAD',
            organization_id: 'org-2',
            organization_name: 'Nexus Logistics Europe',
            is_active: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
            last_login: null,
          },
        ]);
      }

      if (orgsRes.status === 'fulfilled' && orgsRes.value?.items) {
        setOrgs(orgsRes.value.items);
      } else {
        setOrgs([
          { id: 'org-1', name: 'Acme Aerospace Global', slug: 'acme-aerospace', user_count: 12, is_active: true, created_at: new Date().toISOString() },
          { id: 'org-2', name: 'Nexus Logistics Europe', slug: 'nexus-logistics', user_count: 5, is_active: true, created_at: new Date().toISOString() },
          { id: 'org-3', name: 'Pacific Freight & Cargo', slug: 'pacific-freight', user_count: 8, is_active: true, created_at: new Date().toISOString() },
        ]);
      }
    } catch {
      // Handled via defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered lists depending on activeTab
  const getFilteredList = () => {
    if (activeTab === 'authorized') {
      return authorizedUsers.filter((u) => {
        const matchesSearch =
          u.display_name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.organization.toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase());

        const matchesPortal = portalFilter === 'ALL' || u.authorized_portal === portalFilter;
        return matchesSearch && matchesPortal;
      });
    }

    const currentList = activeTab === 'admin' ? adminList : platformList;
    return currentList.filter((user) => {
      const name = (activeTab === 'admin' ? (user as AdminUser).display_name : (user as PlatformUser).full_name) || '';
      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      let matchesOrg = true;
      if (activeTab === 'platform') {
        matchesOrg = orgFilter === 'ALL' || (user as PlatformUser).organization_id === orgFilter;
      }

      return matchesSearch && matchesRole && matchesOrg;
    });
  };

  const filteredList = getFilteredList();
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = filteredList.slice((page - 1) * pageSize, page * pageSize);

  // Open Create Modal
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormError(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: activeTab === 'authorized' ? 'OPERATOR' : activeTab === 'admin' ? 'ADMIN' : 'OPERATOR',
      authorized_portal: 'OPERATOR',
      organization: 'Enterprise Aerospace Corp',
      job_title: 'Operations Analyst',
      org_id: orgs[0]?.id || '',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (user: AuthorizedUser | AdminUser | PlatformUser) => {
    setIsEditing(true);
    setEditingId(user.id);
    setFormError(null);

    if (activeTab === 'authorized') {
      const u = user as AuthorizedUser;
      setFormData({
        name: u.display_name,
        email: u.email,
        password: '',
        role: u.role,
        authorized_portal: u.authorized_portal,
        organization: u.organization,
        job_title: u.job_title || '',
        org_id: '',
        is_active: u.is_active,
      });
    } else if (activeTab === 'admin') {
      const u = user as AdminUser;
      setFormData({
        name: u.display_name,
        email: u.email,
        password: '',
        role: u.role,
        authorized_portal: 'ADMIN',
        organization: 'LinqChain Global Governance',
        job_title: 'System Administrator',
        org_id: '',
        is_active: u.is_active,
      });
    } else {
      const u = user as PlatformUser;
      setFormData({
        name: u.full_name,
        email: u.email,
        password: '',
        role: u.role,
        authorized_portal: 'OPERATOR',
        organization: u.organization_name || 'Assigned Org',
        job_title: 'Platform Specialist',
        org_id: u.organization_id || '',
        is_active: u.is_active,
      });
    }
    setIsModalOpen(true);
  };

  const renderPortalBadge = (portal: PortalType) => {
    switch (portal) {
      case 'OPERATOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Operator Portal
          </span>
        );
      case 'SUPPLIER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Supplier Hub
          </span>
        );
      case 'MANUFACTURER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Manufacturing MES
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Admin Control
          </span>
        );
    }
  };

  // Submit User Create / Update
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      if (activeTab === 'authorized') {
        if (isEditing && editingId) {
          updateAuthorizedUser(editingId, {
            display_name: formData.name,
            email: formData.email.trim().toLowerCase(),
            authorized_portal: formData.authorized_portal,
            role: formData.role,
            organization: formData.organization || 'Enterprise Aerospace Corp',
            job_title: formData.job_title,
            is_active: formData.is_active,
          });

          broadcastCrossPortalEvent('USER_AUTH_UPDATED', 'ADMIN', {
            id: editingId,
            email: formData.email.trim().toLowerCase(),
            portal: formData.authorized_portal,
            action: 'UPDATE',
            is_active: formData.is_active,
          });
        } else {
          // Check for duplicate email
          const existing = authorizedUsers.find(
            (u) => u.email.trim().toLowerCase() === formData.email.trim().toLowerCase()
          );
          if (existing) {
            setFormError(`An authorized account already exists for ${formData.email}. Please edit the existing record.`);
            setFormSubmitting(false);
            return;
          }

          const created = addAuthorizedUser({
            email: formData.email.trim().toLowerCase(),
            display_name: formData.name,
            authorized_portal: formData.authorized_portal,
            role: formData.role,
            organization: formData.organization || 'Enterprise Aerospace Corp',
            job_title: formData.job_title,
            is_active: formData.is_active,
            last_login: null,
          });

          broadcastCrossPortalEvent('USER_AUTH_UPDATED', 'ADMIN', {
            id: created.id,
            email: created.email,
            portal: created.authorized_portal,
            action: 'CREATE',
            is_active: created.is_active,
          });
        }
      } else if (activeTab === 'admin') {
        if (isEditing && editingId) {
          const updated = await updateAdminUser(editingId, {
            display_name: formData.name,
            email: formData.email,
            role: formData.role,
            is_active: formData.is_active,
            ...(formData.password ? { password: formData.password } : {}),
          }).catch(() => ({
            id: editingId,
            display_name: formData.name,
            email: formData.email,
            role: formData.role,
            is_active: formData.is_active,
            created_at: new Date().toISOString(),
          } as AdminUser));

          setAdminList((prev) =>
            prev.map((u) => (u.id === editingId ? { ...u, ...updated } : u))
          );
        } else {
          const created = await createAdminUser({
            display_name: formData.name,
            email: formData.email,
            password: formData.password || 'TemporaryAdmin123!',
            role: formData.role,
            is_active: formData.is_active,
          }).catch(() => ({
            id: `adm-${Date.now()}`,
            display_name: formData.name,
            email: formData.email,
            role: formData.role,
            is_active: formData.is_active,
            created_at: new Date().toISOString(),
          } as AdminUser));

          setAdminList((prev) => [created, ...prev]);
        }
      } else {
        // Platform user
        const orgMatch = orgs.find((o) => o.id === formData.org_id);
        if (isEditing && editingId) {
          const updated = await updatePlatformUser(editingId, {
            full_name: formData.name,
            email: formData.email,
            role: formData.role,
            organization_id: formData.org_id,
            is_active: formData.is_active,
          }).catch(() => ({
            id: editingId,
            full_name: formData.name,
            email: formData.email,
            role: formData.role,
            organization_id: formData.org_id,
            organization_name: orgMatch?.name || 'Assigned Org',
            is_active: formData.is_active,
            created_at: new Date().toISOString(),
          } as PlatformUser));

          setPlatformList((prev) =>
            prev.map((u) => (u.id === editingId ? { ...u, ...updated } : u))
          );
        } else {
          const created = await createPlatformUser({
            full_name: formData.name,
            email: formData.email,
            password: formData.password || 'WelcomeUser123!',
            role: formData.role,
            organization_id: formData.org_id,
            is_active: formData.is_active,
          }).catch(() => ({
            id: `usr-${Date.now()}`,
            full_name: formData.name,
            email: formData.email,
            role: formData.role,
            organization_id: formData.org_id,
            organization_name: orgMatch?.name || 'New Organization',
            is_active: formData.is_active,
            created_at: new Date().toISOString(),
          } as PlatformUser));

          setPlatformList((prev) => [created, ...prev]);
        }
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save user records');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle user activation status
  const handleToggleStatus = async (userId: string, currentActive: boolean) => {
    try {
      if (activeTab === 'authorized') {
        toggleUserStatus(userId);
        const match = authorizedUsers.find((u) => u.id === userId);
        if (match) {
          broadcastCrossPortalEvent('USER_AUTH_UPDATED', 'ADMIN', {
            id: userId,
            email: match.email,
            portal: match.authorized_portal,
            action: 'TOGGLE_STATUS',
            is_active: !currentActive,
          });
        }
      } else if (activeTab === 'admin') {
        await updateAdminUser(userId, { is_active: !currentActive }).catch(() => null);
        setAdminList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: !currentActive } : u))
        );
      } else {
        await updatePlatformUser(userId, { is_active: !currentActive }).catch(() => null);
        setPlatformList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: !currentActive } : u))
        );
      }
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } catch {
      // ignored
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    try {
      if (activeTab === 'authorized') {
        const match = authorizedUsers.find((u) => u.id === userId);
        deleteAuthorizedUser(userId);
        if (match) {
          broadcastCrossPortalEvent('USER_AUTH_UPDATED', 'ADMIN', {
            id: userId,
            email: match.email,
            portal: match.authorized_portal,
            action: 'REVOKE',
            is_active: false,
          });
        }
      } else if (activeTab === 'admin') {
        await deleteAdminUser(userId).catch(() => null);
        setAdminList((prev) => prev.filter((u) => u.id !== userId));
      } else {
        await deletePlatformUser(userId).catch(() => null);
        setPlatformList((prev) => prev.filter((u) => u.id !== userId));
      }
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } catch {
      // ignored
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/80 dark:bg-neutral-800/80 p-1 rounded-xl border border-slate-300/60 dark:border-neutral-700 w-fit flex-wrap gap-1">
          {/* 1. Authorized Portal Directory (PRIMARY GATEWAY) */}
          <button
            onClick={() => {
              setActiveTab('authorized');
              setPage(1);
              setPortalFilter('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'authorized'
                ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4 text-blue-500" />
            <span>Authorized Portal Directory ({authorizedUsers.length})</span>
          </button>

          {/* 2. Admin Users */}
          <button
            onClick={() => {
              setActiveTab('admin');
              setPage(1);
              setRoleFilter('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Users ({adminList.length})</span>
          </button>

          {/* 3. Platform Users */}
          <button
            onClick={() => {
              setActiveTab('platform');
              setPage(1);
              setRoleFilter('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'platform'
                ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Platform Users ({platformList.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'authorized' && (
            <button
              onClick={() => {
                if (confirm('Reset authorized user directory to factory defaults?')) {
                  resetToDefaults();
                  broadcastCrossPortalEvent('USER_AUTH_UPDATED', 'ADMIN', { action: 'RESET_DEFAULTS' });
                }
              }}
              title="Reset default authorizations"
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 transition-colors cursor-pointer"
            >
              Reset Defaults
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === 'authorized'
                ? 'Authorize New Email'
                : activeTab === 'admin'
                ? 'Create Admin'
                : 'Create Platform User'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-3.5 rounded-xl">
        {/* Search Input */}
        <div className={activeTab === 'authorized' ? 'sm:col-span-6 relative' : 'sm:col-span-5 relative'}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={
              activeTab === 'authorized'
                ? 'Search authorized emails, names, roles, or organizations...'
                : `Search ${activeTab === 'admin' ? 'admins' : 'users'} by name or email...`
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Portal Filter (Authorized tab only) */}
        {activeTab === 'authorized' && (
          <div className="sm:col-span-5">
            <select
              value={portalFilter}
              onChange={(e) => {
                setPortalFilter(e.target.value as any);
                setPage(1);
              }}
              className="w-full py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
            >
              <option value="ALL">All Authorized Portals</option>
              <option value="OPERATOR">Operator Portal (/command-center)</option>
              <option value="SUPPLIER">Supplier Hub (/supplier)</option>
              <option value="MANUFACTURER">Manufacturer MES (/manufacturer)</option>
              <option value="ADMIN">Admin Governance (/admin)</option>
            </select>
          </div>
        )}

        {/* Role Filter (Admin & Platform tabs only) */}
        {activeTab !== 'authorized' && (
          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Roles</option>
              {activeTab === 'admin' ? (
                <>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="SECURITY_ADMIN">SECURITY_ADMIN</option>
                  <option value="AUDITOR">AUDITOR</option>
                  <option value="ADMIN">ADMIN</option>
                </>
              ) : (
                <>
                  <option value="SUPPLY_CHAIN_DIRECTOR">SUPPLY_CHAIN_DIRECTOR</option>
                  <option value="OPERATIONS_MANAGER">OPERATIONS_MANAGER</option>
                  <option value="LOGISTICS_LEAD">LOGISTICS_LEAD</option>
                  <option value="VIEWER">VIEWER</option>
                </>
              )}
            </select>
          </div>
        )}

        {/* Organization Filter (Platform Users only) */}
        {activeTab === 'platform' && (
          <div className="sm:col-span-3">
            <select
              value={orgFilter}
              onChange={(e) => {
                setOrgFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Organizations</option>
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Refresh button */}
        <div className="sm:col-span-1 flex justify-end">
          <button
            onClick={loadData}
            title="Refresh user list"
            className="p-2 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:text-amber-500 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-neutral-800/60 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Identity & Title</th>
                {activeTab === 'authorized' ? (
                  <th className="py-3 px-6">Authorized Portal Access</th>
                ) : null}
                <th className="py-3 px-6">Email Address</th>
                <th className="py-3 px-6">
                  {activeTab === 'authorized' ? 'Role & Organization' : 'Assigned Role'}
                </th>
                {activeTab === 'platform' && <th className="py-3 px-6">Organization</th>}
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Last Activity</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-neutral-800 text-slate-700 dark:text-neutral-300">
              {loading && activeTab !== 'authorized' ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-500 mb-2" />
                    Fetching user directories...
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No authorized records found matching current query.
                  </td>
                </tr>
              ) : (
                paginatedList.map((user: any) => {
                  if (activeTab === 'authorized') {
                    const authUser = user as AuthorizedUser;
                    return (
                      <tr key={authUser.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold flex items-center justify-center text-xs border border-slate-200 dark:border-neutral-700">
                              {authUser.display_name ? authUser.display_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">
                                {authUser.display_name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {authUser.job_title || authUser.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          {renderPortalBadge(authUser.authorized_portal)}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-slate-600 dark:text-neutral-300 font-medium">
                          {authUser.email}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-neutral-200">
                              {authUser.role}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {authUser.organization}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          <button
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                type: 'toggle_status',
                                userId: authUser.id,
                                userName: authUser.display_name,
                                currentStatus: authUser.is_active,
                              })
                            }
                            className="cursor-pointer"
                            title="Click to toggle access state"
                          >
                            {authUser.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle className="w-3 h-3" />
                                ACTIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20">
                                <XCircle className="w-3 h-3" />
                                SUSPENDED
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-6 text-slate-500 dark:text-neutral-400 text-[11px]">
                          {authUser.last_login ? new Date(authUser.last_login).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(authUser)}
                              title="Edit Authorization"
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 hover:text-amber-500 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  type: 'delete',
                                  userId: authUser.id,
                                  userName: authUser.display_name,
                                })
                              }
                              title="Revoke Portal Access"
                              className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const name =
                    activeTab === 'admin'
                      ? (user as AdminUser).display_name
                      : (user as PlatformUser).full_name;
                  const orgName = (user as PlatformUser).organization_name;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold flex items-center justify-center text-xs border border-slate-200 dark:border-neutral-700">
                            {name ? name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {name || 'Unnamed'}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-600 dark:text-neutral-300">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          {user.role}
                        </span>
                      </td>
                      {activeTab === 'platform' && (
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-300">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{orgName || 'Global'}</span>
                          </div>
                        </td>
                      )}
                      <td className="py-3.5 px-6">
                        <button
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              type: 'toggle_status',
                              userId: user.id,
                              userName: name,
                              currentStatus: user.is_active,
                            })
                          }
                          className="cursor-pointer"
                          title="Click to toggle status"
                        >
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-500 dark:text-neutral-400 border border-slate-500/20">
                              <XCircle className="w-3 h-3" />
                              INACTIVE
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 dark:text-neutral-400 text-[11px]">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(user)}
                            title="Edit User"
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 hover:text-amber-500 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                type: 'delete',
                                userId: user.id,
                                userName: name,
                              })
                            }
                            title="Delete User"
                            className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
          <span>
            Showing {Math.min(filteredList.length, (page - 1) * pageSize + 1)} to{' '}
            {Math.min(filteredList.length, page * pageSize)} of {filteredList.length} entries
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-slate-200 dark:border-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-neutral-200">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-slate-200 dark:border-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {isEditing
                ? activeTab === 'authorized'
                  ? 'Edit Portal Authorization'
                  : 'Edit User'
                : activeTab === 'authorized'
                ? 'Authorize New Email for Portal Access'
                : `Create New ${activeTab === 'admin' ? 'Admin' : 'Platform User'}`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {activeTab === 'authorized'
                ? 'Specify which portal this email is authorized to access upon login. Unauthorized emails are blocked at the perimeter.'
                : 'Configure identity attributes, role assignment, and access state.'}
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                  Authorized Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@organization.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              {activeTab === 'authorized' ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                      Target Authorized Portal
                    </label>
                    <select
                      value={formData.authorized_portal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          authorized_portal: e.target.value as PortalType,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                    >
                      <option value="OPERATOR">OPERATOR — Operator Command Center (/command-center)</option>
                      <option value="SUPPLIER">SUPPLIER — Supplier Collaboration Hub (/supplier)</option>
                      <option value="MANUFACTURER">MANUFACTURER — Manufacturing MES (/manufacturer)</option>
                      <option value="ADMIN">ADMIN — Global Governance & Control (/admin)</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Upon entering this email at /login, the user will automatically route to this isolated portal.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                        Role Designation
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="e.g. TIER_1_SUPPLIER"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        placeholder="e.g. Operations Director"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                      Enterprise Organization
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. Titanium Alloy Forgings Corp"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                      {isEditing ? 'Password (Leave blank to keep existing)' : 'Password'}
                    </label>
                    <input
                      type="password"
                      required={!isEditing}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {activeTab === 'admin' ? (
                        <>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="SECURITY_ADMIN">SECURITY_ADMIN</option>
                          <option value="AUDITOR">AUDITOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </>
                      ) : (
                        <>
                          <option value="SUPPLY_CHAIN_DIRECTOR">SUPPLY_CHAIN_DIRECTOR</option>
                          <option value="OPERATIONS_MANAGER">OPERATIONS_MANAGER</option>
                          <option value="LOGISTICS_LEAD">LOGISTICS_LEAD</option>
                          <option value="OPERATOR">OPERATOR</option>
                          <option value="VIEWER">VIEWER</option>
                        </>
                      )}
                    </select>
                  </div>

                  {activeTab === 'platform' && (
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                        Organization Tenant
                      </label>
                      <select
                        value={formData.org_id}
                        onChange={(e) => setFormData({ ...formData, org_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {orgs.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="active-checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="active-checkbox" className="text-xs text-slate-700 dark:text-neutral-300 font-semibold cursor-pointer">
                  Account is Active & Permitted for Portal Access
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting
                    ? 'Saving...'
                    : isEditing
                    ? 'Update Authorization'
                    : 'Authorize User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {confirmModal.type === 'delete'
                ? `Delete ${confirmModal.userName}?`
                : `${confirmModal.currentStatus ? 'Deactivate' : 'Activate'} ${confirmModal.userName}?`}
            </h4>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 mb-5">
              {confirmModal.type === 'delete'
                ? 'This action will permanently revoke access and remove the account record.'
                : 'Changing the active state will immediately affect the user session and permission checks.'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === 'delete') {
                    handleDeleteUser(confirmModal.userId);
                  } else {
                    handleToggleStatus(confirmModal.userId, !!confirmModal.currentStatus);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer ${
                  confirmModal.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
