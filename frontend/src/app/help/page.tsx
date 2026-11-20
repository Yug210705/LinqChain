'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  BookOpen, ChevronDown, PlayCircle, Network, GitMerge, ShieldAlert,
  FileCheck, Settings, LifeBuoy, Sparkles, ArrowRight, Terminal, Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GUIDES = [
  {
    title: 'Run a disruption simulation',
    desc: 'Inject a supplier, material or plant outage and watch the cascade propagate.',
    href: '/command-center',
    icon: PlayCircle,
    color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/50',
  },
  {
    title: 'Explore the supply chain graph',
    desc: 'Visualize suppliers, ports, materials, plants and orders as a live topology.',
    href: '/supply-chain',
    icon: Network,
    color: 'text-blue-600 dark:text-amber-400 bg-blue-100 dark:bg-amber-950/50',
  },
  {
    title: 'Generate & compare scenarios',
    desc: 'Model alternative sourcing strategies and score cost, delay and risk.',
    href: '/scenarios',
    icon: GitMerge,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/50',
  },
  {
    title: 'Risk audit & approval',
    desc: 'Every plan passes deterministic policy validation before human sign-off.',
    href: '/risk',
    icon: ShieldAlert,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50',
  },
  {
    title: 'Approvals workspace',
    desc: 'Review pending recovery plans and authorize SAP execution.',
    href: '/approvals',
    icon: FileCheck,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50',
  },
  {
    title: 'Change currency & theme',
    desc: 'App appearance and reporting currency live in Settings.',
    href: '/settings',
    icon: Settings,
    color: 'text-slate-600 dark:text-neutral-300 bg-slate-100 dark:bg-neutral-800',
  },
];

const FAQS = [
  {
    q: 'How does the disruption simulation work?',
    a: 'The Impact Engine runs a deterministic graph simulation over the master-data topology. It computes material runways, production halts and revenue at risk using network traversal — no randomness, so the same input always produces the same impact.',
  },
  {
    q: 'Where do recovery plans come from?',
    a: 'The Recovery Engine evaluates alternative suppliers and allocation strategies, scores each option on cost, lead time, SLA exposure and blended risk, then ranks them. The top option is marked Recommended.',
  },
  {
    q: 'Why do plans require human approval?',
    a: 'Recovery plans modify purchase orders in SAP. A deterministic policy audit validates supplier qualification, capacity and cost thresholds automatically; anything above the cost threshold requires human sign-off before execution.',
  },
  {
    q: 'Can I change the reporting currency?',
    a: 'Yes — open Settings → Currency. INR, USD, EUR and GBP are available and apply instantly to all cost, exposure and revenue figures across the app.',
  },
  {
    q: 'Is dark mode supported?',
    a: 'Yes. Use the moon/sun icon in the top bar, or pick Light / Dark / System in Settings → Appearance.',
  },
  {
    q: 'What happens if a backend service is down?',
    a: 'The AI recovery service degrades gracefully — deterministic planning still works and the app surfaces a clear error instead of crashing.',
  },
];

export default function HelpDocsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-neutral-800 pb-4 mb-8 flex flex-wrap justify-between items-end gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-amber-400" /> Help & Documentation
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 mt-1">Everything you need to run the LinqChain flow — from break to recovery.</p>
        </div>
        <Link
          href="/command-center"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-sm transition-colors"
        >
          Start Demo <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* Quick start */}
      <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center mb-4">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-amber-400 mr-2" /> Quick start — 5 minutes to a full demo
        </h2>
        <ol className="space-y-3">
          {[
            ['Break it', 'Open Command Center and click “Simulate Disruption”. Pick a supplier, material or plant, then set severity & duration.'],
            ['Watch the cascade', 'The graph lights up suppliers → materials → plants → products → orders, with runways and revenue at risk.'],
            ['Recover', 'Open the disruption and generate recovery scenarios. Compare cost, delay and risk side by side.'],
            ['Audit & approve', 'A deterministic policy audit validates the plan; approve it so the SAP payload can be executed.'],
          ].map(([step, text], i) => (
            <li key={i} className="flex items-start">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="ml-4">
                <span className="block text-sm font-bold text-slate-900 dark:text-white">{step}</span>
                <span className="block text-[13px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Guides grid */}
      <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-3">Guides</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {GUIDES.map((g) => (
          <Link
            key={g.title}
            href={g.href}
            className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm p-5 hover:border-blue-400 dark:hover:border-amber-600/60 hover:shadow-md transition-all group"
          >
            <span className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', g.color)}>
              <g.icon className="w-5 h-5" />
            </span>
            <span className="block text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-amber-400 transition-colors">
              {g.title}
            </span>
            <span className="block text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">{g.desc}</span>
          </Link>
        ))}
      </div>

      {/* Architecture */}
      <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center mb-3">
          <Database className="w-4 h-4 text-blue-600 dark:text-amber-400 mr-2" /> System overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Frontend (Next.js)', desc: 'React 19 app · Tailwind v4 · ReactFlow visualization · Zustand state' },
            { name: 'Impact Engine (:8000)', desc: 'FastAPI + networkx graph simulation · deterministic cascade & bottleneck analysis' },
            { name: 'AI & Recovery service (:8000, unified backend)', desc: 'OpenRouter LLM narrative · deterministic recovery engine · persisted plans' },
          ].map((s) => (
            <div key={s.name} className="bg-slate-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-slate-100 dark:border-neutral-800">
              <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">{s.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-3">Frequently asked questions</h2>
      <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm divide-y divide-slate-100 dark:divide-neutral-800 overflow-hidden mb-8">
        {FAQS.map((f, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex justify-between items-center px-5 py-4 text-left"
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-white pr-4">{f.q}</span>
              <ChevronDown className={cn('w-4 h-4 text-slate-400 shrink-0 transition-transform', openFaq === i && 'rotate-180')} />
            </button>
            {openFaq === i && (
              <p className="px-5 pb-4 text-[13px] text-slate-500 dark:text-neutral-400 leading-relaxed">{f.a}</p>
            )}
          </div>
        ))}
      </div>

      {/* Support */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center">
          <LifeBuoy className="w-8 h-8 mr-3 shrink-0" />
          <div>
            <div className="font-bold">Still stuck?</div>
            <div className="text-sm text-blue-100">The demo is fully local — check that the two FastAPI services are running.</div>
          </div>
        </div>
        <code className="bg-black/20 rounded-md px-3 py-2 text-xs font-mono">
          uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
        </code>
      </div>
    </div>
  );
}
