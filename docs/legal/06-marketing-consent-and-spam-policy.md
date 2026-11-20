# LinqChain Marketing Consent & Anti-Spam Policy

**Compliance Standards:** CAN-SPAM Act (USA), Canada's Anti-Spam Legislation (CASL), EU ePrivacy Directive (Directive 2002/58/EC), GDPR Articles 6 & 7  

---

## 1. Principles of Commercial Electronic Messaging
LinqChain strictly adheres to zero-spam principles across all email, SMS, and webhook notification channels:
1. **Prior Express Consent:** Marketing digests, product release announcements, and promotional webinar invitations are sent **only** to individuals who have given verifiable, prior express opt-in consent.
2. **Double Opt-In Architecture:** Subscription to non-operational email lists requires secondary confirmation verification before being added to active dispatches.
3. **Operational vs Marketing Differentiation:**
   - **Operational Notices (Non-Marketing):** P1 incident alerts, password reset links, spend authorization sign-off requests, and billing invoices. Sent under contractual necessity (Art. 6(1)(b)).
   - **Marketing Notices:** AI engine releases, customer case studies, industry trend whitepapers. Sent strictly under Consent (Art. 6(1)(a)).
4. **Immediate 1-Click Unsubscribe:** Every promotional communication includes an unambiguous, functional unsubscribe link honoring opt-out requests within 24 hours.

---

## 2. In-App Consent Management
Users can inspect, toggle, or revoke communication preferences at any time:
- In the platform: **Settings → Privacy & GDPR Compliance → Communication & Marketing Preferences**.
- Toggles available:
  - Critical Security Advisories & Incident Klaxons
  - Product Releases & AI Engine Updates
  - Weekly Disruption Intelligence Briefing
- Via API: `PUT /api/v1/compliance/consents` updates records and creates an audit trail.

---

## 3. Sender Identification
All electronic communications sent by LinqChain explicitly identify:
- Legal Entity: LinqChain Technologies Inc.
- Physical Postal Address: Enterprise Compliance Division
- Reply-to and Contact Address: `compliance@linqchain.com`
