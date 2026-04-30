# Implementation Plan: Flashcard English Learning App

**Branch**: `001-flashcard-english-learning` | **Date**: 2026-04-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-flashcard-english-learning/spec.md`

## Summary

Build a responsive web application for learning English vocabulary via spaced repetition
flashcards. Users browse pre-loaded category decks (Travel, Business, etc.) or create
personal decks, study in sessions, and grade their recall with Again / Hard / Good / Easy.
The SM-2 algorithm schedules future review dates automatically. A Progress page displays
per-category accuracy and a CEFR level estimate (A1–C2) after 20+ reviews. No
authentication is required — all data is scoped by an anonymous `clientId` (UUID stored
in `localStorage`).

**Tech stack**: NestJS (TypeScript) + Next.js 15 (App Router, TypeScript) + PostgreSQL via Prisma.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js ≥ 20 LTS backend; Node.js ≥ 20 LTS frontend SSR)
**Primary Dependencies**: NestJS 11, Next.js 15 (App Router), React 19, Prisma 6, TanStack Query 5, Tailwind CSS 4
**Storage**: PostgreSQL 17 accessed via Prisma ORM
**Testing**: Jest + Supertest (backend unit + integration), Jest + React Testing Library (frontend), Playwright (E2E)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge); responsive 320 px – desktop
**Project Type**: Web application (REST API backend + SPA frontend)
**Performance Goals**: API responses < 200 ms p95; SPA initial load < 3 s on standard Wi-Fi
**Constraints**: No authentication for v1; offline-capable after initial load (localStorage caching); mobile-first (320 px min width, 44×44 px touch targets)
**Scale/Scope**: Single-user sessions (no concurrent multi-user concerns in v1); ~5 pre-loaded categories, ~50 pre-loaded cards; 6 frontend pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spaced Repetition Algorithm | ✅ PASS | SM-2 implemented as pure function in `backend/src/core/sm2/`; isolated from persistence |
| II. User-Owned Content & Data Isolation | ⚠️ DOCUMENTED DEVIATION | No auth in v1 — data isolated by `clientId` UUID header (see Complexity Tracking) |
| III. Mobile-First, Responsive UI | ✅ PASS | Tailwind CSS mobile-first; grade buttons fixed bottom bar on mobile; 44×44 px touch targets enforced |
| IV. Test-Driven Development | ✅ PASS | SM-2 unit tests written first; service integration tests required before story completion |
| V. Simplicity & YAGNI | ✅ PASS | No extra abstractions; two top-level projects only; one shared type pattern via `X-Client-ID` header |

**Post-design re-check**: ✅ All Phase 1 artifacts (data-model.md, contracts/api.md) align with all principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-flashcard-english-learning/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # REST API contract
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/                             # NestJS REST API
├── prisma/
│   ├── schema.prisma                # Prisma schema (single source of truth)
│   ├── migrations/                  # Auto-generated migration files
│   └── seed.ts                      # Pre-loaded categories & sample cards
├── src/
│   ├── core/
│   │   └── sm2/
│   │       ├── sm2.service.ts       # Pure SM-2 scheduling function
│   │       └── sm2.service.spec.ts  # Unit tests (written first — TDD)
│   ├── modules/
│   │   ├── categories/
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   └── categories.module.ts
│   │   ├── decks/
│   │   │   ├── decks.controller.ts
│   │   │   ├── decks.service.ts
│   │   │   ├── dto/
│   │   │   └── decks.module.ts
│   │   ├── cards/
│   │   │   ├── cards.controller.ts
│   │   │   ├── cards.service.ts
│   │   │   ├── dto/
│   │   │   └── cards.module.ts
│   │   ├── sessions/
│   │   │   ├── sessions.controller.ts
│   │   │   ├── sessions.service.ts
│   │   │   ├── dto/
│   │   │   └── sessions.module.ts
│   │   └── progress/
│   │       ├── progress.controller.ts
│   │       ├── progress.service.ts
│   │       └── progress.module.ts
│   ├── prisma/
│   │   ├── prisma.service.ts        # PrismaClient singleton
│   │   └── prisma.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   └── client-id.decorator.ts  # Extracts X-Client-ID header
│   │   └── guards/
│   │       └── client-id.guard.ts      # Validates X-Client-ID present
│   ├── app.module.ts
│   └── main.ts
└── test/
    ├── unit/
    └── integration/

frontend/                            # Next.js 14 App Router (TypeScript)
├── app/
│   ├── layout.tsx                   # Root layout (ClientIdProvider, nav)
│   ├── page.tsx                     # Home — category tiles + due-card badges
│   ├── categories/
│   │   └── [id]/
│   │       └── page.tsx             # Decks in a category
│   ├── decks/
│   │   └── [id]/
│   │       └── page.tsx             # Deck detail + Start Studying button
│   ├── study/
│   │   └── [sessionId]/
│   │       └── page.tsx             # Card flip + grade bar (client component)
│   ├── my-decks/
│   │   └── page.tsx                 # Create/edit/delete personal decks
│   └── progress/
│       └── page.tsx                 # CEFR level + stats
├── components/
│   ├── FlashCard/                   # Flip animation, front/back (client)
│   ├── GradeBar/                    # Again/Hard/Good/Easy buttons (fixed bottom mobile, client)
│   ├── DeckTile/                    # Deck summary with due-count badge
│   ├── CategoryTile/                # Category grid tile
│   └── SessionSummary/              # End-of-session results
├── services/
│   └── api.ts                       # Axios instance + TanStack Query hooks
├── hooks/
│   └── useSession.ts                # Session state machine (in-progress reviews)
├── lib/
│   └── clientId.ts                  # UUID v4 generation + localStorage helper
└── test/
    ├── components/
    └── e2e/                         # Playwright tests
```

**Structure Decision**: Web application (Option 2 — `backend/` + `frontend/`).
Selected because the spec requires a REST API (NestJS) plus a Next.js frontend.
Next.js App Router is used for SSR-friendly page routing and React Server Components
where data can be fetched server-side (category list, deck overview). Interactive study
flows (card flip, grading) are Client Components. No third `packages/` directory is
created — shared types are maintained in `backend/src/contracts/` and copied to
`frontend/types/` via a simple script, avoiding monorepo tooling overhead (Principle V).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Principle II deviation: `clientId` scoping without auth | Constitution requires data isolation; auth is explicitly out of scope for v1 per spec. Using UUID header provides functional isolation with minimal complexity. | Global unscoped data violates Principle II entirely; adding full auth now adds weeks of scope not requested. |
