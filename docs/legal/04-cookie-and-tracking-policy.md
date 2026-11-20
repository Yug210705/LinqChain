# LinqChain Cookie & Tracking Technology Policy

**Effective Date:** November 2, 2026  
**Compliance Mandate:** EU ePrivacy Directive (Directive 2002/58/EC as amended), GDPR Article 7, CCPA Regulations  

---

## 1. Principles of Cookie Consent
In compliance with the ePrivacy Directive and European Data Protection Board (EDPB) Guidelines 05/2020:
1. **Explicit Prior Consent:** Non-essential cookies (analytics, telemetry, marketing) are blocked by default until explicit, affirmative user opt-in is registered.
2. **Granular Preferences:** Users can independently accept or reject distinct categories of cookies without being forced into an all-or-nothing choice.
3. **Global Privacy Control (GPC):** LinqChain automatically respects `navigator.globalPrivacyControl` and `navigator.doNotTrack` browser signals. When active, non-essential cookies are disabled automatically.
4. **Unconditional Withdrawal:** Users can adjust or revoke cookie consent at any time via the "Cookie Preferences" link in the global footer or in the Settings Panel.

---

## 2. Cookie Classification Matrix

| Category | Typical Cookies | Purpose | Lifetime | Default State |
| :--- | :--- | :--- | :--- | :--- |
| **Strictly Necessary** | `linqchain.auth_token`, `sb-access-token`, `csrf_token` | Authenticates mission sessions, maintains JWT cryptographic validation, prevents CSRF attacks. | Session / 30 Days | **Always Active** (Exempt from consent under Art. 5(3)) |
| **Functional** | `linqchain.theme`, `linqchain.currency`, `linqchain_graph_positions` | Stores theme preferences (Dark/Light), selected currency, graph coordinates and viewport state. | 1 Year | **Opt-In / Configurable** |
| **Performance & Analytics** | `ph_posthog_id`, `linqchain.latency_trace` | Aggregated telemetry recording API round-trip latency and client error traces to debug bottlenecks. | 90 Days | **Disabled by Default** (Requires explicit opt-in) |
| **Marketing & Communications** | `linqchain.announcement_viewed` | Manages display frequency for new AI agent release digests and webinar invitations. | 6 Months | **Disabled by Default** (Requires explicit opt-in) |

---

## 3. Storage Key Specifications
- Primary Consent Record: `linqchain.cookie_consent_v1` in browser `localStorage`.
- Record structure includes: `essential: true`, `functional: boolean`, `analytics: boolean`, `marketing: boolean`, `timestamp: ISOString`, `version: "1.0"`.
