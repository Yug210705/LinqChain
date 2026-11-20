# LinqChain Technical & Organizational Security Measures (TOMs)

**Compliance Standard:** GDPR Article 32 (Security of Processing), ISO/IEC 27001:2022, SOC 2 Type II Trust Services Criteria  
**Classification:** Confidential Security Architecture Whitepaper  

---

## 1. Cryptographic Safeguards
1. **Data in Transit:** Enforced TLS 1.3 encryption across all public web endpoints, API routes, and WebSocket telemetry connections. Deprecated ciphers (SSLv3, TLS 1.0, TLS 1.1) are strictly rejected. Perfect Forward Secrecy (PFS) is mandatory.
2. **Data at Rest:** All relational database volumes, cloud object backups, and cached simulation snapshots are encrypted with AES-256-GCM using envelope key management rotated every 90 days.
3. **Password Security:** User credentials are encrypted using modern Argon2id or bcrypt with high work factors and random per-user salt.

---

## 2. Access Control & Identity Governance
1. **Zero-Trust Perimeter:** Network boundaries require continuous identity verification. Administrative access to production clusters requires hardware security keys (FIDO2/WebAuthn).
2. **Role-Based Access Control (RBAC):** Granular permissions enforce least-privilege principles across platform roles (`OWNER`, `ADMIN`, `OPERATOR`, `VIEWER`).
3. **Multi-Tenant Row-Level Security (RLS):** Supabase PostgreSQL RLS policies guarantee that database queries automatically isolate tenant records (`org_id`), eliminating any possibility of horizontal privilege escalation.

---

## 3. Resilience, High Availability & Disaster Recovery
1. **Multi-Region Redundancy:** Active-passive failover between AWS Frankfurt and Dublin data centers.
2. **Recovery Objectives:**
   - Recovery Point Objective (RPO): < 15 minutes.
   - Recovery Time Objective (RTO): < 1 hour.
3. **Continuous Automated Backups:** Point-in-time recovery (PITR) enabled with 30-day continuous wal-log replication.
