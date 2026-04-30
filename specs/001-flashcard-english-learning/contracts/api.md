# API Contract: Flashcard English Learning App

**Feature**: 001-flashcard-english-learning
**Date**: 2026-04-29
**Base URL**: `/api`
**Auth**: None (anonymous). All requests must include header `X-Client-ID: <uuid-v4>` to scope data.

---

## Common Conventions

- All request/response bodies are `application/json`.
- Timestamps are ISO 8601 strings (UTC).
- `clientId` is **never** sent in the request body — it is always read from the `X-Client-ID` header to prevent spoofing.
- On error, the response shape is:
  ```json
  { "statusCode": 400, "message": "Validation failed", "errors": ["front must not be empty"] }
  ```
- Pre-loaded resources (`isPreloaded: true`) return `403 Forbidden` on mutating operations.

---

## Categories

### `GET /api/categories`

List all vocabulary categories.

**Response 200**:
```json
[
  {
    "id": 1,
    "name": "Travel",
    "icon": "✈️",
    "color": "#3B82F6",
    "isPreloaded": true,
    "deckCount": 1
  }
]
```

---

### `GET /api/categories/:id/decks`

List all decks belonging to a category (pre-loaded + decks created by the calling client).

**Response 200**:
```json
[
  {
    "id": 1,
    "title": "Travel Essentials",
    "description": "Common phrases for travelling abroad",
    "isPreloaded": true,
    "categoryId": 1,
    "cardCount": 10,
    "dueCount": 3,
    "createdAt": "2026-04-29T00:00:00.000Z"
  }
]
```

---

## Decks

### `GET /api/decks`

List all decks owned by the calling client (plus pre-loaded decks). Supports optional query parameter `?categoryId=<id>` to filter by category.

**Response 200**: Array of deck summary objects (same shape as `/categories/:id/decks`).

---

### `GET /api/decks/:id`

Get a single deck with its card count and due count.

**Response 200**:
```json
{
  "id": 1,
  "title": "Travel Essentials",
  "description": "Common phrases for travelling abroad",
  "isPreloaded": true,
  "categoryId": 1,
  "cardCount": 10,
  "dueCount": 3,
  "masteredCount": 5,
  "createdAt": "2026-04-29T00:00:00.000Z",
  "updatedAt": "2026-04-29T00:00:00.000Z"
}
```

**Response 404** if deck not found or belongs to another client.

---

### `POST /api/decks`

Create a new personal deck.

**Request body**:
```json
{
  "title": "My Custom Deck",
  "description": "Optional description",
  "categoryId": 2
}
```

**Validation**:
- `title`: required, string, 1–100 chars
- `description`: optional, string, max 500 chars
- `categoryId`: optional, integer, must reference an existing category

**Response 201**: Created deck object.

---

### `PATCH /api/decks/:id`

Update title, description, or category of a personal deck.

