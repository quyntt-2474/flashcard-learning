---
description: "Task list for Flashcard English Learning App implementation"
---

# Tasks: Flashcard English Learning App

**Input**: Design documents from `/specs/001-flashcard-english-learning/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅, quickstart.md ✅

**Tech stack**: NestJS 11 · Next.js 15 (App Router) · React 19 · Prisma 6 · PostgreSQL 17 · TanStack Query 5 · Tailwind CSS 4

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared incomplete dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are included in every task description

---

## Phase 1: Setup (Project Scaffolding)

**Purpose**: Scaffold both projects so developers can start work immediately.

- [X] T001 Scaffold NestJS 11 project with TypeScript in `backend/` (`nest new backend --package-manager npm`)
- [X] T002 Scaffold Next.js 15 App Router project with TypeScript in `frontend/` (`npx create-next-app@latest frontend --ts --app --no-src-dir`)
- [ ] T003 [P] Configure ESLint + Prettier for backend in `backend/.eslintrc.js` and `backend/.prettierrc`
- [ ] T004 [P] Configure ESLint + Prettier + Tailwind CSS 4 for frontend in `frontend/.eslintrc.js`, `frontend/postcss.config.mjs`, `frontend/app/globals.css`
- [ ] T005 Add root `package.json` with `dev`, `build`, and `test` scripts for both projects at repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can begin.

**⚠️ CRITICAL**: No user story work can begin until ALL Phase 2 tasks are done.

- [X] T006 Write SM-2 unit tests (TDD — red phase, tests must FAIL) covering: grade → interval → easeFactor → dueDate transitions for all four grades in `backend/src/core/sm2/sm2.service.spec.ts`
- [X] T007 Implement the SM-2 pure function to pass all T006 tests (green phase) in `backend/src/core/sm2/sm2.service.ts`
- [X] T008 Create full Prisma schema (Category, Deck, Card, StudySession, CardReview, Grade enum) per data-model.md in `backend/prisma/schema.prisma`
- [ ] T009 Run initial Prisma migration and commit generated files in `backend/prisma/migrations/` (`npx prisma migrate dev --name init`)
- [X] T010 Create `PrismaService` singleton (extends `PrismaClient`, handles `onModuleInit`/`onModuleDestroy`) in `backend/src/prisma/prisma.service.ts` and `backend/src/prisma/prisma.module.ts`
- [X] T011 [P] Create `@ClientId()` param decorator that extracts `X-Client-ID` header in `backend/src/common/decorators/client-id.decorator.ts`
- [X] T012 [P] Create `ClientIdGuard` that returns 400 if `X-Client-ID` header is missing or not a valid UUID in `backend/src/common/guards/client-id.guard.ts`
- [X] T013 Configure NestJS bootstrap: global `/api` prefix, `ValidationPipe`, CORS for Next.js origin, and port from env in `backend/src/main.ts`
- [X] T014 Wire `AppModule` importing PrismaModule and all feature modules (categories, decks, cards, sessions, progress) in `backend/src/app.module.ts`
- [X] T015 Write database seed: 5 pre-loaded categories (Travel ✈️, Business 💼, Daily Life 🏠, Food & Drink 🍜, Technology 💻) with 10 sample cards each; `clientId = "preloaded"`, `isPreloaded = true` in `backend/prisma/seed.ts`
- [X] T016 Create `clientId` utility: generate UUID v4 on first call and persist in `localStorage`; return stored value on all subsequent calls in `frontend/lib/clientId.ts`
- [X] T017 [P] Create `ClientIdProvider` client component that reads `clientId` and stores it in React context; wrap app in `frontend/components/ClientIdProvider/ClientIdProvider.tsx`
- [X] T018 [P] Create Axios instance that reads clientId from context and injects `X-Client-ID` header on every request; export configured instance in `frontend/services/api.ts`
- [X] T019 Create root Next.js layout wrapping all pages with `ClientIdProvider` and a placeholder top navigation in `frontend/app/layout.tsx`

**Checkpoint**: All unit tests for SM-2 pass, Prisma schema migrates cleanly, API boots and returns 400 when X-Client-ID is missing.

---

## Phase 3: User Story 1 — Browse Topics & Study Loop (Priority: P1) 🎯 MVP

**Goal**: A first-time visitor can browse categories, pick a deck, flip through all due cards, grade each one, and see a session summary — the complete core learning loop.

**Independent Test**: Open the app → tap "Travel" category → tap "Start Studying" on the default deck → flip 3 cards → grade each → see session summary with accuracy %.

### Backend — User Story 1

- [X] T020 [P] [US1] Create `CategoriesModule` with `GET /api/categories` (list all) and `GET /api/categories/:id/decks` (decks in category + dueCount per deck per clientId) in `backend/src/modules/categories/`
- [X] T021 [P] [US1] Create `DecksModule` with `GET /api/decks` (list by clientId + preloaded, optional `?categoryId`) and `GET /api/decks/:id` (with cardCount, dueCount, masteredCount) in `backend/src/modules/decks/`
- [X] T022 [US1] Add `POST /api/sessions` to new `SessionsModule`: validate deckId belongs to clientId or is preloaded; query cards due today; return session id + ordered dueCards array in `backend/src/modules/sessions/`
- [X] T023 [US1] Add `POST /api/sessions/:id/reviews` to `SessionsModule`: validate grade enum; call `Sm2Service.calculate()`; persist new `CardReview`; update `Card` scheduling fields (easeFactor, interval, repetitions, dueDate, isMastered) in `backend/src/modules/sessions/`
- [X] T024 [US1] Add `PATCH /api/sessions/:id/complete` to `SessionsModule`: set `completedAt`; calculate and return summary (totalReviewed, again/hard/good/easy counts, accuracyPercent) in `backend/src/modules/sessions/`

### Frontend — User Story 1

- [X] T025 [P] [US1] Build `CategoryTile` component: icon, name, responsive grid card with hover/active states in `frontend/components/CategoryTile/CategoryTile.tsx`
- [X] T026 [P] [US1] Build `DeckTile` component: title, card count, due-count badge (badge hidden when dueCount = 0) in `frontend/components/DeckTile/DeckTile.tsx`
- [X] T027 [US1] Build Home page (Server Component): fetch categories from API server-side; render `CategoryTile` grid; link each tile to `/categories/[id]` in `frontend/app/page.tsx`
- [X] T028 [US1] Build Category page (Server Component): fetch decks for category server-side; render `DeckTile` list with due badges; "Start Studying" link to `/decks/[id]` in `frontend/app/categories/[id]/page.tsx`
- [X] T029 [US1] Build Deck detail page (Server Component): fetch deck detail; show title + description + cardCount + dueCount; "Start Studying" button that POSTs `/api/sessions` and redirects to `/study/[sessionId]` in `frontend/app/decks/[id]/page.tsx`
- [X] T030 [P] [US1] Build `FlashCard` component (`'use client'`): front-face / back-face with 3D flip CSS animation; "Show Answer" trigger in `frontend/components/FlashCard/FlashCard.tsx`
- [X] T031 [P] [US1] Build `GradeBar` component (`'use client'`): four buttons (Again / Hard / Good / Easy); fixed position at bottom on mobile (< 768 px), inline below card on ≥ 768 px; min 44×44 px touch targets in `frontend/components/GradeBar/GradeBar.tsx`
- [X] T032 [US1] Implement `useSession` hook: manage card queue array, current card index, flip state, and POST grade to `/api/sessions/:id/reviews`; detect completion and call complete endpoint in `frontend/hooks/useSession.ts`
- [X] T033 [US1] Build Study page (`'use client'`): consume `useSession`; render `FlashCard` + `GradeBar`; show `SessionSummary` on completion in `frontend/app/study/[sessionId]/page.tsx`
- [X] T034 [P] [US1] Build `SessionSummary` component: show totalReviewed, per-grade counts, accuracyPercent, "Finish" button that navigates home in `frontend/components/SessionSummary/SessionSummary.tsx`

**Checkpoint**: Full study loop works end-to-end on desktop and mobile (320 px viewport). SM-2 schedules next due date after each grade.

---

## Phase 4: User Story 2 — Personal Deck & Card Management (Priority: P2)

**Goal**: User can create a personal deck, add/edit/delete cards, and study it.

**Independent Test**: Navigate to My Decks → create "Test Deck" → add 3 cards → edit one → delete one → tap "Study Now" → complete session.

### Backend — User Story 2

- [X] T035 [P] [US2] Add `POST /api/decks`, `PATCH /api/decks/:id`, `DELETE /api/decks/:id` (cascade-deletes cards + reviews) to `DecksModule` with preloaded guard in `backend/src/modules/decks/decks.controller.ts`
- [X] T036 [P] [US2] Create `CreateDeckDto` (title required, description + categoryId optional) and `UpdateDeckDto` with class-validator decorators in `backend/src/modules/decks/dto/`
- [X] T037 [P] [US2] Create `CardsModule` with `GET /api/decks/:deckId/cards` and `POST /api/decks/:deckId/cards` (with preloaded guard) in `backend/src/modules/cards/`
- [X] T038 [P] [US2] Add `PATCH /api/cards/:id` and `DELETE /api/cards/:id` (preloaded guard, clientId ownership check) to `CardsModule` in `backend/src/modules/cards/cards.controller.ts`
- [X] T039 [P] [US2] Create `CreateCardDto` (front, back required) and `UpdateCardDto` with class-validator decorators in `backend/src/modules/cards/dto/`

### Frontend — User Story 2

- [X] T040 [US2] Build My Decks page (`'use client'`): list personal decks via TanStack Query; "New Deck" button; delete button per deck in `frontend/app/my-decks/page.tsx`
- [X] T041 [P] [US2] Build `DeckForm` component (modal/drawer): title + category select inputs; used for both create and edit in `frontend/components/DeckForm/DeckForm.tsx`
- [X] T042 [P] [US2] Build `CardForm` component: front + back textarea inputs; used for add and edit in `frontend/components/CardForm/CardForm.tsx`
- [X] T043 [US2] Extend Deck detail page: add card list (GET /api/decks/:deckId/cards), "Add Card" button opening `CardForm`, edit/delete actions per card in `frontend/app/decks/[id]/page.tsx`
- [X] T044 [P] [US2] Add TanStack Query mutations for deck CRUD and card CRUD (create, update, delete) to `frontend/services/api.ts`

**Checkpoint**: Create deck, add 3 cards, edit one, delete one, study the remaining cards — all working end-to-end.

---

## Phase 5: User Story 3 — Progress & CEFR Level (Priority: P3)

**Goal**: After ≥ 20 reviews, the Progress page shows a CEFR level badge, per-category accuracy, mastered card count, and study streak.

**Independent Test**: Complete 20+ card reviews (mix of grades) → navigate to `/progress` → confirm CEFR badge is shown and per-category breakdown is populated.

### Backend — User Story 3

- [X] T045 [US3] Create `ProgressModule` with `GET /api/progress`: query all `CardReview` records for clientId; compute weighted accuracy (last 30 days 2×); map to CEFR level; calculate streak; break down accuracy by category in `backend/src/modules/progress/`

### Frontend — User Story 3

- [X] T046 [P] [US3] Build `CefrBadge` component: badge with level label (A1–C2) and colour-coded background (A1=grey → C2=gold) in `frontend/components/CefrBadge/CefrBadge.tsx`
- [X] T047 [P] [US3] Build `CategoryStats` component: horizontal bar per category showing accuracy % and review count in `frontend/components/CategoryStats/CategoryStats.tsx`
- [X] T048 [US3] Build Progress page: fetch `/api/progress`; show CEFR badge, accuracy, mastered count, streak; `CategoryStats` list; "not enough data" empty-state when < 20 reviews in `frontend/app/progress/page.tsx`

**Checkpoint**: Progress page shows all data correctly; empty-state shown when totalReviews < 20.

---

## Phase 6: User Story 4 — Due Cards on Home Page (Priority: P4)

**Goal**: Home page shows due-count badges on each deck tile; "Review Now" taps start a session in one step.

**Independent Test**: Complete a session → decks with cards scheduled for the next day → reload Home page next day → due badge appears on deck tile → tap "Review Now" → session starts immediately.

### Backend — User Story 4

- [ ] T049 [US4] Verify that `dueCount` field (count of cards where `dueDate <= now()` for the clientId) is correctly returned in `GET /api/decks` and `GET /api/categories/:id/decks`; add integration test in `backend/test/integration/decks.spec.ts`

### Frontend — User Story 4

- [X] T050 [P] [US4] Wire `dueCount` from API response to the due-count badge in `DeckTile` component; badge must be hidden (not zero-label) when dueCount is 0 in `frontend/components/DeckTile/DeckTile.tsx`
- [ ] T051 [US4] Add "Review Now" action button to deck tiles on the Home page: POSTs `/api/sessions` for the deck and navigates directly to `/study/[sessionId]` in `frontend/app/page.tsx`
- [ ] T052 [US4] Add empty-state message "Nothing due today — next review: [DATE]" to Home page when no decks have dueCount > 0 in `frontend/app/page.tsx`

**Checkpoint**: Home page reflects real-time due counts; one-tap review session works from the home page.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Mobile responsiveness verification, error handling, empty states, navigation, and E2E test coverage.

- [X] T053 [P] Add `ErrorBoundary` client component with user-friendly fallback UI for API errors in `frontend/components/ErrorBoundary/ErrorBoundary.tsx`
- [X] T054 [P] Add skeleton loading components for deck grid, card list, and study session loading states in `frontend/components/Skeleton/`
- [X] T055 [P] Add `EmptyState` component (0-card deck, 0-due session) with contextual call-to-action in `frontend/components/EmptyState/EmptyState.tsx`
- [ ] T056 Add mobile-responsive bottom navigation bar (Home / My Decks / Progress) to root layout; top nav on ≥ md breakpoint in `frontend/app/layout.tsx`
- [ ] T057 [P] Verify all six pages pass mobile layout at 320 px, 375 px, and 768 px: no horizontal overflow, all touch targets ≥ 44×44 px (manual check + Playwright viewport tests)
- [ ] T058 [P] Write integration tests for `SessionsService` (start session, grade card, complete session, AGAIN-card re-queue logic) in `backend/test/integration/sessions.spec.ts`
- [ ] T059 Write Playwright E2E test for core US1 flow: load home → click category → start session → grade all cards → verify session summary in `frontend/test/e2e/study-loop.spec.ts`
- [ ] T060 Final review: run `npm run lint` and `npm run test` in both projects; fix all errors; confirm seed script runs cleanly in fresh database

---

## Dependencies (Story Completion Order)

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) — SM-2 ✅ + Prisma ✅ + clientId infra ✅
    ↓
Phase 3 (US1) — INDEPENDENT MVP ✅
    ↓         ↘
Phase 4 (US2)  Phase 5 (US3)      ← US2 and US3 can start in parallel once US1 is done
    ↓         ↙
Phase 6 (US4) — depends on US1 dueCount endpoint from T049
    ↓
Phase 7 (Polish)
```

