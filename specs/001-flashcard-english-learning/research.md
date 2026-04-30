# Research: Flashcard English Learning App

**Feature**: 001-flashcard-english-learning
**Date**: 2026-04-29
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## 0. Tech Stack Versions (stable as of 2026-04-29)

| Layer | Package | Stable version used |
|-------|---------|--------------------|
| Backend framework | NestJS | **v11** (v11.1.x) |
| Frontend framework | Next.js | **v15** (v15.1.x, App Router) |
| UI library | React | **v19** (v19.1 / v19.2) |
| ORM | Prisma | **v6** (v6.19.x) |
| Server-state | TanStack Query | **v5** (v5.90.x) |
| CSS | Tailwind CSS | **v4** (v4.1) |
| Database | PostgreSQL | **v17** |
| Language | TypeScript | **5.x** |
| Runtime | Node.js | **≥ 20 LTS** |

> Sources verified via Context7 on 2026-04-29. Next.js 16 and Prisma 7 exist as early
> releases but are not yet at stable GA — v15 and v6 are the current stable picks.

**Tailwind CSS v4 note**: v4 replaces the `tailwind.config.js` file with a CSS-first
configuration (`@import "tailwindcss"` in your main CSS file). The `@tailwindcss/postcss`
or `@tailwindcss/vite` plugin replaces `tailwindcss` as a PostCSS plugin. Next.js 15
supports Tailwind v4 via `@tailwindcss/postcss`.

**React 19 + Next.js 15 note**: Next.js 15 ships with React 19 as the default.
Server Actions and `use()` hook are stable. The `async` cookies/headers APIs from
Next.js 15 must be awaited (breaking change from Next.js 14).

**NestJS 11 note**: Drops support for Node.js < 20; requires
`@nestjs/platform-express` v11. No breaking API changes relevant to this feature.

**Prisma 6 note**: Default query engine is now `prisma-client-js` without the separate
binary engine; uses the new lightweight JS engine. Migration commands unchanged.

---

## 1. Project Structure

**Decision**: Monorepo with two top-level projects — `backend/` (NestJS) and `frontend/` (Next.js).

**Rationale**:
- Separate `backend/` and `frontend/` mirrors standard full-stack convention and keeps deployment pipelines independent.
- A true monorepo tool (Turborepo, Nx) is **not** added — Principle V (YAGNI); a root `package.json` with simple `npm run dev` scripts suffices for this scope.
- Shared types (DTOs, enums) are inlined in `backend/src/contracts/` and imported from the frontend via a generated OpenAPI client or hand-maintained type file — avoiding a third `packages/` project.

**Alternatives considered**:
- Single NestJS project serving static React build — rejected because it complicates local dev workflow and hot-reload setup.
- Full Nx/Turborepo — rejected as over-engineering for a two-project scope (Principle V).

---

## 2. SM-2 Spaced Repetition Algorithm

**Decision**: Implement the original SM-2 algorithm as a pure, side-effect-free TypeScript function in `backend/src/core/sm2/sm2.service.ts`.

**Algorithm rules** (SM-2):

| Grade input | SM-2 numeric | Behaviour |
|-------------|-------------|-----------|
| Again       | 0           | Reset repetitions → 0; interval → 1 day; EF unchanged |
| Hard        | 3           | EF adjusted; interval scales slowly |
| Good        | 4           | EF adjusted; standard interval growth |
| Easy        | 5           | EF adjusted upward; larger interval jump |

**Interval calculation**:
```
if grade < 3 (Again/Hard below threshold):
  repetitions = 0
  interval = 1
else:
  if repetitions == 0: interval = 1
  elif repetitions == 1: interval = 6
  else: interval = round(prev_interval × EF)
  repetitions += 1

EF = EF + 0.1 − (5 − grade) × (0.08 + (5 − grade) × 0.02)
EF = max(1.3, EF)          # floor to prevent interval collapse
```

> "Again" cards assigned grade 0 will reset and, per SM-2, not reappear in the
> same session. Edge-case handling: cards graded Again are re-queued at end of
> session (same-day reappearance) — this is implemented in `SessionService`, not in
> the pure SM-2 function, to preserve algorithm purity (Principle I).

**Mastered threshold**: A card is marked `isMastered = true` when `repetitions ≥ 4` and `grade ≥ Good (4)` in the most recent review.

**Rationale**: SM-2 is a well-documented, field-proven algorithm. Implementing it as a pure function makes it trivially unit-testable (Principle IV) and isolates all scheduling concerns from persistence (Principle I).

**Alternatives considered**:
- FSRS (Free Spaced Repetition Scheduler, 2022) — more accurate but complex; out of scope for MVP (Principle V). Can be swapped in later since the function is isolated.
- Anki's modified SM-2 — uses a learning/review/relearn phase state machine; added complexity not justified by current user stories.

---

## 3. Anonymous User Identification (No-Auth Scope)

**Decision**: Generate a UUID v4 `clientId` on first app load, persist it in `localStorage`, and send it as a custom HTTP header `X-Client-ID` on every API request. The backend reads this header and scopes all queries to that `clientId`.

**Rationale**:
- The spec explicitly excludes authentication for this version.
- Constitution Principle II requires data isolation. Using a `clientId` header provides
  functional data scoping without implementing a full auth system.
