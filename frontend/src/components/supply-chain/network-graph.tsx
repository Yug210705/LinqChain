'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow, Controls, Background, BackgroundVariant, Position, Handle,
  MiniMap, MarkerType, applyNodeChanges, applyEdgeChanges, useNodesState, useEdgesState,
  type Node, type Edge, type OnNodesChange, type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
  Network, RefreshCw, AlertTriangle, X, Search, Eye, RotateCcw, Boxes,
} from 'lucide-react';
import { fetchGraph } from '@/services/api';
import { useSimulationStore } from '@/stores/useSimulationStore';

/* ------------------------------------------------------------------ */
/* Visual meta for each network entity type                            */
/* ------------------------------------------------------------------ */

const TYPE_META: Record<string, { color: string; label: string }> = {
  port:     { color: '#a855f7', label: 'Ports' },
  route:    { color: '#06b6d4', label: 'Routes' },
  supplier: { color: '#f97316', label: 'Suppliers' },
  material: { color: '#eab308', label: 'Materials' },
  plant:    { color: '#3b82f6', label: 'Plants' },
  product:  { color: '#10b981', label: 'Products' },
  order:    { color: '#94a3b8', label: 'Orders' },
};

/* Types that collapse into a group / get aggregated instead of shown raw */
const COLLAPSIBLE = ['supplier', 'route', 'order'] as const;
const DEFAULT_COLLAPSED: Set<string> = new Set(['route', 'order']);

/* Reference-style (dark topology) sizing */
const NODE_W = 220;
const NODE_H = 86;
const ORDER_W = 150;
const ORDER_H = 36;
const HUB_W = 232;
const HUB_H = 64;

/* Dark navy canvas palette (matches reference topology screenshot) */
const NET = {
  canvas:      '#141e30',
  grid:        '#24374f',
  nodeBg:      'linear-gradient(180deg, #1e3450 0%, #16263a 100%)',
  border:      '#2f6b8f',
  dimBorder:   '#3f5a78',
  text:        '#ffffff',
  type:        '#8a9bb5',
  meta:        '#a0b4cc',
  edge:        '#4a6a85',
  legendBg:    '#1e2d3d',
  legendBorder:'#2f425c',
  controlBg:   '#1e2d3d',
  controlBorder:'#2f425c',
  panelBg:     '#0f1b2d',
};

/* Node states — the ONLY statuses the graph uses */
const STATE_META: Record<string, { label: string; color: string }> = {
  active:    { label: 'ACTIVE',    color: '#00c8ff' },
  atRisk:    { label: 'AT RISK',   color: '#f59e0b' },
  disrupted: { label: 'DISRUPTED', color: '#ef4444' },
  inactive:  { label: 'INACTIVE',  color: '#6b7280' },
  standby:   { label: 'STANDBY',   color: '#475569' },
};

function normalizeRisk(risk?: number | string | null): number | null {
  if (risk === undefined || risk === null) return null;
  let r = typeof risk === 'string' ? parseFloat(risk) : risk;
  if (Number.isNaN(r)) return null;
  /* Graph API reports risk on a 0–100 scale; normalize to 0–1 */
  return r > 1 ? r / 100 : r;
}

/* Baseline (non-disrupted) state from the risk score */
function baselineState(risk?: number | string | null): string {
  const r = normalizeRisk(risk);
  if (r === null) return 'active';
  return r >= 0.5 ? 'atRisk' : 'active';
}

/* Resolve a node's full state: override (disrupted/inactive/recovery) wins,
   otherwise baseline risk decides AT RISK vs ACTIVE. */
function stateOf(d: any): string {
  if (d?.statusOverride) return d.statusOverride;
  if (d?.isHub) return 'standby';
  return baselineState(d?.risk);
}

export function formatRisk(risk?: number | string | null) {
  if (risk === undefined || risk === null) return null;
  const n = typeof risk === 'string' ? parseFloat(risk) : risk;
  if (Number.isNaN(n)) return null;
  return n.toFixed(0);
}

/* ------------------------------------------------------------------ */
/* Custom node                                                         */
/* ------------------------------------------------------------------ */

