# Gaia Platform — Blueprint Monorepo

> *Gaia. Your whole health, beautifully understood.*

This monorepo implements the **Gaia Master Blueprint** (Volumes 1–8), starting
with Phase 1, Month 1 — "The Seed". The pre-existing `frontend/`, `backend/`,
`supabase/`, and `scraper/` folders are the earlier prototype and are untouched;
all Blueprint work lives in the folders below.

## Structure

| Path | Contents | Blueprint |
| --- | --- | --- |
| `apps/mobile` | React Native (Expo) + TypeScript app: onboarding + five spaces | Vol 3, Vol 6 §4 |
| `apps/web` | React + TypeScript web app | Vol 6 §4.1 |
| `packages/ui` | Design tokens + atomic components (light/dark, WCAG AA) | Vol 4 |
| `packages/shared-types` | TypeScript interfaces for all data models | Vol 5 |
| `services/api` | Node.js/TypeScript modular monolith (hexagonal modules: identity-auth, health-graph, timeline) | Vol 5, Vol 6 §5 |
| `services/ai` | Python FastAPI AI service (orchestrator + safety guardrails + memory) | Vol 7 |
| `infra` | Dockerfiles, docker-compose (dev), Terraform (dev env), Kubernetes manifests | Vol 6 §12 |

## Getting started

```bash
# 1. Install workspaces (Node >= 20)
npm install

# 2. Start PostgreSQL + Redis
docker compose -f infra/docker-compose.dev.yml up -d postgres redis

# 3. Run database migrations
npm run migrate --workspace @gaia/api

# 4. Start the API (http://localhost:4000)
npm run dev --workspace @gaia/api

# 5. Start the AI service (http://localhost:8000)
cd services/ai && pip install -r requirements.txt && uvicorn app.main:app --reload

# 6. Start the mobile app
npm run start --workspace @gaia/mobile

# 7. Start the web app (http://localhost:5173)
npm run dev --workspace @gaia/web
```

## Tests

```bash
npm run test --workspace @gaia/api   # Jest — domain logic (auth, health graph, timeline, event bus)
cd services/ai && pytest             # pytest — safety guards + orchestrator pipeline
```

## Principles enforced in code

- **Modular monolith → microservices** (Vol 6 §5.1): module boundaries mirror
  Vol 5; cross-module communication goes through the in-process event bus whose
  interface matches the future Kafka Event System.
- **Hexagonal architecture** (Vol 6 §5.5): domain ports, application services,
  infrastructure adapters — tests run against in-memory adapters.
- **Clinical safety** (Vol 7 §10): input guard (5 intent classes), static
  emergency escalation, output guard blocking diagnosis language.
- **Design tokens** (Vol 4 §3): every color, size, radius, shadow, and motion
  value in `packages/ui` is copied verbatim from the Blueprint.
- **Trust & privacy** (Vol 1 §7): versioned health records with audit trails,
  consent table from day one, "Download My Data" surfaced in the Me space.
