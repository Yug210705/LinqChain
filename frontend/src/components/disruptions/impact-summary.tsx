'use client';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { formatCurrency } from '@/lib/utils';
import { Users, Package, Factory, Boxes, ShoppingCart, IndianRupee } from 'lucide-react';

export function ImpactSummary() {
  const { activeDisruption } = useSimulationStore();
  if (!activeDisruption) return null;
  const s = activeDisruption.summary;

  const kpis = [
    { label: 'Affected Suppliers', value: s.affected_suppliers, icon: Users, color: 'text-orange-600' },
    { label: 'Affected Materials', value: s.affected_materials, icon: Package, color: 'text-indigo-600' },
    { label: 'Affected Plants', value: s.affected_plants, icon: Factory, color: 'text-blue-600' },
    { label: 'Affected Products', value: s.affected_products, icon: Boxes, color: 'text-violet-600' },
    { label: 'Orders at Risk', value: s.affected_orders, icon: ShoppingCart, color: 'text-amber-600' },
    { label: 'Revenue at Risk', value: formatCurrency(s.revenue_at_risk), icon: IndianRupee, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">{kpi.label}</span>
          </div>
          <span className={`text-xl font-bold tracking-tight ${i === 5 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{kpi.value}</span>
        </div>
      ))}
    </div>
  );
}
