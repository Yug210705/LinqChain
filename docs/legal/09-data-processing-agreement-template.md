# LinqChain B2B Data Processing Agreement (DPA)

**Model:** Standard Contractual Clauses (Commission Implementing Decision (EU) 2021/914)  
**Parties:** Customer ("Data Controller") and LinqChain Technologies Inc. ("Data Processor")  
**Effective Date:** Concurrently with Master Subscription Agreement  

---

## 1. Scope & Purpose of Processing
1. **Roles:** Customer acts as Data Controller. LinqChain acts as Data Processor under GDPR Article 28.
2. **Subject Matter:** Ingestion, modeling, simulation, and autonomous recovery orchestration of enterprise supply chain telemetry.
3. **Categories of Data Subjects:** Customer employees, procurement managers, logistics personnel, and third-party supplier contacts.
4. **Nature of Processing:** Storage, blast radius graph computation, AI plan synthesis, and RFC/BAPI order dispatching.

---

## 2. Processor Obligations (GDPR Article 28(3))
LinqChain agrees to:
1. Process personal data strictly on documented written instructions from Customer.
2. Ensure that personnel authorized to process personal data have committed to strict confidentiality obligations.
3. Implement Technical and Organizational Measures (TOMs) ensuring a level of security appropriate to the risk (GDPR Art. 32).
4. Engage subprocessors only with general or specific prior written authorization and under equivalent contractual data protection terms.
5. Assist Customer in fulfilling its obligations to respond to data subject requests (Art. 15–22).
6. Assist Customer in ensuring compliance with breach notification duties (Art. 33 & 34) and Data Protection Impact Assessments (DPIAs) (Art. 35).
7. At the choice of Customer, delete or return all personal data upon termination of services.
8. Make available to Customer all information necessary to demonstrate compliance with Article 28 and allow for audits.

---

## 3. Subprocessors & International Transfers
- Authorized subprocessors are listed in Schedule 1 (and online at `https://linqchain.com/compliance/subprocessors`).
- LinqChain shall notify Customer at least 30 days prior to onboarding a new subprocessor.
- For transfers to third countries, the Standard Contractual Clauses (Module 2: Controller-to-Processor) are hereby incorporated by reference.

---

## Schedule 1: Technical & Organizational Security Measures (TOMs)
- **Encryption:** AES-256 at rest; TLS 1.3 in transit.
- **Access Control:** Multi-factor authentication (MFA), least-privilege RBAC.
- **Isolation:** Multi-tenant separation via PostgreSQL Row-Level Security (RLS).
- **Resilience:** Multi-region automatic failover with RPO < 15 minutes, RTO < 1 hour.
