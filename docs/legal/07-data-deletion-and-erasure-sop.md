# Standard Operating Procedure (SOP): GDPR Art. 17 Right to Erasure

**SOP Code:** SOP-COMP-017  
**Effective Date:** November 2, 2026  
**Applicability:** All customer erasure ("Right to be Forgotten") requests under GDPR Article 17 and CCPA Section 1798.105  

---

## 1. Request Intake & Verification
1. **Self-Service Invocation:**
   - Authenticated users may trigger an erasure request directly in the web application: **Settings → Privacy & GDPR Compliance → Request Account & Data Deletion**.
   - Invocation via API: `POST /api/v1/compliance/request-deletion` with authentication token and email confirmation.
2. **Identity Verification:**
   - The confirmation email payload must match the authenticated session's cryptographic identity attribute.
   - For enterprise tenant deletions submitted via email (`privacy@linqchain.com`), multi-factor identity verification of the organization Owner is mandatory.

---

## 2. Technical Execution Workflow

### Step 1: Immediate Account Suspension (T = 0)
- The user account flag `is_active` is set to `False`.
- All active JWT tokens, refresh tokens, and session cookies are revoked across edge routers.
- An immutable compliance audit record is written to `admin_audit_logs` (`COMPLIANCE_GDPR_ERASURE_REQUESTED`).

### Step 2: Identification & Purge (T + 30 Days)
- Following a 30-day statutory grace period:
  - Personal identity fields (`display_name`, `email`, `password_hash`) in `platform_users` or `admin_users` are overwritten with random cryptographic hashes (e.g., `erased_user_a8f9c1@erased.local`).
  - Active personal workspace preferences in `localStorage` and Supabase metadata are wiped.

### Step 3: Statutory Preservation Exceptions (GDPR Art. 17(3)(b))
Certain data cannot be erased under statutory exceptions:
- **SAP S/4HANA PO Executions:** Purchase orders and material receipts executed through the enterprise bridge are retained in compliance with commercial financial reporting and tax audits (7-year statutory retention).
- **Administrative Security Audit Logs:** Append-only security logs are preserved in pseudonymized format to maintain SOC 2 compliance.

---

## 3. Confirmation Notice
Upon request completion, LinqChain dispatches a formal Certificate of Erasure containing the unique reference ID (`DEL-XXXXXXXX`).
