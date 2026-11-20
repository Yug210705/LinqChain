'use client';

import React from 'react';
import Link from 'next/link';
import { LegalHeader, LegalFooter } from '@/components/legal/legal-nav';
import { Shield, Lock, FileText, Database, Globe, CheckCircle2, UserCheck, AlertTriangle, ArrowRight, Cookie } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const openCookieModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('linqchain:open-cookie-preferences'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c0d12] text-slate-900 dark:text-neutral-100 font-sans">
      <LegalHeader title="Enterprise Privacy Policy" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Document Header */}
        <div className="mb-10 pb-8 border-b border-neutral-200 dark:border-neutral-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>GDPR, UK-GDPR & CCPA/CPRA Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Enterprise Privacy Policy
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Last Updated: November 2, 2026 • Effective Date: November 2, 2026 • Version 2.1-Enterprise
          </p>
        </div>

        {/* Quick Summary Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10 shadow-sm mb-12">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Privacy at LinqChain at a Glance</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5">
              <strong className="block text-neutral-900 dark:text-white mb-1">What we process:</strong>
              Identity records (name, email, role), ERP telemetry (material codes, purchase order line items, plant IDs), and simulation execution logs.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5">
              <strong className="block text-neutral-900 dark:text-white mb-1">Why we process it:</strong>
              To compute supply chain disruption blast radius, synthesize multi-agent AI mitigation plans, and execute authorized RFC/BAPI transactions on SAP S/4HANA.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5">
              <strong className="block text-neutral-900 dark:text-white mb-1">We never sell data:</strong>
              LinqChain never sells, rents, or monetizes customer telemetry or personal information to third parties, advertising networks, or data brokers.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5">
              <strong className="block text-neutral-900 dark:text-white mb-1">You retain full sovereignty:</strong>
              Export your complete personal data archive anytime via GDPR Art. 20 Portability or submit an erasure request under GDPR Art. 17.
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">1. Introduction & Scope</h2>
            <p>
              LinqChain Technologies Inc. ("LinqChain", "we", "us", or "our") operates the LinqChain Enterprise Supply Chain Operating System, web applications, APIs, and associated enterprise integration bridges (collectively, the "Platform"). This Privacy Policy describes how we collect, use, disclose, protect, and process personal data when you interact with our services.
            </p>
            <p>
              In the context of European Data Protection Legislation (GDPR & UK GDPR), LinqChain acts as:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Data Controller</strong> for account registration details, operator profiles, administrative audit logs, and direct customer billing relationships.</li>
              <li><strong>Data Processor</strong> when ingesting and analyzing customer supply chain datasets, vendor telemetry, and SAP S/4HANA operational data on behalf of our enterprise customers pursuant to our Data Processing Agreement (DPA).</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">2. Categories of Data We Collect</h2>
            <div className="space-y-2">
              <div className="p-4 rounded-xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10">
                <h3 className="font-semibold text-neutral-900 dark:text-white">A. Operator & Account Data</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Name, corporate email address, hashed credentials, organization ID, assigned RBAC role (e.g., Supply Chain Director, Operator), and Single Sign-On (SSO) federated subject identifiers (SAP Cloud Identity, Microsoft Azure AD).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10">
                <h3 className="font-semibold text-neutral-900 dark:text-white">B. ERP & Digital Twin Telemetry</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Supplier entity names, plant coordinates, bill of materials (BOM), active inventory balances, transport route waypoints, and SAP purchase order numbers processed to simulate disruptions and synthesize AI recovery strategies.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10">
                <h3 className="font-semibold text-neutral-900 dark:text-white">C. Operational & Security Audit Logs</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  IP addresses, timestamps, browser user agent, API endpoints accessed, simulated blast radius hops, and explicit human sign-off approvals for autonomous spend transactions.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">3. Lawful Basis for Processing (GDPR Art. 6)</h2>
            <p>
              We process personal data strictly where permitted under applicable data protection laws. Our lawful bases include:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
                <strong className="text-orange-600 dark:text-orange-400 block mb-1">Contractual Necessity (Art. 6(1)(b))</strong>
                <span className="text-xs">Providing our resilience optimization services, managing user sessions, and executing authorized ERP recovery actions.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
                <strong className="text-orange-600 dark:text-orange-400 block mb-1">Legitimate Interests (Art. 6(1)(f))</strong>
                <span className="text-xs">Securing the platform against unauthorized access, detecting fraud, and optimizing AI inference efficiency.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
                <strong className="text-orange-600 dark:text-orange-400 block mb-1">Legal Obligation (Art. 6(1)(c))</strong>
                <span className="text-xs">Complying with commercial accounting rules, export controls, and statutory security audit trail requirements.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
                <strong className="text-orange-600 dark:text-orange-400 block mb-1">Consent (Art. 6(1)(a))</strong>
                <span className="text-xs">Optional non-essential performance cookies, product announcement digests, and optional telemetry streams.</span>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">4. Third-Party Subprocessors & International Transfers</h2>
            <p>
              To deliver resilient cloud infrastructure, LinqChain engages trusted third-party service providers (subprocessors) that adhere to stringent confidentiality and security standards. All international transfers outside the EEA or UK are safeguarded by Standard Contractual Clauses (SCCs) or the EU-U.S. Data Privacy Framework:
            </p>
            <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-white/[0.05] border-b border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white">
                  <tr>
                    <th className="p-3 font-semibold">Subprocessor</th>
                    <th className="p-3 font-semibold">Purpose</th>
                    <th className="p-3 font-semibold">Location</th>
                    <th className="p-3 font-semibold">Safeguard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                  <tr>
                    <td className="p-3 font-medium text-neutral-900 dark:text-white">Supabase, Inc.</td>
                    <td className="p-3">Database & Realtime WebSockets</td>
                    <td className="p-3">USA / EU (Frankfurt)</td>
                    <td className="p-3">EU SCCs & DPA</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-neutral-900 dark:text-white">Amazon Web Services (AWS)</td>
                    <td className="p-3">VPC Compute & Encrypted Storage</td>
                    <td className="p-3">USA / Ireland / Germany</td>
                    <td className="p-3">ISO 27001, SOC 2, SCCs</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-neutral-900 dark:text-white">SAP SE</td>
                    <td className="p-3">S/4HANA ERP Telemetry & Event Mesh</td>
                    <td className="p-3">Germany (EU)</td>
                    <td className="p-3">Direct Intra-EU Processing</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-neutral-900 dark:text-white">PostHog, Inc.</td>
                    <td className="p-3">Product Diagnostics (Opt-in)</td>
                    <td className="p-3">Germany (EU Cloud)</td>
                    <td className="p-3">GDPR Art. 28 DPA</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-neutral-900 dark:text-white">Stripe, Inc.</td>
                    <td className="p-3">Subscription Billing & Invoicing</td>
                    <td className="p-3">USA / Ireland</td>
                    <td className="p-3">PCI-DSS Level 1, SCCs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">5. Data Retention & Erasure</h2>
            <p>
              We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy or to comply with statutory accounting and regulatory audit mandates:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs">
              <li><strong>Active Account Records:</strong> Retained for the duration of the enterprise subscription agreement plus 90 days after contract termination.</li>
              <li><strong>Simulation & Disruption Logs:</strong> Retained for 12 months for historical trend modeling unless purged earlier by the tenant administrator.</li>
              <li><strong>Audit Trail & ERP Postings:</strong> Retained for 7 years in compliance with enterprise statutory financial and tax accounting requirements (GDPR Art. 17(3)(b)).</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">6. Your Data Subject Rights (GDPR & CCPA)</h2>
            <p>
              Depending on your jurisdiction (such as the EU/EEA, UK, or California), you are entitled to exercise the following rights:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10">
                <strong>Right of Access & Portability:</strong> Request a complete copy of your personal data archive in machine-readable JSON format.
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10">
                <strong>Right to Erasure ("To Be Forgotten"):</strong> Request permanent cryptographic deletion of your personal identifiers.
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10">
                <strong>Right to Rectification:</strong> Correct inaccurate or incomplete user identity and billing attributes.
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10">
                <strong>Right to Restriction & Objection:</strong> Object to processing based on legitimate interests or request processing suspension.
              </div>
            </div>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openCookieModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Cookie className="w-4 h-4" />
                <span>Adjust Cookie Preferences</span>
              </button>
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-200 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/15 text-neutral-800 dark:text-white font-semibold text-xs transition-colors"
              >
                <span>Export My Data in Settings →</span>
              </Link>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">7. Data Protection Officer (DPO) Contact</h2>
            <p>
              If you have any questions regarding this Privacy Policy, wish to exercise your data subject rights, or wish to report a privacy concern, please contact our Data Protection Officer:
            </p>
            <div className="p-4 rounded-xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10 text-xs space-y-1">
              <p><strong>LinqChain Data Protection Office</strong></p>
              <p>Email: <a href="mailto:privacy@linqchain.com" className="text-orange-600 dark:text-orange-400 underline">privacy@linqchain.com</a> | <a href="mailto:dpo@linqchain.com" className="text-orange-600 dark:text-orange-400 underline">dpo@linqchain.com</a></p>
              <p>Security Response Team: <a href="mailto:security@linqchain.com" className="text-orange-600 dark:text-orange-400 underline">security@linqchain.com</a></p>
              <p>Corporate Address: LinqChain Technologies Inc., Enterprise Compliance Division</p>
            </div>
          </section>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
