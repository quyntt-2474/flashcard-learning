# Data Model: Add 'Again' Grade Back to SM-2 Grading UI

**Feature**: 003-add-again-grade
**Date**: 2026-06-04

---

## Overview

No data model changes are required for this feature. The `AGAIN` grade is already
a valid value in the Prisma `Grade` enum and is already stored and processed correctly
by the backend. This document records the current model for reference.

---

## Entities

### Grade (Prisma Enum)

```prisma
enum Grade {
  AGAIN   // Numeric SM-2 value: 0 — resets interval & repetitions
  HARD    // Numeric SM-2 value: 3 — slight ease-factor decrease
  GOOD    // Numeric SM-2 value: 4 — minimal ease-factor change
  EASY    // Numeric SM-2 value: 5 — slight ease-factor increase
}
```

All four values are accepted by `POST /sessions/:id/reviews`.

### CardReview

| Field       | Type     | Notes                                  |
|-------------|----------|----------------------------------------|
| id          | Int PK   | Auto-increment                         |
| cardId      | Int FK   | References `cards.id`                  |
| sessionId   | Int FK   | References `study_sessions.id`         |
| grade       | Grade    | One of AGAIN / HARD / GOOD / EASY      |
| reviewedAt  | DateTime | Defaults to `now()`                    |
| newDueDate  | DateTime | SM-2 computed next review date         |

### SessionSummaryData (API Response Shape)

```typescript
interface SessionSummaryData {
  sessionId: number;
  totalCards: number;
  accuracyPercent: number;   // (hard + good + easy) / total × 100
  again: number;             // count of AGAIN grades in this session
  hard: number;
  good: number;
  easy: number;
  completedAt: string;
}
```

> **Note**: `again` has always been included in the backend response. The frontend
> `SessionSummary` component was simply not displaying it.

---

## SM-2 Scheduling — AGAIN Path

When a card is graded `AGAIN`:

```
repetitions = 0
interval    = 1       (review again tomorrow)
easeFactor  = unchanged
isMastered  = false
```

This is implemented in `backend/src/core/sm2/sm2.service.ts` and covered by the
existing unit-test suite in `sm2.service.spec.ts`.

---

## No Migration Required

The Prisma schema already contains `AGAIN` in the `Grade` enum. No `prisma migrate dev`
run is needed for this feature.