- This approach is **designed to be replaceable**: when auth is added, `clientId` is
  replaced by `userId` from the JWT payload — no schema changes needed beyond renaming
  the column.

**Security note**: A `clientId` in localStorage is not a security boundary — any
script on the page can read it. This is acceptable because there is no authentication
required and no sensitive personal data is stored. When auth is added, this mechanism
must be replaced.

**Alternatives considered**:
- No scoping at all (global shared data) — rejected; violates Principle II and makes
  adding auth later destructive.
- Cookie-based session — adds server-side session state; over-engineering for this
  scope.

---

## 4. Frontend State Management

**Decision**: React Context + `useReducer` for local UI state (current session, card
flip state) in Client Components. TanStack Query (React Query) for client-side server
state in Client Components. Next.js Server Components fetch data directly for
read-only pages (Home, Category, Deck overview, Progress).

**Rationale**:
- Server Components eliminate TanStack Query boilerplate for non-interactive pages —
  data is fetched at render time on the server, streamed to the client.
- TanStack Query is still used in Client Components where real-time reactivity
  matters (due-count refresh after a session completes).
- `X-Client-ID` header is read from `localStorage` inside a Client Component wrapper
  (`ClientIdProvider`) and added to all Axios requests.
- Avoids Redux/Zustand for a project of this scope (Principle V).

**Alternatives considered**:
- Zustand — valid, but Server Components + TanStack Query already cover both cases.
- Redux Toolkit — over-engineering for this scope.

---

## 5. CEFR Level Estimation

**Decision**: Calculate using a weighted accuracy score across all `CardReview` records
for a `clientId`, with reviews from the last 30 days weighted 2× vs. older reviews.
Minimum 20 reviews required before a level is displayed.

**Mapping** (per constitution assumption; adjustable in `progress.service.ts`):

| Accuracy   | CEFR Level |
|------------|------------|
| < 40 %     | A1         |
| 40–54 %    | A2         |
| 55–64 %    | B1         |
| 65–74 %    | B2         |
| 75–84 %    | C1         |
| ≥ 85 %     | C2         |

A "correct" review is any grade of `GOOD` or `EASY`. `AGAIN` and `HARD` count as incorrect.

**Rationale**: Simple, deterministic, fully testable. Recency weighting gives more
meaningful feedback for active learners.

**Alternatives considered**:
- IRT (Item Response Theory) — requires calibrated item difficulty parameters; not
  available for user-created cards.
- Vocabulary level tagging (CEFR per word) — requires a curated word list; viable only
  for pre-loaded decks and adds significant data-preparation scope (deferred to v2).

---

## 6. Frontend Framework & Responsive / Mobile-First CSS Strategy

**Decision**: Next.js **15** (App Router, React **19**) as the frontend framework.
Tailwind CSS **v4** for all styling (mobile-first). Grade buttons use a fixed bottom
bar on mobile viewports.

**Next.js 15 rationale**:
- App Router fully stable with React 19 Server Components and Server Actions.
- `async` cookies/headers APIs are now stable (required in Next.js 15).
- Built-in routing removes the need for React Router (Principle V — fewer deps).
- `"use client"` directive clearly delineates interactive components (FlashCard, GradeBar,
  session state), keeping the majority of pages as server components.
- `next dev` (Turbopack, now default) and `next build` are the single dev/build commands.

**Tailwind CSS v4 rationale**:
- CSS-first config (`@import "tailwindcss"`) — no `tailwind.config.js` required.
- Integrated with Next.js via `@tailwindcss/postcss` plugin.
- Automatic content detection (no `content: []` array needed).
- All v3 utilities still available; mobile-first breakpoints unchanged.

**Tailwind rationale**:
- Tailwind enforces mobile-first by default (all utilities apply at `sm:0px` and scale
  up with breakpoint prefixes).
- No additional component library needed for MVP; Tailwind headless components
  (HeadlessUI) can be added later if needed.
- Touch targets trivially enforced with `min-h-[44px] min-w-[44px]` utilities.

**Breakpoints used**:

| Breakpoint | Width       | Layout |
|------------|-------------|--------|
| (default)  | < 768 px    | Single column, bottom-fixed grade bar |
| `md:`      | 768–1023 px | Two-column deck grid, inline grade bar |
| `lg:`      | ≥ 1024 px   | Three-column deck grid, sidebar nav |

**Alternatives considered**:
- Chakra UI / MUI — more opinionated, larger bundle; over-engineering for cards and lists.
- Plain CSS modules — valid, but slower to iterate on responsive layouts.

---

## 7. Database: PostgreSQL + Prisma

**Decision**: PostgreSQL as the database engine, accessed via Prisma ORM in the NestJS backend.

**Rationale**:
- Constitution mandates PostgreSQL for relational user-scoped data isolation.
- Prisma provides type-safe queries, auto-generated migrations, and a clear schema
  definition file — reducing boilerplate and making the schema the single source of truth.
- `PrismaService` is injected via NestJS DI, enabling easy mocking in tests.

**Migration strategy**:
- All changes via `prisma migrate dev` (development) / `prisma migrate deploy` (CI/production).
- Every migration is reversible (constitution requirement).

**Alternatives considered**:
- TypeORM — more complex configuration; Prisma's explicit schema file is cleaner for
  this team.
- SQLite — simpler setup, but PostgreSQL is required by constitution and better suited
  for production deployment.
