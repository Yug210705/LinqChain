'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LegalHeader, LegalFooter } from '@/components/legal/legal-nav';
import { Check, ShieldCheck, Zap, Building, HelpCircle, ArrowRight, Sparkles, CreditCard, Clock } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c0d12] text-slate-900 dark:text-neutral-100 font-sans">
      <LegalHeader title="Enterprise Subscriptions & Pricing Terms" />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Enterprise Subscription Terms</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-white mb-4">
            Predictable Pricing. Zero Disruption.
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Autonomous supply chain resilience for modern enterprises. Clear renewal, cancellation, and SLA terms with no hidden platform fees.
          </p>

          {/* Billing Switcher */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
              Billed Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'annual' ? 'monthly' : 'annual')}
              className="relative w-12 h-6 rounded-full bg-neutral-200 dark:bg-white/10 p-1 transition-colors cursor-pointer"
            >
              <div
                className={`w-4 h-4 rounded-full bg-orange-600 transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
              <span>Billed Annually</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Tier 1: Starter */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Starter Network
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                Regional Twin
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
                For regional logistics hubs and mid-market distributors.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                  ${billingCycle === 'annual' ? '1,199' : '1,499'}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">/month</span>
              </div>

              <div className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300 mb-8">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Up to 250 suppliers & materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>2-Hop Disruption Blast Radius analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>5 Autonomous AI Recovery Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Standard 99.5% Uptime SLA</span>
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-2.5 text-center rounded-xl bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-900 dark:text-white text-xs font-semibold transition-colors"
            >
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Tier 2: Professional (Featured) */}
          <div className="p-6 rounded-3xl bg-neutral-900 dark:bg-[#181924] border-2 border-orange-500 text-white shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-600 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Most Popular
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
                Enterprise Multi-Tier
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                Mission Control
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                Full-scale autonomous resilience with SAP S/4HANA bridge.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">
                  ${billingCycle === 'annual' ? '3,999' : '4,999'}
                </span>
                <span className="text-xs text-neutral-400">/month</span>
              </div>

              <div className="space-y-3 text-xs text-neutral-200 mb-8">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Up to 2,500 Tier 1-3 suppliers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5-Hop Deep Blast Radius cascade simulation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Live SAP Event Mesh & BAPI/RFC bridge</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multi-party PO Spend Approval workflows</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Enterprise 99.9% Uptime Commitment</span>
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-2.5 text-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Deploy Enterprise Mission Control →
            </Link>
          </div>

          {/* Tier 3: Custom MNC */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Global Conglomerate
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                Global Sovereign
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
                Dedicated VPC, on-premise SAP air-gap, and bespoke AI tuning.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                  Custom
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">/Annual Master Agreement</span>
              </div>

              <div className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300 mb-8">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited global supply chain topology nodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Private Cloud VPC (AWS / Azure / GCP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Custom B2B Data Processing Agreement (DPA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>24/7 Named Site Reliability Engineer & 15-min SLA</span>
                </div>
              </div>
            </div>

            <a
              href="mailto:enterprise@linqchain.com?subject=LinqChain%20Global%20Sovereign%20Inquiry"
              className="w-full py-2.5 text-center rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 text-xs font-semibold transition-opacity"
            >
              Contact Enterprise Sales
            </a>
          </div>
        </div>

        {/* Statutory Subscription & Renewal Disclosures */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10 shadow-sm space-y-4 text-xs text-neutral-600 dark:text-neutral-300">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-500" />
            <span>Subscription, Auto-Renewal & Cancellation Disclosure</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed">
            <div>
              <strong className="block text-neutral-900 dark:text-white mb-1">Billing & Renewal Terms:</strong>
              Subscriptions are billed in advance on a recurring monthly or annual basis. Subscriptions automatically renew at the end of each billing cycle unless cancelled at least 30 days prior to the expiration of the current period.
            </div>
            <div>
              <strong className="block text-neutral-900 dark:text-white mb-1">Cancellation & 14-Day Cooling Off:</strong>
              You may cancel your subscription at any time via the Settings Panel. Under EU and UK statutory consumer protection laws, eligible entities may request a full refund within 14 days of initial activation.
            </div>
            <div>
              <strong className="block text-neutral-900 dark:text-white mb-1">Accepted Payment Methods:</strong>
              We accept corporate credit cards (Visa, MasterCard, American Express), ACH direct debit, SEPA transfers, and invoicing on Net-30 payment terms for enterprise contracts.
            </div>
            <div>
              <strong className="block text-neutral-900 dark:text-white mb-1">Payment Security & PCI-DSS:</strong>
              Payment information is tokenized and processed securely through Stripe, Inc. LinqChain never stores raw cardholder numbers or CVV codes on its servers.
            </div>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
