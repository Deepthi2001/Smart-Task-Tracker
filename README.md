# Smart Task Tracker — Barebones Scaffold (Next.js + FastAPI)

**4-hour** take-home scaffold. Plumbing only, you implement features.

- **Frontend:** Next.js (TypeScript) — minimal page; no business logic
- **Backend:** FastAPI — routes exist but return **501 Not Implemented**
- **DB:** Not wired (use SQLite or in-memory as you prefer)
- **AI:** `/api/ai/intake` exists but returns 501 (you implement a FAKE adapter)

## Quickstart
```bash
cp .env.example .env   # optional
docker compose up --build

# Web: http://localhost:3000
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

## Extras
```bash
./scripts/test.sh   # run backend tests (once implemented)
./scripts/clean.sh  # stop & clean
```