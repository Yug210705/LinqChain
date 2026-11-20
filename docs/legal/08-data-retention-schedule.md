# LinqChain Data Retention & Destruction Schedule

**Document ID:** COMP-RET-2026-V1  
**Compliance Standards:** GDPR Article 5(1)(e) (Storage Limitation), ISO 27001 Control A.8.10, German HGB/AO, US IRS Guidelines  

---

## 1. Storage Limitation Principles
Personal data is retained only for the duration necessary to satisfy operational supply chain purposes, contractual commitments, and statutory legal obligations. When retention periods expire, data is securely and permanently destroyed using cryptographic erasure and DoD 5220.22-M sanitization methods.

---

## 2. Retention Schedule Table

| Data Category | Target Records / Tables | Minimum Retention | Maximum Retention | Destruction Method | Legal Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Operator Credentials** | `platform_users`, `admin_users` | Duration of active subscription | Subscription term + 90 days | Cryptographic hashing / table purge | Contract Performance (Art. 6(1)(b)) |
| **Topology Graph State** | `ports`, `plants`, `suppliers`, `transport_routes` | Real-time session duration | 30 days post-tenant cancellation | Database cascade delete & RLS wipe | Contract Performance (Art. 6(1)(b)) |
| **Simulation Runs** | `disruptions`, `scenarios` | 30 days | 12 months | Automated cron purge or manual reset | Legitimate Interests (Art. 6(1)(f)) |
| **Recovery Plans & AI Reasoning** | `recovery_plans`, `ai_prompts` | 90 days | 24 months | Automated archival & deletion | Service Improvement & Auditing |
| **SAP PO Transactions** | `sap_actions`, `bapi_logs` | 6 years | 7 years (Statutory) | Secure cold-storage archive | Commercial Tax & Financial Law |
| **Admin & Security Logs** | `admin_audit_logs` | 12 months | 36 months | Pseudonymization & cold archival | SOC 2 Type II & Security Compliance |
| **Cookie & Consent Records** | `user_consents`, `localStorage` | Duration of session | 12 months | Local cookie expire / table wipe | GDPR Art. 7 Proof of Consent |

---

## 3. Automated Purge Mechanisms
- Simulation runs older than 12 months are automatically flagged for archival.
- Administrators can trigger instant graph layout and disruption wipes via **Settings → Platform Diagnostic & Resets**.
