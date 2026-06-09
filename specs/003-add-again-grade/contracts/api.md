# API Contract: Add 'Again' Grade Back to SM-2 Grading UI

**Feature**: 003-add-again-grade
**Date**: 2026-06-04

---

## Existing Endpoints (No Changes)

All endpoints are pre-existing. This feature does not add or modify any backend route.

---

### POST /sessions/:id/reviews

Submit a grade for a single card within a study session.

**Request**

```http
POST /sessions/{sessionId}/reviews
X-Client-ID: <client-uuid>
Content-Type: application/json

{
  "cardId": 42,
  "grade": "AGAIN"       ← now sent from the UI (previously blocked at UI layer)
}
```

**Grade values accepted**: `AGAIN` | `HARD` | `GOOD` | `EASY`

**Response 200**

```json
{
  "cardId": 42,
  "grade": "AGAIN",
  "newDueDate": "2026-06-05T10:00:00.000Z",
  "newInterval": 1,
  "newEaseFactor": 2.5,
  "newRepetitions": 0,
  "isMastered": false
}
```

**SM-2 behaviour for `AGAIN`**:
`interval = 1`, `repetitions = 0`, `easeFactor` unchanged, `isMastered = false`.

---

### PATCH /sessions/:id/complete

Complete a study session and retrieve the summary.

**Response 200** (already includes `again` field)

```json
{
  "id": 7,
  "completedAt": "2026-06-04T14:30:00.000Z",
  "totalCards": 10,
  "again": 2,
  "hard": 3,
  "good": 3,
  "easy": 2,
  "accuracyPercent": 80
}
```

> `accuracyPercent = (hard + good + easy) / totalCards × 100`
> `again` has always been present in the response; the frontend now renders it.

---

## Frontend Type Reference

```typescript
// services/api.ts — no changes required
export type Grade = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface SessionSummaryData {
  sessionId: number;
  totalCards: number;
  accuracyPercent: number;
  again: number;    // already declared; just needs to be rendered
  hard: number;
  good: number;
  easy: number;
  completedAt: string;
}
```
