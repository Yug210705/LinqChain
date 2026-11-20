# LinqChain Enterprise Privacy Policy

**Effective Date:** November 2, 2026  
**Version:** 2.1-Enterprise  
**Entity:** LinqChain Technologies Inc.  
**Contact:** privacy@linqchain.com | dpo@linqchain.com  

---

## 1. Overview & Scope
LinqChain Technologies Inc. ("LinqChain", "we", "us", or "our") provides an autonomous supply chain operating system enabling enterprise organizations to simulate disruption blast radius, synthesize Pareto-optimal mitigation strategies, and orchestrate automated recovery actions through enterprise resource planning (ERP) connections, including SAP S/4HANA.

This Privacy Policy explains how we collect, process, store, protect, and disclose personal data when operators, system administrators, enterprise users, and partners access our web application, APIs, and integration services.

---

## 2. Personal Data Collected & Purpose of Processing

| Data Category | Specific Data Elements | Purpose of Processing | Lawful Basis (GDPR Art. 6) |
| :--- | :--- | :--- | :--- |
| **Account & Identity Data** | Name, corporate email, hashed passwords, organization ID, assigned RBAC role (e.g., Director, Operator), SSO federated subject tokens. | User authentication, session management, multi-tenant workspace isolation. | Performance of Contract (Art. 6(1)(b)) |
| **ERP & Telemetry Inputs** | Supplier entity names, supplier contact emails, plant coordinates, bill of materials (BOM), purchase order lines, transport routes. | Calculating blast radius cascade depth, identifying alternate suppliers, executing RFC/BAPI purchase orders. | Performance of Contract (Art. 6(1)(b)) & Legitimate Interests (Art. 6(1)(f)) |
| **Security & Audit Logs** | IP address, timestamp, browser user-agent, API request payload metadata, simulation execution history, spend approval signatures. | Platform security, threat detection, audit compliance, non-repudiation of financial spend approvals. | Legal Obligation (Art. 6(1)(c)) & Legitimate Interests (Art. 6(1)(f)) |
| **Communication Preferences** | Email digest preferences, incident klaxon opt-ins, product announcement choices. | Delivering scheduled incident briefings and operational system notices. | Consent (Art. 6(1)(a)) |

---

## 3. Strict No-Sale Commitment
LinqChain **does not sell, rent, monetize, or trade** personal data, supplier topologies, or enterprise telemetry to third parties, advertising brokers, or external analytics firms.

---

## 4. International Data Transfers
Customer data may be processed in the United States and the European Union across certified multi-region cloud infrastructures (AWS, Microsoft Azure, Supabase). All international transfers out of the European Economic Area (EEA) and the United Kingdom are governed by the European Commission's **Standard Contractual Clauses (SCCs)** pursuant to GDPR Article 46 or adequacy decisions under the EU-U.S. Data Privacy Framework (DPF).

---

## 5. Data Retention & Destruction
Personal identifiers are stored only as long as necessary to fulfill contractual obligations:
- **Active Accounts:** Retained for subscription term + 90-day grace transition window.
- **Simulation History:** Stored for 12 months for trend analytics, unless manually cleared by workspace administrators.
- **ERP Purchase Order Postings & Audit Logs:** Retained for 7 years to fulfill statutory commercial accounting and tax compliance duties (GDPR Art. 17(3)(b)).

---

## 6. Data Subject Rights
Individuals located in the EEA, UK, Switzerland, and California (under CCPA/CPRA) possess statutory rights:
- **Right to Access & Portability (Art. 15 & 20):** Instant export of machine-readable personal data archives via the Settings Panel or API.
- **Right to Erasure / "To Be Forgotten" (Art. 17):** Request cryptographic deletion of personal identifiers.
- **Right to Rectification (Art. 16):** Update inaccurate personal attributes.
- **Right to Object / Restrict Processing (Art. 18 & 21):** Restrict telemetry processing or revoke marketing consents.

To exercise these rights, navigate to the **Privacy & Compliance** tab in Settings or email `privacy@linqchain.com`.
