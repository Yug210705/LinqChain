# LinqChain — Supply Chain Resilience Platform

**Predict, simulate, and recover from supply-chain disruptions in real time — backed by SAP HANA.**

LinqChain is a full-stack supply-chain resilience & risk-management platform built for
operations war rooms. It ingests a complete supply-chain topology (suppliers · materials ·
plants · inventory · orders · ports · shipping routes), lets you **simulate disruptions**, watch
the impact cascade through the network on a **live interactive graph**, generates **deterministic,
guard-railed recovery plans**, drives them through **risk audit → approval → SAP execution**, and
keeps a **full audit trail** of every action — all from a single unified backend.

The platform is built as a clean, single-backend app that treats **SAP HANA Cloud as the single
source of truth** for master data, disruptions, recovery plans, and scenarios. Every data view in
the UI is backend-truthful — nothing is faked client-side.

---

## The Problem

| Pain point | How LinqChain answers it |
|---|---|
| Disruptions are discovered too late | Real-time SAP event stream (SSE) + one-click **disruption simulation** across the live topology |
| Impact is hard to quantify | Deterministic cascade: affected suppliers, materials, orders, plant loss, revenue-at-risk, inventory runway |
| Recovery is ad-hoc | **Optimizer ranks recovery options** by cost, delay, risk & SLA exposure; 6-step pipeline validates every number |
| AI can hallucinate numbers | **Agentic reflection + zero-tolerance guardrails** strip hallucinated figures; deterministic fallback otherwise |
| No accountability | **Immutable audit trail** per pipeline run + a unified **Action History** timeline of every simulation & action |
| Approval/execution is paperwork | Risk audit → approval queue → **SAP BAPI execution** with a printable transaction receipt |

---

## Features

### 🌐 Command Center & Live Topology
- KPI strip (backend-driven): $ revenue at risk, affected suppliers, SLA exposure, recovery status
- **Live supply-chain network graph** (React Flow) — 157 nodes / 262 edges from HANA, status dots
  (ACTIVE / AT RISK / DISRUPTED / INACTIVE), drag & pan, minimap, legend
- Disruption **auto-rewiring**: disrupted nodes pulse red, broken edges dash, healthy alternatives
  re-route in green; executing a recovery marks the replaced node INACTIVE and wires the new supplier

### ⚡ Disruption Lifecycle
- Simulate (single / multi / chaos) → persisted → Active & History work queues
- Detail page with tabs: Impact Overview · Dependency Graph · Affected Entities · Inventory ·
  Production · Orders · Financial Impact · Explanations
- Resolve, reset; **auto-resolve when the recovery pipeline completes**

### 🧠 Recovery, Scenarios & Risk
- **Recovery options** ranked deterministically from SAP supply data (real supplier IDs)
- **Scenarios** (multi-vendor strategies) generated per disruption
- **Risk & Audit queue** (PENDING_AUDIT) → **Approvals** (PENDING_APPROVAL / APPROVED) —
  a proper state machine: `PENDING_AUDIT → PENDING_APPROVAL → APPROVED → COMPLETED`
- Status transitions are **idempotent** — re-applying the current status is a safe no-op

### 🧾 SAP Execution & Audit
- Execute approved plans → **BAPI_PO_CREATE1 transaction receipt** (posting, line items,
  supplier re-route, totals, 6-step pipeline stepper, print)
- **Action History** page: unified timeline of simulations, resolutions & pipeline runs
- `logs/<run_id>.json` audit trails per pipeline execution (newest first via `/api/audit/runs`)

### ⚙️ Extras
- Dark theme everywhere · currency picker (INR/USD/EUR/GBP) · settings · help center ·
  notifications bell · printable receipts

---

## Architecture — one backend, one command

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 (Turbopack) · :3000                     │
│   Command Center · Graph · Disruptions · Recovery · Scenarios · Risk      │
│         Approvals · SAP Actions · Action History · Settings               │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ REST + SSE  →  http://localhost:8000
┌───────────────────────────────▼──────────────────────────────────────────┐
│                     backend/  —  UNIFIED FastAPI app :8000                │
│    uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload             │
│                                                                           │
│   app/api/impact.py     topology graph · vulnerabilities · disruptions    │
│   app/api/recovery.py   options · plans · scenarios · audit · pipeline    │
│   app/api/events.py     SSE event stream (SAP_BAPI_EVENT)                 │
│   app/api/webhooks.py   inbound webhooks                                  │
│   app/services/         impact simulator · orchestrator (6-step)          │
│   app/adapters/         SAP adapter (mock ↔ real OData)                   │
│   app/core/             database · env · caches · guardrails              │
└───────────────┬───────────────────────────────────────┬───────────────────┘
                │ SAP_HANA_URL (backend/.env)            │ RESILIENCE_SQLITE=1
                ▼                                        ▼
   ┌────────────────────────┐              ┌─────────────────────────────┐
   │   SAP HANA Cloud       │              │  sqlite (offline dev only)  │
   │   single source of     │              │  backend/data/resilience.db │
   │   truth (306+ rows)    │              └─────────────────────────────┘
   └────────────────────────┘