const NetworkNode = ({ data }: any) => {
  const w = data.w;
  const h = data.h;
  const isHub = !!data.isHub;
  const isOrder = !!data.isOrder;
  const state = stateOf(data);
  const sMeta = STATE_META[state] || STATE_META.active;
  const dot = sMeta.color;
  const border =
    state === 'disrupted' ? '#ef4444'
      : state === 'atRisk' ? '#f59e0b'
        : state === 'inactive' ? '#5b6b80'
          : isHub ? NET.dimBorder
            : NET.border;
  return (
    <div
      onClick={data.onClick}
      title={data.label}
      style={{
        width: w,
        minHeight: h,
        borderRadius: 10,
        border: `${isHub ? 2 : 1.4}px ${isHub ? 'dashed' : 'solid'} ${border}`,
        background: NET.nodeBg,
        boxShadow: data.selected
          ? `0 0 0 3px ${dot}55, 0 2px 10px rgba(0,0,0,0.4)`
          : '0 2px 8px rgba(0,0,0,0.35)',
        cursor: 'pointer',
        opacity: data.dim ? 0.06 : state === 'inactive' ? 0.6 : isHub ? 0.88 : 1,
        transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        padding: isOrder ? '5px 12px' : '9px 14px',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

      {/* Status indicator dot (top-right, reference style) */}
      <span
        className={state === 'disrupted' ? 'animate-pulse' : undefined}
        style={{
          position: 'absolute', top: 9, right: 9, width: 8, height: 8,
          borderRadius: '50%', background: dot, boxShadow: `0 0 6px ${dot}99`,
        }}
      />

      {isHub ? (
        <div className="flex flex-col justify-center" style={{ height: '100%', paddingRight: 14 }}>
          <span className="truncate" style={{ color: NET.text, fontSize: 13, fontWeight: 800 }}>
            {data.label}
          </span>
          <span style={{ color: NET.meta, fontSize: 10, fontWeight: 600 }}>
            {data.count} nodes · {data.links} relationships
          </span>
        </div>
      ) : (
        <div className="flex flex-col justify-center" style={{ height: '100%', paddingRight: 14 }}>
          <span className="truncate" style={{ color: NET.text, fontSize: isOrder ? 11 : 13, fontWeight: 700 }}>
            {data.label}
          </span>
          <span
            style={{
              color: sMeta.color, fontSize: isOrder ? 8.5 : 9.5, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {state === 'active' || state === 'standby' ? data.typeLabel : sMeta.label}
            {data.sub && (
              <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600, marginLeft: 6 }}>
                {data.sub}
              </span>
            )}
          </span>
        </div>
      )}

      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
};

const nodeTypes = { networkNode: NetworkNode };

/* ------------------------------------------------------------------ */
/* Dagre layout (left → right, roomy)                                  */
/* ------------------------------------------------------------------ */

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 34, ranksep: 96, marginx: 16, marginy: 16 });

  nodes.forEach((n) => {
    const d = n.data as any;
    g.setNode(n.id, { width: d.w, height: d.h });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    const d = n.data as any;
    n.targetPosition = Position.Left;
    n.sourcePosition = Position.Right;
    n.position = { x: pos.x - d.w / 2, y: pos.y - d.h / 2 };
    return n;
  });
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

interface GraphData {
  nodes: any[];
  edges: any[];
}

interface BuildResult {
  rfNodes: Node[];
  rfEdges: Edge[];
  degrees: Record<string, { in: number; out: number }>;
  productOrderCounts: Record<string, number>;
  supplierLinks: number;
}

export function SupplyChainNetwork({ initialFocusId, compact }: { initialFocusId?: string; compact?: boolean } = {}) {
  const activeDisruption = useSimulationStore((s) => s.activeDisruption);
  const activeRecovery = useSimulationStore((s) => s.activeRecovery);

  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* Collapsed types render as group/aggregation instead of raw members.
     Hidden types are not rendered at all. */
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(DEFAULT_COLLAPSED));
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFocusId(null);
    setSelectedId(null);
    try {
      const g = await fetchGraph();
      setData(g);
    } catch (e: any) {
      setError(e?.message || 'Failed to load the supply chain network.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Optional initial focus (e.g. from the disruption detail page: zoom into the
     disrupted node the moment the graph data is ready). */
  const initialFocused = useRef(initialFocusId);
  useEffect(() => {
    if (initialFocused.current && data) {
      applyFocus(initialFocused.current);
      initialFocused.current = undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* Per-type counts from raw data (unfiltered) */
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (data?.nodes ?? []).forEach((n: any) => { c[n.type] = (c[n.type] || 0) + 1; });
    return c;
  }, [data]);

  const toggleType = useCallback((type: string) => {
    /* COLLAPSIBLE types: collapsed ⇄ hidden. Others: visible ⇄ hidden. */
    setCollapsed((prev) => {
      const next = new Set(prev);
      if ((COLLAPSIBLE as readonly string[]).includes(type)) {
        if (next.has(type)) next.delete(type);
        else next.add(type);
      }
      return next;
    });
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    setSelectedId(null);
    setFocusId(null);
  }, []);

  const resetView = useCallback(() => {
    setCollapsed(new Set(DEFAULT_COLLAPSED));
    setHidden(new Set());
    setSelectedId(null);
    setFocusId(null);
    setQuery('');
  }, []);

  /* ------------------------ Graph building ------------------------ */

  const built = useMemo<BuildResult>(() => {
    if (!data) {
      return { rfNodes: [], rfEdges: [], degrees: {}, productOrderCounts: {}, supplierLinks: 0 };
    }
    const rawNodes = data.nodes;
    const rawEdges = data.edges;

    /* Expand collapsed routing chains: for each route, link its port ⇄ plant */
    const portPlant: { pairs: Map<string, number>; portOf: Map<string, string> } = {
      pairs: new Map(),
      portOf: new Map(),
    };
    rawEdges.forEach((e: any) => {
      if (e.type === 'USES_ROUTE' && e.source.startsWith('port:')) {
        portPlant.portOf.set(e.source, e.target); // port → route
      }
    });

    /* Edges touching a route node (used when routes expanded) */
    const routeIds = new Set(rawNodes.filter((n: any) => n.type === 'route').map((n: any) => n.id));

    /* Orders per product (used for collapse badge) */
    const productOrderCounts: Record<string, number> = {};
    rawEdges.forEach((e: any) => {
      if (e.type === 'FULFILLS') {
        productOrderCounts[e.source] = (productOrderCounts[e.source] || 0) + 1;
      }
    });

    /* Supplier relationship count (hub badge) */
    const supplierIds = new Set(
      rawNodes.filter((n: any) => n.type === 'supplier').map((n: any) => n.id)
    );
    const supplierLinks = rawEdges.filter(
      (e: any) => supplierIds.has(e.source) || supplierIds.has(e.target)
    ).length;

    const degree = (id: string) => {
      let out = 0, inN = 0;
      rawEdges.forEach((e: any) => {
        if (e.source === id) out++;
        if (e.target === id) inN++;
      });
      return { in: inN, out };
    };

    /* ---- Live disruption state: mark affected nodes & compute re-routes ---- */
    const disrupted: Record<string, 'disrupted' | 'atRisk'> = {};

    const typeOfEntity = (id: string): string | null =>
      id.startsWith('SUP') ? 'supplier'
        : id.startsWith('PLANT') ? 'plant'
          : id.startsWith('MAT') ? 'material'
            : id.startsWith('PRD') ? 'product'
              : id.startsWith('ORD') ? 'order' : null;

    if (activeDisruption?.disruption) {
      const d = activeDisruption.disruption;
      const t = typeOfEntity(d.affected_entity_id);
      if (t) disrupted[`${t}:${d.affected_entity_id}`] = 'disrupted';
      const mark = (arr: any[] | undefined, type: string) => {
        (arr || []).forEach((item: any) => {
          const id = item?.id ?? item?.material_id ?? item?.product_id ?? item?.order_id ?? item?.plant_id;
          if (!id) return;
          const key = `${type}:${id}`;
          /* Never downgrade an existing state (the disruption source stays DISRUPTED
             even though it also appears in its own affected_* lists) */
          if (disrupted[key]) return;
          const risk = item.risk_score ?? 0;
          disrupted[key] = risk >= 0.8 ? 'disrupted' : 'atRisk';
        });
      };
      mark(d.affected_suppliers, 'supplier');
      mark(activeDisruption.affected_suppliers, 'supplier');
      mark(activeDisruption.affected_materials, 'material');
      mark(activeDisruption.affected_plants, 'plant');
      mark(activeDisruption.affected_products, 'product');
      mark(activeDisruption.affected_orders, 'order');
    }

    /* ---- Recovery context: replaced entity → INACTIVE, chosen suppliers → ACTIVE ---- */
    const inactiveIds = new Set<string>();
    const recoverySuppliers = new Set<string>();
    if (activeRecovery?.replaces) inactiveIds.add(activeRecovery.replaces);
    (activeRecovery?.suppliers ?? []).forEach((s) => recoverySuppliers.add(`supplier:${s}`));

    /* Materials whose original supplier is down or replaced — healthy alternatives become "re-route" */
    const rerouteTargets = new Set<string>();
    const replacedTargets: string[] = [];
    rawEdges.forEach((e: any) => {
      if (e.type !== 'SUPPLIES') return;
      if (disrupted[e.source] || inactiveIds.has(e.source)) rerouteTargets.add(e.target);
      if (inactiveIds.has(e.source)) replacedTargets.push(e.target);
    });

    /* ----- Nodes ----- */
    const nodes: Node[] = [];
    rawNodes.forEach((n: any) => {
      if (collapsed.has(n.type) || hidden.has(n.type)) return;

      const meta = TYPE_META[n.type] || { color: '#64748b', label: n.type };
      const isOrder = n.type === 'order';
      const d = degree(n.id);
      const links = d.out + d.in;
      const riskText = formatRisk(n.risk);
      const typeLabel = meta.label.slice(0, -1).toUpperCase();

      /* Reference-style metric row: "Risk 32 · 4 links" / "$45" / "N orders" */
      const parts: string[] = [];
      if (riskText !== null && !isOrder) parts.push(`Risk ${riskText}`);
      if (isOrder) {
        if (n.qty) parts.push(`${n.qty} qty`);
        if (n.val !== undefined) parts.push(`$${Number(n.val).toLocaleString()}`);
      }
      if (!isOrder) parts.push(`${links} links`);
      if (n.type === 'product' && (productOrderCounts[n.id] || 0) > 0) {
        parts.push(`${productOrderCounts[n.id]} orders`);
      }

      nodes.push({
        id: n.id,
        type: 'networkNode',
        position: { x: 0, y: 0 },
        data: {
          label: n.label || n.id,
          sub: parts.join(' · '),
          typeLabel,
          risk: n.risk,
          statusOverride: inactiveIds.has(n.id)
            ? 'inactive'
            : recoverySuppliers.has(n.id)
              ? 'active'
              : disrupted[n.id],
          isOrder,
          isHub: false,
          w: isOrder ? ORDER_W : NODE_W,
          h: isOrder ? ORDER_H : NODE_H,
          selected: n.id === selectedId,
          dim: false,
          onClick: () => { setSelectedId(n.id); setFocusId((f) => (f === n.id ? null : n.id)); },
        },
      });
    });

    /* Supplier hub (collapsed) */
    if (collapsed.has('supplier') && !hidden.has('supplier')) {
      nodes.push({
        id: 'grp-supplier',
        type: 'networkNode',
        position: { x: 0, y: 0 },
        data: {
          label: 'Supplier Hub',
          typeLabel: 'SUPPLIERS',
          risk: undefined,
          disrupted: false,
          statusOverride: undefined,
          isHub: true,
          count: counts['supplier'] || 0,
          links: supplierLinks,
          w: HUB_W, h: HUB_H,
          selected: false,
          dim: false,
          onClick: () => setSelectedId(null),
        },
      });
    }

    /* ----- Edges ----- */
    const edges: Edge[] = [];
    const edgeSet = new Set<string>();
    const addEdge = (s: string, t: string, type: string, dim = false, label?: string) => {
      const key = `${s}→${t}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);

      const isInactiveEdge = inactiveIds.has(s) || inactiveIds.has(t);
      const isReroute =
        !isInactiveEdge &&
        type === 'SUPPLIES' &&
        rerouteTargets.has(t) &&
        !disrupted[s] &&
        !disrupted[t];
      const isBroken = !isInactiveEdge && !isReroute && (!!disrupted[s] || !!disrupted[t]);

      let stroke = NET.edge;
      let dash: string | undefined;
      let arrowColor = NET.edge;
      let animated: boolean | undefined;
      let labelText = label;
      if (isInactiveEdge) {
        /* replaced/dead connection — gray dashed */
        stroke = '#64748b';
        dash = '4 3';
        arrowColor = '#64748b';
        labelText = undefined;
      } else if (isBroken) {
        stroke = '#ef4444';
        dash = '6 4';
        arrowColor = '#ef4444';
        labelText = undefined;
      } else if (isReroute) {
        stroke = '#22c55e';
        dash = '5 3';
        arrowColor = '#22c55e';
        animated = true;
        labelText = label ?? 're-route';
      }

      edges.push({
        id: `e-${s}-${t}-${type}-${edges.length}`,
        source: s, target: t,
        type: 'default',
        label: labelText,
        animated,
        labelStyle: { fill: NET.meta, fontSize: 9, fontWeight: 700 },
        labelBgStyle: { fill: NET.panelBg, opacity: 0.9 },
        labelBgPadding: [3, 1] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: arrowColor,
          width: 15,
          height: 15,
        },
        style: {
          stroke,
          strokeWidth: 1.5,
          strokeDasharray: dash,
          opacity: dim ? 0.12 : 0.9,
        },
      });
    };

    rawEdges.forEach((e: any) => {
      const sHidden = hidden.has(e.source.split(':')[0]);
      const tHidden = hidden.has(e.target.split(':')[0]);
      if (sHidden || tHidden) return;

      const sType = e.source.split(':')[0];
      const tType = e.target.split(':')[0];

      /* Route member edges: render raw only when routes expanded */
      if (routeIds.has(e.source) || routeIds.has(e.target)) return;

      /* Edge from/to collapsed supplier: skip (hub shows badge only) */
      if (collapsed.has('supplier') && (sType === 'supplier' || tType === 'supplier')) return;

      /* Orders: only when expanded */
      if (collapsed.has('order') && (sType === 'order' || tType === 'order')) return;

      /* Material/port/plant/product member edges pass through */
      addEdge(e.source, e.target, e.type);
    });

    /* Aggregated routes: port → plant with count label */
    if (collapsed.has('route') && !hidden.has('route')) {
      rawEdges.forEach((e: any) => {
        if (e.type !== 'DELIVERS_TO' || !e.target.startsWith('plant:')) return;
        const routeId = e.source;
        const portId = [...portPlant.portOf.entries()]
          .filter(([, r]) => r === routeId).map(([p]) => p)[0];
        if (!portId || hidden.has('port') || hidden.has('plant')) return;
        const key = `${portId}→${e.target}`;
        const prev = portPlant.pairs.get(key) || 0;
        portPlant.pairs.set(key, prev + 1);
      });
      portPlant.pairs.forEach((count, key) => {
        const [s, t] = key.split('→');
        addEdge(s, t, 'DELIVERS_TO', false, count > 1 ? `×${count} routes` : undefined);
      });
    }

    /* ---- Recovery: wire each chosen supplier to the replaced entity's connections ---- */
    if (activeRecovery && replacedTargets.length > 0) {
      activeRecovery.suppliers.forEach((s) => {
        const full = `supplier:${s}`;
        if (inactiveIds.has(full) || disrupted[full]) return;
        replacedTargets.forEach((t) => addEdge(full, t, 'SUPPLIES'));
      });
    }

    /* ----- Focus mode: dim everything outside the neighbourhood ----- */
    const focusIds = focusId ? new Set<string>([focusId]) : null;
    if (focusIds && data) {
      rawEdges.forEach((e: any) => {
        if (e.source === focusId) focusIds.add(e.target);
        if (e.target === focusId) focusIds.add(e.source);
      });
      /* Keep collapsed-order counts meaningful: also allow product neighbours */
      nodes.forEach((n) => {
        if (focusIds.has(n.id)) return;
        (n.data as any).dim = true;
      });
      edges.forEach((e) => {
        if (focusIds.has(e.source) && focusIds.has(e.target)) return;
        (e.style as any).strokeOpacity = 0.05;
        (e.style as any).opacity = 0.1;
      });
    }

    /* ----- Degrees for the detail panel (visible-only) ----- */
    const degrees: Record<string, { in: number; out: number }> = {};
    edges.forEach((e) => {
      const s = e.source, t = e.target;
      if ((e.style as any)?.opacity === 0.1) return;
      if (!degrees[s]) degrees[s] = { in: 0, out: 0 };
      if (!degrees[t]) degrees[t] = { in: 0, out: 0 };
      degrees[s].out += 1;
      degrees[t].in += 1;
    });

    return {
      rfNodes: getLayoutedElements(nodes, edges),
      rfEdges: edges,
      degrees,
      productOrderCounts,
      supplierLinks,
    };
  }, [data, collapsed, hidden, counts, selectedId, focusId, activeDisruption, activeRecovery]);

  /* ---------- ReactFlow state (smooth, draggable controlled nodes) ---------- */

  const structureKey = `${data?.nodes.length ?? 0}x${data?.edges.length ?? 0}|${[...collapsed].sort().join(',')}|${[...hidden].sort().join(',')}`;

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>(built.rfNodes);
  const [rfEdges, setRfEdges] = useEdgesState<Edge>(built.rfEdges);

  /* Latest built layout, readable inside effects without dependency churn */
  const latestBuilt = useRef(built);
  latestBuilt.current = built;

  const prevStructureKey = useRef(structureKey);
  const prevData = useRef(data);

  /* Layout is re-applied only when the topology/structure changes (chips toggled,
     data refreshed). Focus & selection changes update node data in place so
     user-dragged positions are preserved and dragging stays smooth. */
  useEffect(() => {
    const structural = prevData.current !== data || prevStructureKey.current !== structureKey;
    prevData.current = data;
    prevStructureKey.current = structureKey;

    const b = latestBuilt.current;
    if (structural) {
      setRfNodes(b.rfNodes);
      setRfEdges(b.rfEdges);
      return;
    }

    /* Non-structural: keep the user's dragged positions, just sync visuals */
    const byId = new Map(b.rfNodes.map((n) => [n.id, n]));
    setRfNodes((prev) =>
      prev.map((n) => {
        const next = byId.get(n.id);
        if (!next) return n;
        return { ...n, data: { ...(next.data as any) } };
      })
    );
    const eById = new Map(b.rfEdges.map((e) => [e.id, e]));
    setRfEdges((prev) =>
      prev.map((e) => {
        const next = eById.get(e.id);
        return next ? { ...e, style: { ...(next.style as object) } } : e;
      })
    );
  }, [structureKey, focusId, selectedId, data, activeDisruption, activeRecovery]);

  const handleNodesChange: OnNodesChange<Node> = useCallback(
    (changes) => setRfNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const handleEdgesChange: OnEdgesChange<Edge> = useCallback(
    (changes) => setRfEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  /* --------------------------- Search ----------------------------- */

  const matches = useMemo(() => {
    if (!data || query.trim().length === 0) return [];
    const q = query.trim().toLowerCase();
    return data.nodes
      .filter((n: any) => (n.label || '').toLowerCase().includes(q) || n.id.toLowerCase().includes(q))
      .slice(0, 6);
  }, [data, query]);

  const applyFocus = useCallback((id: string) => {
    setFocusId(id);
    setSelectedId(id);
    setQuery('');
    /* If the target lives inside a collapsed group, expand just that group */
    const nodeType = data?.nodes.find((n: any) => n.id === id)?.type;
    if (nodeType && (collapsed.has(nodeType) || hidden.has(nodeType))) {
      setCollapsed((prev) => {
        const next = new Set(prev);
        if ((COLLAPSIBLE as readonly string[]).includes(nodeType)) next.delete(nodeType);
        return next;
      });
      setHidden((prev) => {
        const next = new Set(prev);
        next.delete(nodeType);
        return next;
      });
    }
  }, [data, collapsed, hidden]);

  const clearFocus = useCallback(() => {
    setFocusId(null);
    setSelectedId(null);
  }, []);

  /* ----------------------- Detail panel --------------------------- */

  const selectedNode = useMemo(() => {
    if (!selectedId || !data || selectedId.startsWith('grp-')) return null;
    const n = data.nodes.find((x: any) => x.id === selectedId);
    if (!n) return null;
    const d = built.degrees[selectedId] || { in: 0, out: 0 };
    const neighbors = data.edges
      .filter((e: any) => e.source === selectedId || e.target === selectedId)
      .map((e: any) => (e.source === selectedId ? e.target : e.source))
      .filter((id: string) => {
        const t = data.nodes.find((x: any) => x.id === id)?.type;
        return t && !hidden.has(t);
      });
    const g = built.rfNodes.find((x: any) => x.id === selectedId);
    const state = g ? stateOf(g.data) : 'active';
    return { node: n, d, neighbors, state };
  }, [selectedId, data, built.degrees, built.rfNodes, hidden]);

  /* ---------------------------- UI -------------------------------- */

  const statCards = [
    { label: 'Entities', value: data ? data.nodes.length : '–' },
    { label: 'Relationships', value: data ? data.edges.length : '–' },
    { label: 'Suppliers', value: counts['supplier'] ?? '–' },
    { label: 'Plants', value: counts['plant'] ?? '–' },
    { label: 'Materials', value: counts['material'] ?? '–' },
    { label: 'Products', value: counts['product'] ?? '–' },
    { label: 'Ports', value: counts['port'] ?? '–' },
    { label: 'Routes', value: counts['route'] ?? '–' },
    { label: 'Orders', value: counts['order'] ?? '–' },
  ];

  const chipMeta = (type: string) => {
    if (COLLAPSIBLE.includes(type as any)) {
      return collapsed.has(type) ? 'collapsed' : 'hidden';
    }
    return hidden.has(type) ? 'hidden' : 'expanded';
  };

  return (
    <div className="space-y-4">
      {/* Stats strip (hidden in compact mode) */}
      {!compact && (
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-center">
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{s.value}</div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Graph card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Boxes className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Global Network Topology</h2>
            <span className="text-[10px] font-semibold text-slate-400 hidden md:inline">
              {focusId ? 'Focus mode — click again to clear' : 'Routes & orders grouped · drag any node to rearrange'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              {query.length > 0 && matches.length > 0 && (
                <div className="absolute top-7 left-0 right-0 z-20 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 max-h-56 overflow-y-auto">
                  {matches.map((m: any) => {
                    const meta = TYPE_META[m.type] || {};
                    return (
                      <button
                        key={m.id}
                        onClick={() => applyFocus(m.id)}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{m.label || m.id}</span>
                        <span className="text-[9px] font-bold uppercase shrink-0" style={{ color: meta.color }}>
                          {m.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && matches[0]) applyFocus(matches[0].id); }}
                placeholder="Search node…"
                className="w-40 sm:w-48 pl-7 pr-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0f1522] border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {focusId && (
                <button
                  onClick={clearFocus}
                  title="Clear focus"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={resetView}
              title="Reset view"
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={load}
              className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Type filter chips */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center">
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const state = chipMeta(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                  state === 'hidden'
                    ? 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50'
                    : state === 'collapsed'
                      ? 'border-dashed text-slate-600 dark:text-slate-300'
                      : 'border-transparent text-white'
                }`}
                style={
                  state === 'expanded'
                    ? { background: meta.color, borderColor: meta.color }
                    : state === 'collapsed'
                      ? { borderColor: meta.color, color: meta.color }
                      : undefined
                }
                title={
                  COLLAPSIBLE.includes(type as any)
                    ? `${state === 'collapsed' ? 'Hide' : 'Expand'} ${meta.label}`
                    : `${hidden.has(type) ? 'Show' : 'Hide'} ${meta.label}`
                }
              >
                <span
                  className={`w-2 h-2 rounded-sm mr-1.5 ${state === 'hidden' ? 'bg-slate-300 dark:bg-slate-600' : ''}`}
                  style={state === 'hidden' ? undefined : { background: state === 'collapsed' ? 'transparent' : meta.color, border: state === 'collapsed' ? `1.5px dashed ${meta.color}` : undefined }}
                />
                {meta.label} {counts[type] !== undefined && `(${counts[type]})`}
                {state === 'collapsed' && <Eye className="w-3 h-3 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Live disruption / recovery banner */}
        {(activeDisruption?.disruption || activeRecovery) && (
          <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-900/50 flex flex-wrap items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            {activeRecovery ? (
              <>
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                  Recovery active — {activeRecovery.suppliers.join(' + ')} replacing {activeRecovery.replaces?.split(':')[1] ?? activeDisruption?.disruption?.affected_entity_id}
                </span>
                <span className="text-[11px] font-semibold text-slate-300">
                  replacement wired (green) · replaced entity flagged inactive (gray)
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider">
                  {activeDisruption?.disruption?.affected_entity_id} DISRUPTED
                </span>
                <span className="text-[11px] font-semibold text-slate-300">
                  severity {activeDisruption?.disruption?.severity} · {activeDisruption?.disruption?.duration_days} days ·
                  links cut (red dashed) &amp; alternate suppliers re-route (green dashed)
                </span>
              </>
            )}
          </div>
        )}

        {/* ReactFlow canvas */}
        {loading ? (
          <div className="h-[600px] flex flex-col items-center justify-center bg-[#141e30]">
            <Network className="w-8 h-8 text-blue-400 animate-pulse mb-3" />
            <p className="text-sm font-semibold text-slate-300">Building network topology…</p>
          </div>
        ) : error ? (
          <div className="h-[600px] flex flex-col items-center justify-center bg-[#141e30] text-center px-6">
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" />
            <p className="text-sm font-bold text-slate-200 mb-1">Could not load the supply chain network</p>
            <p className="text-xs text-slate-400 max-w-md mb-4">{error}</p>
            <button
              onClick={load}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-xs shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try again
            </button>
          </div>
        ) : (
          <div className="relative h-[600px] bg-[#141e30]">
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              nodeTypes={nodeTypes}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              minZoom={0.15}
              maxZoom={1.75}
              nodesDraggable={!compact}
              onlyRenderVisibleElements
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} color={NET.grid} gap={28} size={1.5} />
              {!compact && (
                <MiniMap
                  position="bottom-right"
                pannable
                zoomable
                nodeColor={(n) => {
                  const st = stateOf(n.data as any);
                  return (STATE_META[st] || STATE_META.active).color;
                }}
                nodeStrokeColor={() => NET.panelBg}
                maskColor="rgba(20,30,48,0.7)"
                className="!bg-[#16263a] !border-[#2f425c]"
              />
              )}
              <Controls position="bottom-left" className="!bg-[#1e2d3d] !border-[#2f425c] rounded-lg overflow-hidden" />
            </ReactFlow>

            {/* Selected node detail panel */}
            {selectedNode && (
              <div className="absolute top-3 right-3 z-10 w-64 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span
                    className="inline-flex items-center text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ background: (TYPE_META[selectedNode.node.type] || { color: '#64748b' }).color }}
                  >
                    {(TYPE_META[selectedNode.node.type] || { label: selectedNode.node.type }).label.slice(0, -1)}
                  </span>
                  <span
                    className="inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ml-2"
                    style={{ background: (STATE_META[selectedNode.state] || STATE_META.active).color, color: '#0f1522' }}
                  >
                    {(STATE_META[selectedNode.state] || STATE_META.active).label}
                  </span>
                  <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-auto">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1 break-words">{selectedNode.node.label || selectedNode.node.id}</p>
                <p className="text-[10px] font-semibold text-slate-400 mb-3 break-all">{selectedNode.node.id}</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-50 dark:bg-[#0f1522] rounded-md px-2 py-1.5 text-center">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{selectedNode.d.out}</div>
                    <div className="text-[9px] font-semibold text-slate-500 uppercase">Outgoing</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#0f1522] rounded-md px-2 py-1.5 text-center">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{selectedNode.d.in}</div>
                    <div className="text-[9px] font-semibold text-slate-500 uppercase">Incoming</div>
                  </div>
                </div>
                {selectedNode.node.risk !== undefined && selectedNode.node.risk !== null && (
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Risk score: <span className="text-slate-900 dark:text-white">{formatRisk(selectedNode.node.risk)}</span>
                  </div>
                )}
                {selectedNode.node.val !== undefined && (
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Order value: <span className="text-slate-900 dark:text-white">${Number(selectedNode.node.val).toLocaleString()}</span>
                  </div>
                )}
                {selectedNode.neighbors.length > 0 && (
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Connected to</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.neighbors.slice(0, 10).map((id: string) => (
                        <button
                          key={id}
                          onClick={() => applyFocus(id)}
                          className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#0f1522] px-1.5 py-0.5 rounded hover:text-blue-600"
                        >
                          {id.split(':')[1]}
                        </button>
                      ))}
                      {selectedNode.neighbors.length > 10 && (
                        <span className="text-[9px] font-semibold text-slate-400">+{selectedNode.neighbors.length - 10} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Legend (reference-style dark card) */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none bg-[#1e2d3d] border border-[#2f425c] rounded-lg px-3.5 py-2.5 shadow-lg">
              <div className="text-[10px] font-extrabold text-white uppercase tracking-widest mb-2">Node state</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="flex items-center text-[10px] font-bold text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: STATE_META.active.color }} /> Active
                </div>
                <div className="flex items-center text-[10px] font-bold text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: STATE_META.atRisk.color }} /> At risk
                </div>
                <div className="flex items-center text-[10px] font-bold text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: STATE_META.disrupted.color }} /> Disrupted
                </div>
                <div className="flex items-center text-[10px] font-bold text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: STATE_META.inactive.color }} /> Inactive
                </div>
              </div>
              <span className="block mt-2" style={{ borderTop: `1.5px dashed ${NET.dimBorder}`, height: 0 }} />
              <div className="text-[9px] font-semibold text-slate-400 mt-1">dashed borders = standby (collapsed group)</div>
            </div>
          </div>
        )}
      </div>

      {/* Footnote */}
      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        All suppliers are shown individually and laid out left-to-right by their links (supplier → port/material → plant → product → order). Routes & orders are grouped by default — click their chips to expand. Drag any node to rearrange (positions stick until the topology changes) · click a node to focus its neighbourhood · search to jump straight to an entity.
      </p>
    </div>
  );
}