## Parallel Execution Examples (within each phase)

**Phase 2**: T006–T007 (SM-2 TDD) → T008–T009 (schema + migration) → T010–T012 (infra modules) can all start after T009 is committed.

**Phase 3**: T020–T021 (BE read endpoints) || T025–T026 (FE components) || T030 (useSession hook) — all independent after T019.

**Phase 4**: T035–T039 (all BE endpoints + DTOs) fully parallel; T041–T042 (DeckForm + CardForm) parallel.

**Phase 5**: T046–T047 (CefrBadge + CategoryStats) parallel.

---

## Implementation Strategy

1. **MVP (Phase 1–3 only)**: Delivers a fully working study session from pre-loaded content. Demonstrate-able to users with zero personal deck creation or progress tracking.
2. **Increment 2 (Phase 4)**: Adds personal content creation — users can now extend beyond pre-loaded material.
3. **Increment 3 (Phase 5–6)**: Adds motivation layer (CEFR level, streak) and frictionless daily review entry point.
4. **Increment 4 (Phase 7)**: Hardens the UX with error states, responsive polish, and automated test coverage.

---

## Task Summary

| Phase | Scope | Tasks | Parallelizable |
|-------|-------|-------|----------------|
| 1 — Setup | Project scaffolding | T001–T005 (5) | T003, T004 |
| 2 — Foundational | SM-2, Prisma, infra | T006–T019 (14) | T011, T012, T017, T018 |
| 3 — US1 (P1) 🎯 | Study loop | T020–T034 (15) | T020, T021, T025, T026, T030, T031, T034 |
| 4 — US2 (P2) | Deck & card CRUD | T035–T044 (10) | T035-T039, T041, T042, T044 |
| 5 — US3 (P3) | Progress & CEFR | T045–T048 (4) | T046, T047 |
| 6 — US4 (P4) | Due badges & 1-tap review | T049–T052 (4) | T050 |
| 7 — Polish | UX, tests, mobile verify | T053–T060 (8) | T053, T054, T055, T057, T058 |
| **Total** | | **60 tasks** | **24 parallelizable** |
