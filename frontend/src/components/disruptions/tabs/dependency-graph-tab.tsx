'use client';
import dynamic from 'next/dynamic';

// Exactly the same graph as the Supply Chain page (compact variant):
// no minimap, no draggable nodes, no stats strip.
const SupplyChainNetwork = dynamic(
  () => import('@/components/supply-chain/network-graph').then((m) => m.SupplyChainNetwork),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 animate-pulse rounded-xl" />
    ),
  }
);

export function DependencyGraphTab({ disruptionData: _disruptionData }: { disruptionData: any }) {
  return (
    <div className="pb-2">
      <SupplyChainNetwork compact />
    </div>
  );
}