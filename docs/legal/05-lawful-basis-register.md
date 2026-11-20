# LinqChain Lawful Basis Register (ROPA)

**Statutory Mandate:** GDPR Article 30 (Record of Processing Activities - ROPA) & Article 6 (Lawfulness of Processing)  
**Maintained By:** LinqChain Legal & Compliance Division  

---

## 1. Processing Activities Inventory

| Activity Ref | Processing Description | Data Elements | Lawful Basis | Legal Basis Justification |
| :--- | :--- | :--- | :--- | :--- |
| **PA-01** | User Authentication & Access Management | Email, password hash, role ID, tenant ID, SSO identity tokens. | **Contract Performance (Art. 6(1)(b))** | Necessary to deliver the contracted supply chain mission control service and authenticate authorized operators. |
| **PA-02** | Supply Chain Blast Radius Simulation | Supplier corporate names, plant coordinates, bill of materials, inventory levels. | **Contract Performance (Art. 6(1)(b))** | Primary core service functionality required by enterprise subscription agreement. |
| **PA-03** | Autonomous RFC/BAPI PO Execution | Purchase order number, line items, quantity, supplier address, approver email. | **Contract Performance (Art. 6(1)(b)) & Legitimate Interests (Art. 6(1)(f))** | Necessary to execute enterprise mitigations signed off by authorized procurement officers. |
| **PA-04** | Security & Compliance Audit Logging | IP address, timestamp, API endpoints, actor email, spend approval signatures. | **Legal Obligation (Art. 6(1)(c)) & Legitimate Interests (Art. 6(1)(f))** | Required under commercial accounting laws, SOC 2 non-repudiation mandates, and cybersecurity defense. |
| **PA-05** | Product Release & AI Model Digest | Email, name, job title, communication preference flags. | **Consent (Art. 6(1)(a))** | Dispatched only after explicit double opt-in in user settings; revocable unconditionally at any time. |
| **PA-06** | Subscription Billing & Invoicing | Corporate billing contact, corporate tax ID, billing address, transaction IDs. | **Legal Obligation (Art. 6(1)(c)) & Contract Performance (Art. 6(1)(b))** | Compliance with statutory corporate tax, VAT, and fiscal bookkeeping laws. |

---

## 2. Legitimate Interest Assessment (LIA) Summary
For activities relying on Article 6(1)(f) (PA-03 and PA-04):
- **Purpose Test:** Detecting supply chain vulnerabilities, preventing fraud, and defending critical infrastructure.
- **Necessity Test:** Less intrusive measures cannot achieve equivalent real-time incident auditing.
- **Balancing Test:** Processing involves purely corporate business identities acting in professional capacities; individuals' fundamental rights and freedoms are safeguarded by strict encryption and access controls.
