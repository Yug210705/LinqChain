'use client';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ProductionLoss() {
  const { activeDisruption } = useSimulationStore();
  if (!activeDisruption?.timeline) return null;

  // Aggregate daily production loss across all materials for simplicity
  const dataMap = new Map();
  activeDisruption.timeline.forEach((t: any) => {
    const day = `Day ${t.day}`;
    if (!dataMap.has(day)) dataMap.set(day, { day, loss: 0 });
    dataMap.get(day).loss += t.shortfall_units;
  });
  
  const data = Array.from(dataMap.values());

  return (
    <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-lg shadow-sm p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Production Shortfall</h3>
        <p className="text-xs text-slate-500 dark:text-neutral-400">Daily unfulfilled manufacturing units</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip 
              cursor={{ fill: '#262626' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #334155', background: '#1c1c1e', color: '#f1f5f9' }}
            />
            <Bar dataKey="loss" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
