'use client';

import React from 'react';
import Link from 'next/link';
import { LegalHeader, LegalFooter } from '@/components/legal/legal-nav';
import { FileText, ShieldAlert, Zap, Cpu, CheckCircle2, Scale, Clock, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c0d12] text-slate-900 dark:text-neutral-100 font-sans">
      <LegalHeader title="Master Terms of Service" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Document Header */}
        <div className="mb-10 pb-8 border-b border-neutral-200 dark:border-neutral-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Master Subscription Agreement & AUP</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Master Terms of Service
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Last Updated: November 2, 2026 • Effective Date: November 2, 2026 • LinqChain Technologies Inc.
          </p>
        </div>

        {/* Critical AI & ERP Disclaimer Callout */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 mb-10 flex items-start gap-3.5">
          <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="block text-sm font-bold text-amber-950 dark:text-amber-100 mb-1">
              Important Notice Regarding Autonomous AI Actions & SAP S/4HANA PO Generation
            </strong>
            LinqChain provides decision-intelligence and automated recovery recommendations. While our multi-agent AI engine synthesizes Pareto-optimal mitigation strategies, your enterprise organization retains sole authority and discretion over autonomous spend caps, policy constraints, and final execution of BAPI/RFC purchase orders. You agree to maintain appropriate human oversight in accordance with your internal corporate governance policies.
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">1. Acceptance of Terms & Subscription Scope</h2>
            <p>
              By signing an Order Form, registering an administrative account, or accessing the LinqChain Enterprise Supply Chain Operating System ("Platform"), your entity ("Customer") agrees to be legally bound by this Master Subscription Agreement ("Agreement"). If you are entering into this Agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity.
            </p>
            <p>
              LinqChain grants Customer a non-exclusive, non-transferable, worldwide commercial subscription right to access and utilize the Platform solely for Customer’s internal supply chain operations, disruption modeling, and ERP orchestration during the applicable Subscription Term.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">2. Acceptable Use Policy (AUP)</h2>
            <p>Customer agrees not to, and will not permit any third party to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs">
              <li>Reverse engineer, decompile, disassemble, or discover the underlying proprietary source code or algorithms of the blast radius calculation engine or AI agent orchestrator;</li>
              <li>Circumvent or disable tenant isolation boundaries, administrative role-based access controls (RBAC), or cryptographic security mechanisms;</li>
              <li>Input or transmit malicious payloads, trojans, or unauthorized scripts through webhook connectors or SAP Event Mesh endpoints;</li>
              <li>Utilize the platform to benchmark performance metrics for the purpose of creating a competing commercial supply chain digital twin solution.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">3. Autonomous AI Spend Governance & Liability Disclaimer</h2>
            <p>
              The Platform provides automated disruption detection and synthesizes candidate recovery plans utilizing deterministic graph traversal and large language model inference.
            </p>
            <div className="p-4 rounded-xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10 space-y-2 text-xs">
              <p><strong>Configurable Spend Authorization Caps:</strong> The Platform enforces an administrative ceiling (configured in the Settings Panel, e.g., $50,000) beyond which automated ERP purchase order dispatches are strictly halted pending explicit multi-party human sign-off.</p>
              <p><strong>Third-Party Supplier Solvency:</strong> LinqChain does not guarantee that secondary or tertiary alternate suppliers identified in recovery plans will maintain solvency, stock availability, or price stability. External logistics disruptions resulting from force majeure events, labor strikes, natural disasters, or armed conflict are beyond LinqChain’s operational control.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">4. Service Level Agreement (SLA) & Support</h2>
            <p>
              LinqChain commits to providing <strong>99.9% Monthly Uptime</strong> for the Core Telemetry and Simulation Engine, excluding scheduled maintenance announced at least 72 hours in advance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
                <strong className="text-emerald-600 dark:text-emerald-400 block mb-1">99.9% Target Uptime</strong>
                <span>Calculated on a calendar month basis across redundant multi-region AWS and Azure availability zones.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
                <strong className="text-orange-600 dark:text-orange-400 block mb-1">P1 Incident: &lt; 30 Min</strong>
                <span>Production platform outage or complete SAP Event Mesh link failure response time 24/7/365.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
                <strong className="text-blue-600 dark:text-blue-400 block mb-1">SLA Service Credits</strong>
                <span>Service credits applied to subsequent billing invoice if monthly uptime drops below 99.9%.</span>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">5. Intellectual Property & Customer Data Sovereignty</h2>
            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10">
                <strong className="text-sm font-semibold text-neutral-900 dark:text-white block mb-1">LinqChain Intellectual Property:</strong>
                All proprietary graph traversal algorithms, AI recovery prompts, telemetry normalization models, software binaries, logos, and UI designs remain the exclusive property of LinqChain Technologies Inc. No title or ownership transfers to Customer under this Agreement.
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10">
                <strong className="text-sm font-semibold text-neutral-900 dark:text-white block mb-1">Customer Data Sovereignty:</strong>
                Customer retains 100% ownership and all intellectual property rights in and to all Customer ERP inputs, bills of materials, supplier contracts, purchase order data, and tenant-specific configurations. LinqChain will never use Customer Data to train foundation models without explicit written consent.
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">6. Fees, Auto-Renewal & Cancellation Terms</h2>
            <p>
              Subscription fees are billed in advance according to the billing interval specified in Customer's Order Form (Monthly or Annually).
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs">
              <li><strong>Automatic Renewal:</strong> Subscriptions automatically renew for successive terms equal to the initial term unless either party provides written notice of non-renewal at least 30 days prior to the expiration of the current Subscription Term.</li>
              <li><strong>Cancellation & Refunds:</strong> Subscriptions may be cancelled through the Settings Panel or by written notice to billing@linqchain.com. Except where required by statutory consumer law (such as 14-day statutory cooling-off periods for initial purchases), enterprise subscription fees are non-refundable.</li>
              <li><strong>Taxes:</strong> All fees are exclusive of applicable value-added, sales, use, or withholding taxes, which shall be invoiced to Customer as required by law.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">7. Limitation of Liability & Indemnification</h2>
            <p className="text-xs">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA LOSS, OR SUPPLY CHAIN DOWNTIME), REGARDLESS OF THE THEORY OF LIABILITY. EACH PARTY'S AGGREGATE TOTAL LIABILITY UNDER THIS AGREEMENT SHALL BE CAPPED AT THE TOTAL FEES PAID OR PAYABLE BY CUSTOMER TO LINQCHAIN DURING THE TWELVE (12) MONTHS PRECEDING THE INCIDENT GIVING RISE TO LIABILITY.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">8. Governing Law & Dispute Resolution</h2>
            <p className="text-xs">
              This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of laws principles. Any dispute, controversy, or claim arising out of or relating to this Agreement shall be settled by binding commercial arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules.
            </p>
          </section>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
