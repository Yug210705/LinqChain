'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Network } from 'lucide-react';

// ReactFlow must render client-side only (SSR incompatibility)
const SupplyChainNetwork = dynamic(
  () => import('@/components/supply-chain/network-graph').then((m) => m.SupplyChainNetwork),
  { ssr: false }
);

export default function SupplyChainExplorer() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-wrap justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4 mb-8 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Network className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Supply Chain Explorer
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Global network topology and master data — suppliers, ports, materials, plants, products and orders
          </p>
        </div>
        <Link
          href="/command-center"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-sm transition-colors"
        >
          Go to Command Center
        </Link>
      </div>

      <SupplyChainNetwork />
    </div>
  );
}