# LinqChain Open Source License Compliance Audit

**Audit Date:** November 2, 2026  
**Auditor:** LinqChain Architecture & Open Source Governance Review  
**Audit Objective:** Verify that zero viral copyleft dependencies exist and confirm compliance with third-party software attribution notices.  

---

## 1. Compliance Executive Summary
- **Total Production Dependencies Analyzed:** 32 (Frontend Next.js & Backend FastAPI stacks).
- **Copyleft (GPL / AGPL / LGPL) Detected:** **0 (Zero)**.
- **Permissive Commercial Licenses (MIT, Apache 2.0, BSD-3-Clause, ISC):** **100%**.
- **Commercial Risk Assessment:** **LOW / COMPLIANT**. LinqChain is fully cleared for proprietary SaaS distribution and enterprise customer deployment without obligation to disclose proprietary source code.

---

## 2. Dependency License Matrix

| Package Name | Ecosystem | Version | License | Copyleft Risk | Commercial Permissibility |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `next` | Node.js | 16.3.4 | MIT | None | Commercial SaaS Permitted |
| `react` & `react-dom` | Node.js | 19.2.8 | MIT | None | Commercial SaaS Permitted |
| `fastapi` | Python | 0.115+ | MIT | None | Commercial SaaS Permitted |
| `pydantic` | Python | 2.x | MIT | None | Commercial SaaS Permitted |
| `sqlalchemy` | Python | 2.x | MIT | None | Commercial SaaS Permitted |
| `uvicorn` | Python | 0.30+ | BSD-3-Clause | None | Commercial SaaS Permitted |
| `tailwindcss` | Node.js | 4.x | MIT | None | Commercial SaaS Permitted |
| `@xyflow/react` | Node.js | 12.11.5 | MIT | None | Commercial SaaS Permitted |
| `recharts` | Node.js | 3.10.1 | MIT | None | Commercial SaaS Permitted |
| `lucide-react` | Node.js | 1.38.0 | ISC / MIT | None | Commercial SaaS Permitted |
| `framer-motion` | Node.js | 13.1.1 | MIT | None | Commercial SaaS Permitted |
| `zustand` | Node.js | 5.0.15 | MIT | None | Commercial SaaS Permitted |
| `@tanstack/react-query`| Node.js | 5.102.8 | MIT | None | Commercial SaaS Permitted |
| `axios` | Node.js | 1.20.0 | MIT | None | Commercial SaaS Permitted |
| `jspdf` & `autotable` | Node.js | 4.2.1 | MIT | None | Commercial SaaS Permitted |

---

## 3. Public Attribution Notice
A machine-readable and user-accessible attribution table is published publicly on the platform at `https://linqchain.com/licenses` in compliance with MIT/BSD copyright notice requirements.
