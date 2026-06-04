# Quickstart: Flashcard English Learning App

**Feature**: 001-flashcard-english-learning
**Date**: 2026-04-29

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 LTS |
| npm | ≥ 10 |
| PostgreSQL | ≥ 17 |
| Git | any recent |

---

## 1. Clone and install

```bash
git clone <repo-url> flashcard-learning
cd flashcard-learning

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

## 2. Configure environment variables

### Backend — `backend/.env`

```dotenv
DATABASE_URL="postgresql://postgres:password@localhost:5432/flashcard_db"
PORT=3001
CORS_ORIGIN=http://localhost:5173
```
> PostgreSQL 17 is the minimum recommended version. The connection string format is
> unchanged from v15/v16.
### Frontend — `frontend/.env.local`

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

---

## 3. Set up the database

```bash
cd backend

# Create and apply all migrations
npx prisma migrate dev --name init

# Seed pre-loaded categories and decks
npx prisma db seed
```

---

## 4. Run in development

Open two terminal tabs:

```bash
# Terminal 1 — Backend (NestJS)
cd backend
npm run start:dev
# → listening on http://localhost:3001

# Terminal 2 — Frontend (Next.js)
cd frontend
npm run dev
# → http://localhost:3000
```

---

## 5. Run tests

```bash
# Backend unit tests (SM-2 algorithm, services)
cd backend && npm run test

# Backend integration tests
cd backend && npm run test:e2e

# Frontend component & unit tests
cd frontend && npm run test

# Frontend E2E (Playwright)
cd frontend && npm run test:e2e
```

---

## 6. Project structure at-a-glance

```
flashcard-learning/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       ← single source of truth for DB schema
│   │   ├── migrations/         ← auto-generated migration files
│   │   └── seed.ts             ← pre-loaded categories & decks
│   ├── src/
│   │   ├── core/
│   │   │   └── sm2/            ← pure SM-2 scheduling function (unit-tested)
│   │   ├── modules/
│   │   │   ├── categories/
│   │   │   ├── decks/
│   │   │   ├── cards/
│   │   │   ├── sessions/
│   │   │   └── progress/
│   │   ├── prisma/             ← PrismaService (singleton)
│   │   └── main.ts
│   └── test/
│       ├── unit/
│       └── integration/
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           ← root layout (ClientIdProvider, nav)
│   │   ├── page.tsx             ← Home page
│   │   ├── categories/[id]/page.tsx
│   │   ├── decks/[id]/page.tsx
│   │   ├── study/[sessionId]/page.tsx
│   │   ├── my-decks/page.tsx
│   │   └── progress/page.tsx
│   ├── components/
│   │   ├── FlashCard/           ← 'use client'
│   │   ├── GradeBar/            ← 'use client'
│   │   ├── DeckTile/
│   │   ├── CategoryTile/
│   │   └── SessionSummary/
│   ├── services/
│   │   └── api.ts               ← typed API client (Axios + TanStack Query)
│   ├── hooks/
│   └── lib/
│       └── clientId.ts          ← UUID generation / localStorage helper
│   └── test/
│
└── specs/
    └── 001-flashcard-english-learning/
```

---

## 7. Key development decisions

| Decision | Detail |
|----------|--------|
| Anonymous identity | UUID stored in `localStorage`, injected via `ClientIdProvider` → sent as `X-Client-ID` header |
| Scheduling | SM-2 runs in NestJS `Sm2Service` (pure function, no side effects) |
| Pre-loaded decks | `isPreloaded = true` → write operations return `403 Forbidden` |
| Grade buttons | Fixed bottom bar on mobile; inline on `md:` and above |
| CEFR level | Displayed after ≥ 20 reviews; based on weighted accuracy score |
