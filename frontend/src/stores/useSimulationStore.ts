import { create } from 'zustand';

export interface ActiveRecovery {
  strategy?: string;
  /** Supplier IDs (bare, e.g. "SUP-002") that replace the disrupted node */
  suppliers: string[];
  /** Full graph id of the entity being replaced (e.g. "supplier:SUP-001") */
  replaces?: string;
  disruption_id?: string;
}

/** Map a bare entity id ("SUP-001") to its graph prefix, or null */
export function entityPrefix(id?: string): string | null {
  if (!id) return null;
  if (id.startsWith('SUP')) return 'supplier';
  if (id.startsWith('PLANT')) return 'plant';
  if (id.startsWith('MAT')) return 'material';
  if (id.startsWith('PRD')) return 'product';
  if (id.startsWith('ORD')) return 'order';
  return null;
}

/** Bare id → full graph id ("supplier:SUP-001"), or null */
export function fullEntityId(id?: string): string | null {
  const p = entityPrefix(id);
  return p && id ? `${p}:${id}` : null;
}

interface SimulationState {
  activeDisruption: any | null;
  setActiveDisruption: (disruption: any) => void;
  clearDisruption: () => void;
  /** Clears only the live disruption; keeps activeRecovery so the graph still
      shows the post-recovery wiring (INACTIVE replaced node + re-routes). */
  clearLiveDisruption: () => void;
  activeRecovery: ActiveRecovery | null;
  setActiveRecovery: (recovery: ActiveRecovery | null) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  activeDisruption: null,
  activeRecovery: null,
  setActiveDisruption: (disruption) => set({ activeDisruption: disruption }),
  clearDisruption: () => set({ activeDisruption: null, activeRecovery: null }),
  clearLiveDisruption: () => set({ activeDisruption: null }),
  setActiveRecovery: (recovery) => set({ activeRecovery: recovery }),
}));

/**
 * Records the chosen recovery option (e.g. "use SUP-002 instead of SUP-001").
 * The supply chain graph reacts: replacement suppliers go ACTIVE and get wired
 * to the replaced entity's connections; the replaced entity goes INACTIVE.
 */
export function applyRecovery(suppliersRaw: string, replacesFull?: string, strategy?: string, disruptionId?: string) {
  const suppliers = suppliersRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (suppliers.length === 0) return;
  useSimulationStore.setState({
    activeRecovery: { suppliers, replaces: replacesFull, strategy, disruption_id: disruptionId },
  });
}