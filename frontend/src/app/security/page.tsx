'use client';

import React from 'react';
import Link from 'next/link';
import { LegalHeader, LegalFooter } from '@/components/legal/legal-nav';
import { ShieldCheck, Lock, AlertTriangle, Key, Server, Eye, FileText, CheckCircle2, Clock, Bell } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c0d12] text-slate-900 dark:text-neutral-100 font-sans">
      <LegalHeader title="Enterprise Security & Breach Protocol" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Document Header */}
        <div className="mb-10 pb-8 border-b border-neutral-200 dark:border-neutral-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SOC 2 Type II & ISO 27001 Aligned Controls</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Data Security & Breach Protocol
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Technical & Organizational Safeguards (GDPR Art. 32) and 72-Hour Breach Notification SOP
          </p>
        </div>

        {/* 72-Hour Notification Commitment Highlight */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 mb-10 flex items-start gap-3.5">
          <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="block text-sm font-bold text-emerald-950 dark:text-emerald-100 mb-1">
              Statutory 72-Hour Data Breach Regulatory Protocol (GDPR Art. 33 & 34)
            </strong>
            In the event of a verified security incident affecting customer personal data or proprietary SAP telemetry, LinqChain will notify the competent supervisory authority (and affected enterprise data controllers) without undue delay and, where feasible, not later than 72 hours after becoming aware of the breach, accompanied by comprehensive forensic remediation disclosures.
          </div>
        </div>

        {/* Security Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5">Cryptographic Encryption</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              All data in transit is encrypted using <strong>TLS 1.3</strong> with Perfect Forward Secrecy. Data at rest is secured via <strong>AES-256-GCM</strong> envelope encryption across PostgreSQL tables, blob storage, and cached telemetry streams.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-3">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5">Tenant Isolation & RLS</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Multi-tenant data partitioning is enforced at the database kernel level through Supabase PostgreSQL <strong>Row-Level Security (RLS)</strong>, cryptographically guaranteeing zero cross-tenant data leakage.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-3">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5">Enterprise Identity & RBAC</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Support for SAML 2.0 and OIDC Single Sign-On (SAP Cloud Identity, Microsoft Azure AD) with mandatory multi-factor authentication (MFA) and granular Role-Based Access Controls (Owner, Admin, Operator, Viewer).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-3">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5">Immutable Audit Trail</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every administrative login, policy change, simulation trigger, and SAP BAPI/RFC order execution is recorded in an immutable, append-only compliance audit log with client IP, timestamp, and actor identity.
            </p>
          </div>
        </div>

        {/* Breach Response Workflow */}
        <div className="space-y-6 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Incident Response & 4-Stage Breach SOP</h2>
            <p className="text-xs">
              LinqChain maintains an active Incident Response Team (IRT) operating in accordance with NIST SP 800-61 and GDPR Article 33 guidelines:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
                <strong className="text-neutral-900 dark:text-white block mb-1">Stage 1: Identification & Immediate Containment (&lt; 2 Hours)</strong>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Automated network anomaly alerts isolate compromised credentials or affected containers. Ephemeral tokens and active sessions are revoked across affected clusters.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
                <strong className="text-neutral-900 dark:text-white block mb-1">Stage 2: Forensic Eradication & Impact Assessment (&lt; 24 Hours)</strong>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Forensic analysis identifies the exact vector of unauthorized access, affected tenant IDs, and whether any personal identifiers or ERP order contents were exfiltrated.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
                <strong className="text-neutral-900 dark:text-white block mb-1">Stage 3: Regulatory & Customer Notification (&lt; 72 Hours)</strong>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Formal written notification dispatched to the Lead Supervisory Authority and affected customer security leads detailing nature of breach, contact details of the DPO, likely consequences, and remediation measures taken.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
                <strong className="text-neutral-900 dark:text-white block mb-1">Stage 4: Post-Incident Hardening & Root-Cause Analysis (RCA)</strong>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Delivery of comprehensive technical post-mortem report, patch deployment, key rotation, and regression testing across all cluster environments.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Responsible Vulnerability Disclosure</h2>
            <p className="text-xs">
              We welcome reports from security researchers and ethical hackers. If you believe you have identified a vulnerability in LinqChain, please email our Security Operations Center immediately at:
            </p>
            <div className="p-4 rounded-xl bg-neutral-900 text-white font-mono text-xs">
              Email: security@linqchain.com<br />
              PGP Key ID: 0x8F3C92B1 (Available upon request)<br />
              SLA: Initial response within 4 hours; triage within 24 hours.
            </div>
          </section>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
