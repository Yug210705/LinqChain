# LinqChain Data Breach Incident Response & Notification Procedure

**Procedure ID:** IRP-COMP-72H  
**Compliance Standards:** GDPR Articles 33 & 34, UK GDPR, HIPAA Security Rule, SEC Cybersecurity Disclosure Rules  
**Incident Response Team Contact:** `security@linqchain.com` (24/7 Hotline)  

---

## 1. Incident Definition
A personal data breach is defined as any verified security incident leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, personal data transmitted, stored, or otherwise processed by LinqChain.

---

## 2. 72-Hour Response Timeline & Phased SOP

```
   T = 0h                   T + 2h                  T + 24h                 T + 72h
┌──────────────┐        ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│ Detection &  │───────>│ Immediate    │───────>│ Forensic     │───────>│ Supervisory  │
│ Triage       │        │ Containment  │        │ Assessment   │        │ Notification │
└──────────────┘        └──────────────┘        └──────────────┘        └──────────────┘
```

### Phase 1: Detection & Triage (T = 0 to 2 Hours)
- Automated alerts from cloud intrusion detection systems (IDS) or SOC 2 monitoring trigger immediate incident escalation.
- Incident Commander (Head of Security) and Data Protection Officer (DPO) convene the Computer Security Incident Response Team (CSIRT).

### Phase 2: Immediate Containment & Eradication (T = 2 to 12 Hours)
- Compromised API credentials, tokens, or network subnets are revoked and isolated.
- Memory dumps and access logs are captured and preserved under chain-of-custody protocols for forensic analysis.

### Phase 3: Risk Assessment & Scoping (T = 12 to 36 Hours)
- Determine whether the breach results in a "risk to the rights and freedoms of natural persons" (GDPR Art. 33).
- Quantify affected customer tenant IDs, data categories exfiltrated, and cryptographic status (e.g., whether exfiltrated records were AES-256 encrypted).

### Phase 4: Regulatory & Customer Notification (T <= 72 Hours)
- **Supervisory Authority Notification (Art. 33):** If risk is established, the DPO notifies the Lead Supervisory Authority (and/or UK ICO) within **72 hours** of becoming aware of the breach. The notice includes:
  1. Description of the nature of the personal data breach including categories and approximate number of data subjects.
  2. Contact details of the Data Protection Officer.
  3. Description of likely consequences of the breach.
  4. Remediation measures taken or proposed to mitigate possible adverse effects.
- **Customer Controller Notification:** For customer-owned supply chain datasets, LinqChain as Data Processor notifies affected Customer Data Controllers without undue delay (within 24 hours of confirmation).
- **Communication to Data Subjects (Art. 34):** If the breach is likely to result in a *high risk* to rights and freedoms, affected individuals are notified directly in clear and plain language.

---

## 3. Post-Incident Hardening & Audit
Within 14 calendar days post-containment, LinqChain delivers a comprehensive Root-Cause Analysis (RCA) report and implements technical preventative safeguards.
