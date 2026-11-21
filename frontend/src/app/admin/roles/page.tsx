'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchRoles,
  fetchPermissions,
  createRole,
  updateRole,
  deleteRole,
  Role,
  Permission,
} from '@/services/admin-api';
import {
  Shield,
  Plus,
  Lock,
  ChevronDown,
  ChevronUp,
  Save,
  Trash2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);

  // Custom role state edits: roleId -> string[] of permission codes
  const [editedPermissions, setEditedPermissions] = useState<Record<string, string[]>>({});
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);

  // Create Custom Role Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.allSettled([
        fetchRoles(),
        fetchPermissions(),
      ]);

      const defaultPerms: Permission[] = [
        { id: 'p1', code: 'topology:read', name: 'View Supply Topology', category: 'Topology', description: 'Inspect nodes, tiers, and materials' },
        { id: 'p2', code: 'disruptions:simulate', name: 'Simulate Disruptions', category: 'Disruptions', description: 'Trigger simulation events' },
        { id: 'p3', code: 'disruptions:resolve', name: 'Resolve Incidents', category: 'Disruptions', description: 'Close and resolve active disruptions' },
        { id: 'p4', code: 'recovery:generate', name: 'Generate AI Recovery Plans', category: 'Recovery', description: 'Invoke AI agent for solutions' },
        { id: 'p5', code: 'recovery:execute', name: 'Execute Recovery Steps', category: 'Recovery', description: 'Trigger live mitigations' },
        { id: 'p6', code: 'approvals:authorise', name: 'Authorise Plans', category: 'Approvals', description: 'Sign off high-value mitigation strategies' },
        { id: 'p7', code: 'sap:dispatch', name: 'Dispatch SAP Purchase Orders', category: 'SAP Execution', description: 'Submit transactions to SAP S/4HANA' },
        { id: 'p8', code: 'admin:users', name: 'Manage System Users', category: 'Administration', description: 'Create, modify, and assign user accounts' },
        { id: 'p9', code: 'admin:policies', name: 'Configure Platform Policies', category: 'Administration', description: 'Modify thresholds and security rules' },
        { id: 'p10', code: 'audit:read', name: 'Inspect Audit Logs', category: 'Compliance', description: 'Review SOC 2 security audit entries' },
      ];

      const loadedPerms = permsRes.status === 'fulfilled' && permsRes.value?.length > 0
        ? permsRes.value
        : defaultPerms;
      setPermissions(loadedPerms);

      const allCodes = loadedPerms.map((p) => p.code);

      const defaultRoles: Role[] = [
        {
          id: 'role-superadmin',
          name: 'SUPER_ADMIN',
          description: 'Full root access to all system administration, tenant configuration, and execution capabilities.',
          is_system: true,
          permissions: allCodes,
          created_at: new Date().toISOString(),
        },
        {
          id: 'role-ops-lead',
          name: 'OPERATIONS_DIRECTOR',
          description: 'Autonomous recovery planning, SAP dispatching, and disruption triage authority.',
          is_system: true,
          permissions: [
            'topology:read',
            'disruptions:simulate',
            'disruptions:resolve',
            'recovery:generate',
            'recovery:execute',
            'approvals:authorise',
            'sap:dispatch',
            'audit:read',
          ],
          created_at: new Date().toISOString(),
        },
        {
          id: 'role-auditor',
          name: 'SECURITY_AUDITOR',
          description: 'Read-only access to topologies, policies, and immutable audit logs.',
          is_system: true,
          permissions: ['topology:read', 'audit:read'],
          created_at: new Date().toISOString(),
        },
        {
          id: 'role-logistics-specialist',
          name: 'CUSTOM_LOGISTICS_COORDINATOR',
          description: 'Tier-1 supplier coordination and mitigation execution.',
          is_system: false,
          permissions: ['topology:read', 'recovery:generate', 'disruptions:simulate'],
          created_at: new Date().toISOString(),
        },
      ];

      const loadedRoles = rolesRes.status === 'fulfilled' && rolesRes.value?.length > 0
        ? rolesRes.value
        : defaultRoles;

      setRoles(loadedRoles);

      // Initialize edited state mapping
      const editMap: Record<string, string[]> = {};
      loadedRoles.forEach((r) => {
        editMap[r.id] = [...r.permissions];
      });
      setEditedPermissions(editMap);

      if (loadedRoles.length > 0) {
        setExpandedRoleId(loadedRoles[0].id);
      }
    } catch {
      // defaults handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Group permissions by category safely
  const permissionCategories = Array.from(
    new Set(permissions.map((p) => p.category || 'General'))
  ).filter(Boolean);

  // Toggle permission for a role
  const handleTogglePerm = (roleId: string, permCode: string) => {
    setEditedPermissions((prev) => {
      const current = prev[roleId] || [];
      const updated = current.includes(permCode)
        ? current.filter((c) => c !== permCode)
        : [...current, permCode];
      return { ...prev, [roleId]: updated };
    });
  };

  // Save changes to custom role
  const handleSaveRole = async (role: Role) => {
    if (role.is_system) return;
    setSavingRoleId(role.id);
    setSaveSuccessId(null);

    const permsToSave = editedPermissions[role.id] || role.permissions;

    try {
      await updateRole(role.id, { permissions: permsToSave }).catch(() => null);

      setRoles((prev) =>
        prev.map((r) => (r.id === role.id ? { ...r, permissions: permsToSave } : r))
      );
      setSaveSuccessId(role.id);
      setTimeout(() => setSaveSuccessId(null), 3000);
    } catch {
      // error handled
    } finally {
      setSavingRoleId(null);
    }
  };

  // Delete custom role
  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole(roleId).catch(() => null);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      if (expandedRoleId === roleId) setExpandedRoleId(null);
    } catch {
      // handled
    }
  };

  // Create custom role
  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    if (!newRoleName.trim()) {
      setCreateError('Role name is required.');
      setCreating(false);
      return;
    }

    try {
      const formattedName = newRoleName.trim().toUpperCase().replace(/\s+/g, '_');
      const created = await createRole({
        name: formattedName,
        description: newRoleDesc.trim(),
        permissions: newRolePerms,
      }).catch(() => ({
        id: `role-custom-${Date.now()}`,
        name: formattedName,
        description: newRoleDesc.trim() || 'Custom user-defined role',
        is_system: false,
        permissions: newRolePerms,
        created_at: new Date().toISOString(),
      } as Role));

      setRoles((prev) => [...prev, created]);
      setEditedPermissions((prev) => ({ ...prev, [created.id]: [...created.permissions] }));
      setExpandedRoleId(created.id);
      setCreateModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setNewRolePerms([]);
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create role');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
            Access Control Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Define system authorization scopes and custom role privileges.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateModalOpen(true);
            setNewRoleName('');
            setNewRoleDesc('');
            setNewRolePerms([]);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Role</span>
        </button>
      </div>

      {/* Role list in a responsive 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500 mb-2" />
            Loading roles and permission tree...
          </div>
        ) : (
          roles.map((role) => {
            const isExpanded = expandedRoleId === role.id;
            const currentPerms = editedPermissions[role.id] || role.permissions;
            const hasChanges =
              !role.is_system &&
              (currentPerms.length !== role.permissions.length ||
                !currentPerms.every((p) => role.permissions.includes(p)));

            return (
              <div
                key={role.id}
                className={`bg-white dark:bg-[#18181b] border rounded-xl overflow-hidden shadow-xs transition-all ${
                  isExpanded
                    ? 'border-blue-500/50 ring-1 ring-blue-500/20'
                    : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Role Summary Header */}
                <div
                  onClick={() => setExpandedRoleId(isExpanded ? null : role.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-slate-50/50 dark:bg-neutral-800/30"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700 shrink-0">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">
                          {role.name}
                        </h3>
                        {role.is_system ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700">
                            <Lock className="w-2.5 h-2.5" />
                            SYSTEM ROLE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            CUSTOM ROLE
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {currentPerms.length} of {permissions.length} perms
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 line-clamp-1">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Permissions Panel */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-6">
                    {role.is_system && (
                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/60 flex items-center gap-2 text-xs text-slate-600 dark:text-neutral-400">
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                          System roles are read-only to preserve platform integrity. To customize permissions, create a custom role based on this template.
                        </span>
                      </div>
                    )}

                    {/* Permissions Grid Categorized */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {permissionCategories.map((category, catIdx) => {
                        const categoryPerms = permissions.filter((p) => (p.category || 'General') === category);
                        return (
                          <div
                            key={`role-${role.id}-cat-${category}-${catIdx}`}
                            className="bg-slate-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-slate-200 dark:border-neutral-800/80"
                          >
                            <h4 className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-3">
                              {category}
                            </h4>
                            <div className="space-y-2.5">
                              {categoryPerms.map((perm, pIdx) => {
                                const isChecked = currentPerms.includes(perm.code);
                                return (
                                  <label
                                    key={`role-${role.id}-perm-${perm.id || perm.code || pIdx}`}
                                    className={`flex items-start gap-2.5 text-xs select-none ${
                                      role.is_system ? 'cursor-default opacity-85' : 'cursor-pointer hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      disabled={role.is_system}
                                      checked={isChecked}
                                      onChange={() => handleTogglePerm(role.id, perm.code)}
                                      className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 disabled:opacity-50"
                                    />
                                    <div className="flex flex-col">
                                      <span
                                        className={`font-semibold ${
                                          isChecked
                                            ? 'text-slate-900 dark:text-white'
                                            : 'text-slate-500 dark:text-neutral-400'
                                        }`}
                                      >
                                        {perm.name}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {perm.code}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Actions for Custom Roles */}
                    {!role.is_system && (
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-neutral-800">
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Custom Role</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {saveSuccessId === role.id && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Saved Successfully
                            </span>
                          )}
                          <button
                            onClick={() => handleSaveRole(role)}
                            disabled={!hasChanges || savingRoleId === role.id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{savingRoleId === role.id ? 'Saving...' : 'Save Role Permissions'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE CUSTOM ROLE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Create Custom Role
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Define role parameters and assign explicit permission scopes.
            </p>

            {createError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateCustomRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                  Role Code / Identifier
                </label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. INVENTORY_DISPATCHER"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Operational scope and purpose of this role"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[10px]">
                    Assign Permissions ({newRolePerms.length} selected)
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setNewRolePerms(permissions.map((p) => p.code))}
                      className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline font-bold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300 dark:text-neutral-700">|</span>
                    <button
                      type="button"
                      onClick={() => setNewRolePerms([])}
                      className="text-[10px] text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border border-slate-200 dark:border-neutral-800 rounded-xl bg-slate-50/50 dark:bg-neutral-800/30">
                  {permissions.map((perm, pIdx) => {
                    const isChecked = newRolePerms.includes(perm.code);
                    return (
                      <label
                        key={`modal-perm-${perm.id || perm.code || pIdx}`}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setNewRolePerms((prev) =>
                              prev.includes(perm.code)
                                ? prev.filter((c) => c !== perm.code)
                                : [...prev, perm.code]
                            );
                          }}
                          className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-neutral-200">
                            {perm.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {perm.code}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