```

| Piece | What it is |
|---|---|
| `frontend/` | Next.js 16 App Router UI (REST + SSE client) on :3000 |
| `backend/` | **One** FastAPI package — impact engine + AI/SAP service, one process, one API on :8000 |
| `backend/app/main.py` | Entrypoint: CORS, routers, schema bootstrap, pool warm-up, graph pre-warm |
| `backend/data/resilience.db` | Offline sqlite (dev fallback only; not the source of truth) |
| `backend/logs/` | Pipeline audit trails (`run_*.json`) — drives Action History |
| `sap-cap-backend/` | Companion SAP CAP (CDS) project mirroring the BAPI layer |
| `docs/` | Original architecture & integration guides (SAP boundary, AI data contract…) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · Turbopack |
| Graphs | React Flow (`@xyflow/react`) |
| Charts | Recharts |
| State | Zustand (`useSimulationStore`, `useAppStore`) |
| Backend | Python 3.14 · **FastAPI** · SQLAlchemy 2 · Pydantic v2 · Uvicorn (single app) |
| Graph theory | NetworkX |
| Database | SAP HANA Cloud (`hana://…hanacloud.ondemand.com`) via `sqlalchemy-hana` + `hdbcli` |
| Fallback DB | SQLite (dev / offline, `data/resilience.db`) |
| AI / LLM | OpenRouter API (optional — `google/gemma-4-31b-it:free`), deterministic fallback |
| Streaming | Server-Sent Events (`/api/sap/events/stream`) + WebSocket (`/ws/disruptions/stream`) |

---

## Repository Structure

```
Resiliense-OS/
├── frontend/
│   └── src/
│       ├── app/                # command-center · disruptions/[id] · recovery-plans ·
│       │                       # recovery/[id] · scenarios · risk/[id] · approvals/[id] ·
│       │                       # supply-chain · sap-actions · action-history · settings · help
│       ├── components/         # graph, disruption tabs, command-center widgets, providers
│       ├── services/api.ts     # typed REST client (points at :8000)
│       ├── stores/             # Zustand stores
│       └── lib/utils.ts        # currency/format helpers
├── backend/                    # ← single backend
│   ├── app/
│   │   ├── main.py             # unified entrypoint → uvicorn app.main:app :8000
│   │   ├── api/                # impact (topology/disruptions) · recovery (plans/scenarios/audit)
│   │   │                       # · events (SSE) · webhooks
│   │   ├── services/           # impact_service (simulator) · orchestrator (6-step pipeline)
│   │   │                       # · recovery_engine/
│   │   ├── adapters/           # sap_adapter (MockSAPAdapter / RealSAPAdapter)
│   │   ├── core/               # config (env) · database · runtime (caches/mirror/pre-warm) · guardrails
│   │   ├── graph/              # topology → NetworkX builder
│   │   ├── models/             # master data + disruptions + workflow (recovery_plans/scenarios)
│   │   ├── schemas/            # pydantic request/response contracts
│   │   └── seed/               # master-data seeder
│   ├── scripts/                # seed_risk_data.py
│   ├── tests/                  # pytest suite (graph, determinism) + conftest
│   ├── data/                   # offline sqlite (gitignored)
│   ├── logs/                   # audit trails (gitignored)
│   ├── requirements.txt
│   └── .env                    # SAP_HANA_URL + optional LLM/API keys (gitignored)
├── docs/                       # ai-data-contract · domain-model · sap-* integration guides
├── sap-cap-backend/            # SAP CAP (CDS) companion project
├── start_demo.bat / .sh        # one-shot launcher (backend + frontend)
└── README.md
```

---

## Data Model

**Master topology (HANA, seeded):** `SUPPLIERS · MATERIALS · PLANTS · PRODUCTS ·
PRODUCT_MATERIALS · INVENTORY · ORDERS · PORTS · TRANSPORT_ROUTES · SUPPLIER_MATERIALS`

