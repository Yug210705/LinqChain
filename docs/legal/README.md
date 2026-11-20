# LinqChain Legal, Compliance & Regulatory Architecture Master Index

Welcome to the **LinqChain Legal, Compliance & Data Protection Documentation Suite**. This repository contains the complete legal framework, policies, Standard Operating Procedures (SOPs), and technical safeguards establishing full compliance with GDPR (EU/UK), CCPA/CPRA (California), ePrivacy Directive, FTC Automatic Renewal Rules, and international commercial law.

---

## 📋 The 15 Statutory & Regulatory Compliance Pillars

| # | Compliance Requirement | Canonical Policy Document | Application Route / Feature |
| :---: | :--- | :--- | :--- |
| **1** | **Privacy Policy** | [`01-privacy-policy.md`](./01-privacy-policy.md) | Public `/privacy` page & login footer |
| **2** | **Terms and Conditions (MSA & AUP)** | [`02-terms-and-conditions.md`](./02-terms-and-conditions.md) | Public `/terms` page & registration sign-off |
| **3** | **GDPR & CCPA Applicability** | [`03-gdpr-applicability-assessment.md`](./03-gdpr-applicability-assessment.md) | Controller/Processor boundary definitions |
| **4** | **Cookie & Tracking Consent** | [`04-cookie-and-tracking-policy.md`](./04-cookie-and-tracking-policy.md) | Interactive `<CookieConsentBanner />` & Modal with GPC/DNT |
| **5** | **Lawful Basis Register (ROPA)** | [`05-lawful-basis-register.md`](./05-lawful-basis-register.md) | GDPR Art. 6 & Art. 30 processing records |
| **6** | **Marketing Consent & Anti-Spam** | [`06-marketing-consent-and-spam-policy.md`](./06-marketing-consent-and-spam-policy.md) | Settings: Communication preferences switches |
| **7** | **Data Deletion (Right to Erasure)** | [`07-data-deletion-and-erasure-sop.md`](./07-data-deletion-and-erasure-sop.md) | Settings: Deletion modal & `POST /api/v1/compliance/request-deletion` |
| **8** | **Data Retention Schedule** | [`08-data-retention-schedule.md`](./08-data-retention-schedule.md) | Automated purge & 7-year statutory financial rules |
| **9** | **Data Processing Agreement (DPA)** | [`09-data-processing-agreement-template.md`](./09-data-processing-agreement-template.md) | B2B EU Standard Contractual Clauses (SCCs) |
| **10** | **Third-Party Subprocessor Registry**| [`10-third-party-subprocessors-registry.md`](./10-third-party-subprocessors-registry.md) | Settings & `GET /api/v1/compliance/subprocessors` |
| **11** | **Data Security & Safeguards (TOMs)** | [`11-data-security-and-safeguards.md`](./11-data-security-and-safeguards.md) | Public `/security` page (AES-256, TLS 1.3, RLS, RBAC) |
| **12** | **Data Breach Procedure (72h SOP)** | [`12-data-breach-response-procedure.md`](./12-data-breach-response-procedure.md) | GDPR Art. 33/34 Incident Response Plan |
| **13** | **Intellectual Property Policy** | [`13-intellectual-property-policy.md`](./13-intellectual-property-policy.md) | Trademark, code ownership & customer data title |
| **14** | **Open Source Licenses (OSS)** | [`14-open-source-license-compliance-audit.md`](./14-open-source-license-compliance-audit.md)| Public `/licenses` page (Zero-copyleft verification) |
| **15** | **Subscription, Billing & Renewals** | [`15-subscription-billing-and-cancellation-terms.md`](./15-subscription-billing-and-cancellation-terms.md)| Public `/pricing` page & transparent renewal terms |

---

## 🏛️ In-App Implementation Summary

1. **Global Cookie Consent & GPC Banner:** [`frontend/src/components/legal/cookie-consent-banner.tsx`](file:///c:/Users/Yug%20Pathak/Desktop/LinqChain/frontend/src/components/legal/cookie-consent-banner.tsx)
2. **Dedicated Public Pages:**
   - [`/privacy`](file:///c:/Users/Yug%20Pathak/Desktop/LinqChain/frontend/src/app/privacy/page.tsx)
   - [`/terms`](file:///c:/Users/Yug%20Pathak/Desktop/LinqChain/frontend/src/app/terms/page.tsx)
   - [`/security`](file:///c:/Users/Yug%20Pathak/Desktop/LinqChain/frontend/src/app/security/page.tsx)
   - [`/licenses`](file:///c:/Users/Yug%20Pathak/Desktop/LinqChain/frontend/src/app/licenses/page.tsx)
   - [`/pricing`](file:///c:/Users/Yug%20Pathak/Desktop/LinqChain/frontend/src/app/pricing/page.tsx)
3. **In-App Privacy & Subject Rights Center:** [`frontend/src/app/settings/page.tsx`](file:///c:/Users/Yug%20Pathak/Desktop/LinqChain/frontend/src/app/settings/page.tsx)
4. **Backend Compliance API:** [`backend/app/api/compliance.py`](file:///c:/Users/Yug%20Pathak/Desktop/LinqChain/backend/app/api/compliance.py) registered in [`backend/app/main.py`](file:///c:/Users/Yug%20Pathak/Desktop/LinqChain/backend/app/main.py)
5. **Universal Legal Footer & Links:** Incorporated into [`login/page.tsx`](file:///c:/Users/Yug%20Pathak/Desktop/LinqChain/frontend/src/app/login/page.tsx) and [`admin/login/page.tsx`](file:///c:/Users/Yug%20Pathak/Desktop/LinqChain/frontend/src/app/admin/login/page.tsx).