**Request body** (all fields optional):
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "categoryId": 3
}
```

**Response 200**: Updated deck object.
**Response 403** if deck is pre-loaded.
**Response 404** if deck not found or belongs to another client.

---

### `DELETE /api/decks/:id`

Delete a personal deck and all its cards + review history.

**Response 204** No Content.
**Response 403** if deck is pre-loaded.
**Response 404** if deck not found or belongs to another client.

---

## Cards

### `GET /api/decks/:deckId/cards`

List all cards in a deck.

**Response 200**:
```json
[
  {
    "id": 1,
    "front": "boarding pass",
    "back": "thẻ lên máy bay",
    "deckId": 1,
    "easeFactor": 2.5,
    "interval": 1,
    "repetitions": 0,
    "dueDate": "2026-04-29T00:00:00.000Z",
    "isMastered": false,
    "createdAt": "2026-04-29T00:00:00.000Z"
  }
]
```

---

### `POST /api/decks/:deckId/cards`

Add a new card to a deck.

**Request body**:
```json
{
  "front": "boarding pass",
  "back": "thẻ lên máy bay"
}
```

**Validation**:
- `front`: required, string, 1–500 chars
- `back`: required, string, 1–1000 chars

**Response 201**: Created card object.
**Response 403** if deck is pre-loaded.

---

### `PATCH /api/cards/:id`

Edit a card's front or back text.

**Request body** (all fields optional):
```json
{
  "front": "updated front",
  "back": "updated back"
}
```

**Response 200**: Updated card object.
**Response 403** if the card belongs to a pre-loaded deck.
**Response 404** if card not found or belongs to another client.

---

### `DELETE /api/cards/:id`

Delete a card and its review history.

**Response 204** No Content.
**Response 403** if the card belongs to a pre-loaded deck.
**Response 404** if card not found or belongs to another client.

---

## Study Sessions

### `POST /api/sessions`

Start a new study session for a deck. Returns the session ID and the ordered list of due cards.

**Request body**:
```json
{
  "deckId": 1
}
```

**Response 201**:
```json
{
  "id": 42,
  "deckId": 1,
  "startedAt": "2026-04-30T08:00:00.000Z",
  "completedAt": null,
  "dueCards": [
    {
      "id": 3,
      "front": "boarding pass",
      "back": "thẻ lên máy bay",
      "dueDate": "2026-04-30T00:00:00.000Z"
    }
  ]
}
```

**Response 404** if deck not found or belongs to another client.
**Response 422** if the deck has no due cards today (body includes `nextDueDate`).

---

### `GET /api/sessions/:id`

Get a session's current state (useful for resuming an interrupted session).

**Response 200**:
```json
{
  "id": 42,
  "deckId": 1,
  "startedAt": "2026-04-30T08:00:00.000Z",
  "completedAt": null,
  "reviewedCount": 3,
  "totalDue": 7,
  "reviews": [
    {
      "cardId": 3,
      "grade": "GOOD",
      "reviewedAt": "2026-04-30T08:01:00.000Z",
      "newDueDate": "2026-05-06T00:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/sessions/:id/reviews`

Submit a grade for one card in a session. The backend applies SM-2 and persists the new scheduling state.

**Request body**:
```json
{
  "cardId": 3,
  "grade": "GOOD"
}
```

**Validation**:
- `cardId`: required, integer, must be in the session's due-card list
- `grade`: required, one of `"AGAIN"`, `"HARD"`, `"GOOD"`, `"EASY"`

**Response 200**:
```json
{
  "cardId": 3,
  "grade": "GOOD",
  "newDueDate": "2026-05-06T00:00:00.000Z",
  "newInterval": 6,
  "newEaseFactor": 2.5,
  "newRepetitions": 1,
  "isMastered": false
}
```

---

### `PATCH /api/sessions/:id/complete`

Mark a session as complete.

**Response 200**:
```json
{
  "id": 42,
  "completedAt": "2026-04-30T08:15:00.000Z",
  "summary": {
    "totalReviewed": 7,
    "again": 1,
    "hard": 1,
    "good": 3,
    "easy": 2,
    "accuracyPercent": 71
  }
}
```

---

## Progress

### `GET /api/progress`

Get the calling client's overall statistics and CEFR level estimate.

**Response 200** (≥ 20 reviews):
```json
{
  "cefrLevel": "B1",
  "accuracyPercent": 62,
  "totalReviews": 87,
  "masteredCards": 14,
  "studyStreakDays": 5,
  "nextDueDate": "2026-05-01T00:00:00.000Z",
  "byCategory": [
    {
      "categoryId": 1,
      "categoryName": "Travel",
      "totalReviews": 30,
      "accuracyPercent": 70
    }
  ]
}
```

**Response 200** (< 20 reviews):
```json
{
  "cefrLevel": null,
  "accuracyPercent": null,
  "totalReviews": 12,
  "masteredCards": 0,
  "studyStreakDays": 2,
  "nextDueDate": "2026-04-30T00:00:00.000Z",
  "byCategory": [],
  "message": "Complete at least 20 card reviews to see your CEFR level estimate."
}
```