**Operational tables:**
| Table | Purpose |
|---|---|
| `DISRUPTIONS` | Persisted simulation runs (active + history), JSON snapshot payload |
| `RECOVERY_PLANS` | Plan state machine records (PENDING_AUDIT → … → COMPLETED) |
| `SCENARIOS` | Multi-vendor scenario records (READY / SIMULATING / SELECTED) |
| `RES_*` (RES_RECOVERY_PLANS, RES_SCENARIOS, RES_AUDIT_RECORDS) | HANA-cloud schema mirrors written live by the bridge |
| `logs/<run_id>.json` | Per-pipeline audit trails (Action History data source) |

**IDs are consistent everywhere:** `SUP-001…`, `MAT-001…`, `SIM-…`, `RP-…`, `SCN-…` are shared
across the graph, disruptions, recovery options, and scenarios.

---

## Getting Started

### 1. Prerequisites
- Node 20+ (Next.js 16)
- Python 3.14 (virtualenv at `backend/venv`)
- Access to a **SAP HANA Cloud** instance (recommended) — otherwise the app runs on sqlite

### 2. Environment
Copy and fill credentials in **`backend/.env`** (the single source of env for the backend):

```env
SAP_HANA_URL=hana://USER:PASSWORD@…hna0.prod-us10.hanacloud.ondemand.com:443
OPENROUTER_API_KEY=sk-or-…            # optional — deterministic fallback without it
SAP_S4_BASE_URL=…                     # optional — real S/4HANA OData
SAP_API_KEY=…                         # optional — sandbox API key
```

### 3. Install dependencies

```bash
cd backend
./venv/Scripts/pip install -r requirements.txt
cd ../frontend
npm install
```

### 4. Prepare HANA (first run only)

```bash
# Schema + tables bootstrap automatically on server start (create_all).
# To seed the Risk & Audit / Approvals queues (+ mirror the cloud RES_* tables):
cd backend
./venv/Scripts/python.exe scripts/seed_risk_data.py
```

### 5. Run — ONE command for the backend

```bash
start_demo.bat     # Windows (starts backend :8000 + frontend :3000)  — or
./start_demo.sh    # macOS / Linux
```

…or manually — a **single terminal, single command**:

```bash
cd backend
./venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

plus the frontend:

```bash
cd frontend
npm run dev
```

Open **http://localhost:3000**. API docs: **http://localhost:8000/docs** (one unified API).

> **Offline / dev mode:** if your HANA Cloud instance is stopped, hibernated, or unreachable
> (free-tier instances sleep when idle), launch with `RESILIENCE_SQLITE=1` — the backend skips
> the cloud credentials and uses `backend/data/resilience.db` (queues come pre-seeded via the
> seed script). The app returns to HANA automatically once the variable is removed and the
> instance is back up.

---

## API Overview (single :8000 API)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/supply-chain/graph` | Full topology (cached 300s, pre-warmed at boot) |
| GET | `/api/supply-chain/vulnerabilities` | NetworkX bottleneck (centrality) analysis |
| GET | `/api/supply-chain/geojson` | GeoJSON feature collection for 3D globe |
| POST | `/api/disruptions/simulate` | Run a disruption simulation (persisted) |
| GET | `/api/disruptions` | Active + history lists (cached, invalidated on writes) |
| GET | `/api/disruptions/{sim_id}` | Full snapshot payload |
| POST | `/api/disruptions/{sim_id}/resolve` · `/api/disruptions/reset` | Lifecycle |
| POST | `/api/war-room/simulate-multi` · `/api/war-room/chaos-monkey` | War-room (multi + chaos) |
| GET | `/api/recovery/options?material_id=MAT-004` | Ranked deterministic recovery options |
| POST | `/api/recovery/plans` | Create plan (mirrors to RES_RECOVERY_PLANS) |
| GET | `/api/recovery/plans?status=…` | List plans + KPIs (cached 10s) |
| PUT | `/api/recovery/plans/{id}/status` | State-machine transition (idempotent; mirrors to RES_AUDIT_RECORDS) |
| POST | `/run-recovery?material_id=…` | 6-step pipeline → audit trail |
| GET | `/api/audit/runs` | List pipeline audit runs (Action History) |
| POST | `/api/scenarios/generate` · GET/PUT `/api/scenarios…` | Scenario batch + status |
| GET | `/api/sap/events/stream` | SSE event stream (SAP_BAPI_EVENT) |
| WS | `/ws/disruptions/stream` | WebSocket disruption simulation stream |

