'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Network } from 'lucide-react';
import { SupplyChainNetwork } from '@/components/supply-chain/network-graph';

export default function SupplyChainExplorer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full max-w-[1700px] mx-auto py-6 px-4">
      <div className="flex flex-wrap justify-between items-end border-b border-slate-200 dark:border-neutral-800 pb-4 mb-8 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Network className="w-8 h-8 text-blue-600 dark:text-amber-400" />
            Supply Chain Explorer
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 mt-1">
            Global network topology and master data — suppliers, ports, materials, plants, products and orders
          </p>
        </div>
        <Link
          href="/command-center"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-sm transition-colors"
        >
          Go to Command Center
        </Link>
      </div>

      {mounted ? (
        <SupplyChainNetwork />
      ) : (
        <div className="w-full h-[600px] flex items-center justify-center bg-slate-50 dark:bg-neutral-900 animate-pulse rounded-xl" />
      )}
    </div>
  );
}