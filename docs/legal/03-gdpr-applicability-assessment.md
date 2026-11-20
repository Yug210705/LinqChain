# LinqChain GDPR & CCPA/CPRA Applicability Assessment

**Document ID:** COMP-GDPR-2026-V1  
**Lead Compliance Auditor:** LinqChain Data Protection Office  
**Target Regulations:** EU General Data Protection Regulation (2016/679), UK Data Protection Act 2018, California Consumer Privacy Act (CCPA/CPRA)  

---

## 1. Territorial Scope (GDPR Article 3)
GDPR applies directly to LinqChain under Article 3:
1. **Article 3(1) - Establishment:** LinqChain engages subprocessors, servers, and corporate subsidiaries within the European Union (e.g., Frankfurt AWS/Supabase cluster, SAP SE headquarters in Germany).
2. **Article 3(2) - Extraterritorial Scope:** LinqChain offers supply chain risk management services to enterprise data subjects located within the EU/EEA and processes personal data related to enterprise operators, procurement managers, and logistics coordinators based in EU member states.

---

## 2. Classification: Data Controller vs Data Processor (GDPR Article 4)

### A. LinqChain as Data Controller (Art. 4(7))
LinqChain determines the purposes and means of processing for:
- Operator registration credentials and login sessions (`platform_users`, `admin_users`).
- Billing contacts, invoicing details, and subscription records.
- Security audit logs, IP tracking, and fraud prevention telemetry (`admin_audit_logs`).
- Marketing and newsletter communication consents.

### B. LinqChain as Data Processor (Art. 4(8))
When enterprise customers ingest supply chain master data, vendor rosters, and SAP S/4HANA transactional purchase orders into LinqChain:
- **The Customer is the Data Controller** determining what business and supplier data is imported.
- **LinqChain is the Data Processor** analyzing, simulating blast radius, and generating mitigation recommendations solely pursuant to customer instructions formalized in our B2B Data Processing Agreement (DPA).

---

## 3. Special Category Data (GDPR Article 9)
LinqChain **does not collect or process** special categories of sensitive personal data (racial or ethnic origin, political opinions, religious beliefs, biometric data, genetic data, or health data).

---

## 4. Cross-Border Data Transfer Safeguards (GDPR Chapter V)
For transfers from the EU to infrastructure nodes outside the EEA:
- **Standard Contractual Clauses (SCCs):** Incorporated into all cloud vendor DPAs (AWS, Azure, Supabase, Stripe).
- **EU-U.S. Data Privacy Framework (DPF):** Relied upon for U.S. service providers maintaining active DPF certification.
- **Data Residency Options:** Enterprise Sovereign tier provides exclusive intra-EU data residency within Frankfurt and Dublin availability zones.
