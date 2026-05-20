# API Contract: Simplify Study Grading — Keyboard Shortcuts + Remove AGAIN

**Feature**: `002-simplify-study-grading`
**Date**: 2026-05-17

## Status: NO CHANGES TO BACKEND API

This feature is a frontend-only change. All existing REST endpoints are used as-is.
No new endpoints are added, no existing endpoints are modified or removed.

---

## Endpoints Used by This Feature

### POST `/sessions/:id/reviews`

Used when the user selects a grade button or presses the "Next" keyboard shortcut.
The grade is always the user's explicit selection: `"HARD"`, `"GOOD"`, or `"EASY"`.
When the Enter/Right Arrow keyboard shortcut is used, the frontend sends `"GOOD"`.
The `"AGAIN"` value is never sent from this UI flow.

**Request**
```json
{ "cardId": 42, "grade": "GOOD" }
```

**Valid grade values sent by this feature**: `"HARD"` | `"GOOD"` | `"EASY"`

**Response** `200 OK`
```json
{
  "cardId": 42,
  "grade": "GOOD",
  "newDueDate": "2026-05-24T00:00:00.000Z",
  "newInterval": 6,
  "newEaseFactor": 2.5,
  "newRepetitions": 2,
  "isMastered": false
}
```

**Notes**: The backend DTO still accepts `"AGAIN"` — this is intentional for backward
compatibility. The frontend simply never sends it.

---

### PATCH `/sessions/:id/complete`

Unchanged. Returns summary including `again`, `hard`, `good`, `easy`, and `accuracyPercent`.
Since AGAIN is never submitted, `again` will always be `0`. The frontend renders only
the Hard/Good/Easy counts and the accuracy percentage.

**Response** `200 OK`
```json
{
  "id": 7,
  "completedAt": "2026-05-17T10:30:00.000Z",
  "totalCards": 10,
  "again": 0,
  "hard": 3,
  "good": 5,
  "easy": 2,
  "accuracyPercent": 70
}
```

**Notes**: `accuracyPercent` is computed as `(GOOD + EASY) / total * 100` by the backend.
With no AGAIN grades, this will always be 100% unless HARD is used (HARD counts as
"incorrect" in the current backend formula: `correct = GOOD + EASY`). The frontend
displays this value as meaningful feedback.

---

### GET `/sessions/:id`

Unchanged. Returns session with card list used to initialise the study page.

---

## Frontend Type: `SessionSummaryData` (unchanged)

```typescript
// frontend/services/api.ts — no interface changes required
export interface SessionSummaryData {
  sessionId: number;
  totalCards: number;
  accuracyPercent: number; // rendered in SessionSummary
  again: number;           // returned by API, always 0 in this flow; NOT rendered
  hard: number;            // rendered in SessionSummary
  good: number;            // rendered in SessionSummary
  easy: number;            // rendered in SessionSummary
  completedAt: string;
}
```
