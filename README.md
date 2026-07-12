# Gaia Health — Holistic Wellness Platform

**Repository:** `git@github.com:MOMOEXPRESS/GAIA.git`

**Gaia Core** is a zero-cost holistic health companion for symptom journaling, natural protocol generation, price comparison, and practitioner collaboration.

> This platform provides **educational and supportive natural wellness information**. It does not diagnose, treat, or prescribe. Always consult a licensed healthcare provider. In emergencies, call your local emergency number immediately.

## Architecture

```
gaia-health/
├── frontend/     Next.js 15 + Tailwind (Vercel)
├── backend/      FastAPI + rule-based knowledge engine (Oracle VM / Render)
├── scraper/      Price hunting workers (Oracle VM)
├── ollama/       Self-hosted LLM (optional, Oracle VM)
├── supabase/     PostgreSQL migrations + RLS
└── docker-compose.yml
```

## Week 1 Status (July 12, 2026)

- [x] Monorepo scaffolded
- [x] Landing page, dashboard, symptom journal, onboarding, doctor portal
- [x] Mandatory medical disclaimer (banner + cards)
- [x] FastAPI backend with symptoms, protocols, safety, shopping stubs
- [x] 20-pattern knowledge base JSON
- [x] Emergency red-flag detector
- [x] Supabase SQL schema with RLS
- [x] Docker Compose for Oracle VM deployment
- [ ] Supabase Auth wired (next step)
- [ ] MongoDB symptom persistence (next step)
- [ ] Production deploy to Vercel + Oracle VM

## Quick Start (Local)

### Prerequisites

- Node.js 22+
- Python 3.10+
- (Optional) Docker for full stack

### Backend

```powershell
cd c:\Users\ebale\Gaia\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```powershell
cd c:\Users\ebale\Gaia\frontend
copy .env.local.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

### Full Stack (Docker — Oracle VM or local)

```bash
docker compose up -d
```

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/symptoms` | Create symptom entry |
| POST | `/api/v1/protocols/generate` | Generate natural protocol |
| POST | `/api/v1/safety/check` | Red-flag detection |
| POST | `/api/v1/shopping/search` | Price comparison (mock) |

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Copy URL and anon key to `frontend/.env.local`
4. Copy service role key to backend `.env`

## Deployment (Zero Cost)

| Service | Platform | Purpose |
|---------|----------|---------|
| Frontend | Vercel (free) | Next.js app |
| API + Scraper + Ollama | Oracle Cloud Always Free VM | Backend, scraping, LLM |
| PostgreSQL | Supabase (free 500MB) | Structured data |
| MongoDB | Atlas (free 512MB) | Symptom logs |
| Files | Supabase Storage / Cloudinary | Images, voice |

Keep the Oracle VM alive with [UptimeRobot](https://uptimerobot.com) (free).

## Sprint Roadmap

| Week | Dates | Focus |
|------|-------|-------|
| 1 | Jul 12–18 | Core setup, auth, DB schema |
| 2 | Jul 19–25 | Health questionnaire, symptom journal API |
| 3 | Jul 26–Aug 1 | Knowledge engine, protocol display |
| 4 | Aug 2–8 | Red flags, image upload, PDF export |
| 5 | Aug 9–15 | Price hunting scraper |
| 6 | Aug 16–22 | Doctor portal, messaging |
| 7 | Aug 23–29 | Testing, PWA, monitoring |
| 8 | Aug 30–Sep 5 | Launch |

## License

Private project — all rights reserved.