---

## Key Flows

**Disruption lifecycle**
1. `POST /api/disruptions/simulate` with `{disruption_type: 'supplier'|'material'|'plant'|'port'|'transport_route',
   affected_entity_id: 'SUP-007', severity: 0–1, duration_days}` → persisted, appears in Active
2. Drill into `/disruptions/{sim_id}` → impact tabs + dependency graph
3. Generate recovery plan → approve → execute → **disruption auto-resolves**
4. `/api/disruptions/reset` wipes all simulation runs

**Plan state machine (idempotent)**
```
PENDING_AUDIT → PENDING_APPROVAL → APPROVED → COMPLETED
      └── REJECTED at any pre-COMPLETED step
```
Re-applying the current status returns success without a side effect — no more
“Failed to update status” false alarms on double-clicks or stale UI state.

**SAP execution receipt**
Completing an approved plan invokes `execute_sap_action` (`BAPI_PO_CREATE1`) and broadcasts
`SAP_BAPI_EVENT`. `/sap-actions` renders a printable transaction receipt (PO number, line items,
supplier re-route, totals, pipeline stepper).

---

## HANA Integration Notes

- **Single source of truth**: `backend/.env` → `SAP_HANA_URL`. SQLite (`data/resilience.db`) is a
  dev-only fallback.
- **Schema gotchas** (learned the hard way):
  - HANA requires `SELECT 1 FROM DUMMY` (not `SELECT 1`) — the startup warm-up handles this.
  - `String()` without an explicit length maps to `NVARCHAR(1)` on HANA — models use explicit lengths.
  - The cloud `RES_*` tables have tight columns (`ACTION_TYPE ≤ 22`, `STATUS ≤ 11/9`) — the mirror
    bridge maps workflow statuses accordingly (`PENDING_AUDIT → REVIEW`, …).
- **RES bridge**: every plan / status / pipeline / scenario write is mirrored into
  `RES_RECOVERY_PLANS · RES_SCENARIOS · RES_AUDIT_RECORDS`, so the SAP HANA side always has data.

---

## Performance & Caching

- Supply-chain graph is **pre-warmed at boot** and cached in-process (300s TTL) —
  `/api/supply-chain/graph` drops from ~30s (11 sequential HANA round-trips) to **<10ms**.
- Disruption list and plans/scenarios list endpoints are TTL-cached and invalidated on writes.
- Mock SAP latency is ~200ms per call (recovery options ~5ms).
- LLM (OpenRouter) is optional and **fast-fails**: without a key the pipeline uses the
  deterministic path with zero LLM calls; with a key, single attempt + 6s timeout.
- Run tests: `cd backend && ./venv/Scripts/python.exe -m pytest tests -q`

---

## Docs

The `docs/` folder contains the original architecture & integration guides:
`ai-data-contract.md` · `ai-integration-guide.md` · `domain-model.md` ·
`sap-data-boundary.md` · `sap-integration-guide.md`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `SAP Event Mesh stream unavailable` (console) | Expected — SSE endpoint reconnects with backoff |
| Slow first request right after restart | HANA connect/TLS (~5s) on the first query; everything after is cached/instant |
| HANA unreachable — `Socket closed by peer` at boot | Instance stopped/hibernated or IP dropped from allowlist; start it in SAP BTP, or run with `RESILIENCE_SQLITE=1` for offline demo |
| Stale code served despite `--reload` | `Get-Process python \| Stop-Process -Force`, then relaunch via the single command |
| `NVARCHAR(1)` SQL errors | Schema was created before explicit lengths — rebuild the HANA tables |
| Risk & Audit / Approvals empty | `cd backend && venv/Scripts/python.exe scripts/seed_risk_data.py` |
| No audit in Action History | Run a recovery pipeline (`POST /run-recovery`); trails persist to `backend/logs/*.json` |

---

## Roadmap / Known Limits

- `RealSAPAdapter` is scaffolded (OData + CSRF token) but the default is the mock adapter —
  wire `SAP_S4_BASE_URL` + `SAP_API_KEY` to go live.
- Event Mesh is simulated via SSE broadcast; connect a real BTP Event Mesh topic for production.
- The SAP CAP companion (`sap-cap-backend/`) is not yet wired into the runtime.
- Auth/RBAC are not implemented (hackathon scope).

---

© 2026 LinqChain — reference implementation. All rights reserved.