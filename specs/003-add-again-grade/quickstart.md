# Quickstart: Add 'Again' Grade Back to SM-2 Grading UI

**Feature**: 003-add-again-grade
**Date**: 2026-06-04

---

## Overview

This feature restores the **Again** grade button to the study session screen and
adds **numeric keyboard shortcuts** (1–4) for all four grades. All changes are
confined to three frontend files; no backend or database changes are required.

---

## Prerequisites

- Node.js ≥ 18
- Docker (for PostgreSQL via `docker compose`)
- Existing repo checked out on `develop` branch

---

## Running the App Locally

```bash
# 1. Start PostgreSQL
docker compose up -d db

# 2. Backend
cd backend
cp .env.example .env          # set DATABASE_URL if not already set
npm install
npx prisma migrate deploy
npm run start:dev

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. Navigate to any deck and start a study session — you
will see the current three-button GradeBar (HARD / GOOD / EASY). After this feature
is implemented it will show four buttons: **Again / Hard / Good / Easy**.

---

## Files to Change

| File | Change |
|------|--------|
| `frontend/components/GradeBar/GradeBar.tsx` | Add AGAIN entry; `grid-cols-4`; renumber hints |
| `frontend/app/study/[sessionId]/page.tsx` | Add `1`–`4` keydown handlers |
| `frontend/components/SessionSummary/SessionSummary.tsx` | Add Again column |

---

## Manual Smoke Test

1. Start a study session for any deck.
2. Flip a card (Space or click "Show Answer").
3. Confirm four buttons are visible: Again (red), Hard (orange), Good (blue), Easy (green).
4. Press `1` — card should be graded Again; next card appears.
5. Flip the next card, press `2` (Hard), `3` (Good), `4` (Easy) for subsequent cards.
6. Complete the session; verify the summary shows **Again / Hard / Good / Easy** counts.
7. Verify accuracy = (Hard + Good + Easy) / total × 100.

---

## Running Tests

```bash
# Backend unit tests (SM-2 service — already passes for AGAIN)
cd backend && npm test -- --testPathPattern=sm2

# Frontend (if snapshot tests exist for GradeBar / SessionSummary)
cd frontend && npm test
```
