# Data Model: Simplify Study Grading — Keyboard Shortcuts + Remove AGAIN

**Feature**: `002-simplify-study-grading`
**Date**: 2026-05-17

## Summary

This feature is a **frontend-only UI change**. No Prisma schema migrations are needed.
All existing entities and relationships remain unchanged.

---

## Entities Involved

### CardReview

The `CardReview` entity records each card grade within a session. In this feature,
the AGAIN grade is removed from the UI but the `GradeEnum` in the schema is not changed.
The values submitted by the frontend will be `HARD`, `GOOD`, or `EASY` only.

| Field | Type | Change? | Notes |
|-------|------|---------|-------|
| `id` | `Int` (PK) | None | — |
| `sessionId` | `Int` (FK → StudySession) | None | — |
| `cardId` | `Int` (FK → Card) | None | — |
| `grade` | `GradeEnum` | **No schema change** | UI sends HARD / GOOD / EASY; AGAIN remains a valid enum value for backward compatibility |
| `newDueDate` | `DateTime` | None | Computed by SM-2 with user’s explicit grade |
| `reviewedAt` | `DateTime` | None | — |

**Decision**: Do NOT remove `AGAIN` from the `GradeEnum` in the Prisma schema. Historic
reviews may have used AGAIN; removing the enum value would break those records.

### Card

No changes. SM-2 fields (`easeFactor`, `interval`, `repetitions`, `dueDate`, `isMastered`)
continue to be updated using the user’s explicit grade selection.

### SessionSummaryData (frontend response type)

The TypeScript type `SessionSummaryData` in `frontend/services/api.ts` is **unchanged**.
The backend still returns `again`, `hard`, `good`, `easy`, `accuracyPercent`. The frontend
renders Hard, Good, Easy counts and accuracy; the `again` field (always 0 in this flow)
is ignored in the UI.

---

## State Transitions (unchanged)

```
Card (due) → [session starts] → Card shown (front only)
  → [user presses Space or clicks "Show Answer"] → Card revealed (back visible)
  → [user clicks Hard/Good/Easy OR presses Enter/ArrowRight] → POST /sessions/:id/reviews
  → SM-2 computes new dueDate → dueDate updated in DB
  → [if last card] → POST /sessions/:id/complete → session summary shown
```

---

## Migrations Required

**None.** Existing schema fully supports this feature.
