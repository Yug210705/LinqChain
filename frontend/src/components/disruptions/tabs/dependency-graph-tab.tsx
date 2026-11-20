'use client';
import { SupplyChainNetwork } from '@/components/supply-chain/network-graph';

export function DependencyGraphTab({ disruptionData: _disruptionData }: { disruptionData: any }) {
  return (
    <div className="pb-2">
      <SupplyChainNetwork compact />
    </div>
  );
}