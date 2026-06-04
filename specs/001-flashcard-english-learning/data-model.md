# Data Model: Flashcard English Learning App

**Feature**: 001-flashcard-english-learning
**Date**: 2026-04-29
**Source**: research.md § 2, 3, 5, 7

---

## Prisma Schema

> **File**: `backend/prisma/schema.prisma`

```prisma
// This is your Prisma schema file.
// Run `npx prisma migrate dev` to apply changes.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// Category — thematic grouping for decks
// ─────────────────────────────────────────────
model Category {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  icon        String?              // emoji or icon identifier, e.g. "✈️"
  color       String?              // hex colour, e.g. "#3B82F6"
  isPreloaded Boolean  @default(false)
  decks       Deck[]
  createdAt   DateTime @default(now())

  @@map("categories")
}

// ─────────────────────────────────────────────
// Deck — collection of flashcards
// ─────────────────────────────────────────────
model Deck {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  isPreloaded Boolean   @default(false)  // pre-loaded decks are read-only
  clientId    String                     // anonymous user identifier (UUID v4)
  categoryId  Int?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  cards       Card[]
  sessions    StudySession[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([clientId])
  @@index([categoryId])
  @@map("decks")
}

// ─────────────────────────────────────────────
// Card — single flashcard with SM-2 state
// ─────────────────────────────────────────────
model Card {
  id          Int      @id @default(autoincrement())
  front       String                    // English word or phrase
  back        String                    // Definition or Vietnamese translation
  deckId      Int
  deck        Deck     @relation(fields: [deckId], references: [id], onDelete: Cascade)
  clientId    String                    // denormalised for efficient due-card queries

  // SM-2 scheduling state
  easeFactor  Float    @default(2.5)    // initial EF per SM-2 spec
  interval    Int      @default(1)      // days until next review
  repetitions Int      @default(0)      // consecutive successful reviews
  dueDate     DateTime @default(now())  // date when card is next due
  isMastered  Boolean  @default(false)  // true when repetitions ≥ 4 & last grade ≥ GOOD

  reviews     CardReview[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([clientId, dueDate])  // primary query pattern: due cards for a client
  @@index([deckId])
  @@map("cards")
}

// ─────────────────────────────────────────────
// StudySession — one sitting of reviewing cards
// ─────────────────────────────────────────────
model StudySession {
  id          Int        @id @default(autoincrement())
  deckId      Int
  deck        Deck       @relation(fields: [deckId], references: [id], onDelete: Cascade)
  clientId    String
  startedAt   DateTime   @default(now())
  completedAt DateTime?                 // null until session is finished
  reviews     CardReview[]

  @@index([clientId])
  @@index([deckId])
  @@map("study_sessions")
}

// ─────────────────────────────────────────────
// CardReview — single grade event within a session
// ─────────────────────────────────────────────
model CardReview {
  id          Int          @id @default(autoincrement())
  cardId      Int
  card        Card         @relation(fields: [cardId], references: [id], onDelete: Cascade)
  sessionId   Int
  session     StudySession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  grade       Grade
  reviewedAt  DateTime     @default(now())
  newDueDate  DateTime     // the due date assigned by SM-2 after this review

  @@index([cardId])
  @@index([sessionId])
  @@map("card_reviews")
}

// ─────────────────────────────────────────────
// Grade enum — maps to SM-2 numeric grades
// ─────────────────────────────────────────────
enum Grade {
  AGAIN  // SM-2 grade 0 — complete blackout, reset
  HARD   // SM-2 grade 3 — correct with serious difficulty
  GOOD   // SM-2 grade 4 — correct after hesitation
  EASY   // SM-2 grade 5 — perfect recall, no hesitation
}
```

---

## Entity Relationships

```
Category ──< Deck ──< Card
                │       └──< CardReview
                └──< StudySession ──< CardReview
```

- A `Category` has many `Deck`s (optional — decks may be uncategorised).
- A `Deck` has many `Card`s and many `StudySession`s.
- A `StudySession` has many `CardReview`s (one per card graded in the session).
- A `CardReview` references both a `Card` (what was reviewed) and a `StudySession` (when).

---

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| Deck | title | Required; 1–100 characters |
| Card | front | Required; 1–500 characters |
| Card | back | Required; 1–1000 characters |
| Card | easeFactor | Float ≥ 1.3 (SM-2 floor) |
| Card | interval | Integer ≥ 1 |
| Card | repetitions | Integer ≥ 0 |
| StudySession | completedAt | Must be after startedAt |
| CardReview | grade | Must be one of: AGAIN, HARD, GOOD, EASY |

---

## SM-2 State Transitions

```
Initial state:
  easeFactor  = 2.5
  interval    = 1
  repetitions = 0
  dueDate     = now()

After review with grade G:
  if G == AGAIN:
    repetitions = 0
    interval    = 1
    easeFactor  unchanged
    dueDate     = today + 1 day   (card reappears tomorrow / end of session)

  if G in (HARD, GOOD, EASY):
    newEF = easeFactor + 0.1 - (5 - sm2Grade) * (0.08 + (5 - sm2Grade) * 0.02)
    easeFactor  = max(1.3, newEF)
    interval    = (repetitions == 0) ? 1
                : (repetitions == 1) ? 6
                : round(interval * easeFactor)
    repetitions = repetitions + 1
    dueDate     = today + interval days

  isMastered = (repetitions >= 4 && G in (GOOD, EASY))
```

Grade → SM-2 numeric mapping:

| App Grade | SM-2 Grade |
|-----------|-----------|
| AGAIN     | 0         |
| HARD      | 3         |
| GOOD      | 4         |
| EASY      | 5         |

---

## CEFR Calculation

> Computed in `backend/src/modules/progress/progress.service.ts`

```
correctReviews  = count(CardReview where clientId = X and grade in (GOOD, EASY))
totalReviews    = count(CardReview where clientId = X)

recentCorrect   = count(CardReview where clientId = X and grade in (GOOD, EASY) and reviewedAt >= 30 days ago)
recentTotal     = count(CardReview where clientId = X and reviewedAt >= 30 days ago)

weightedCorrect = correctReviews + recentCorrect      // recency 2×
weightedTotal   = totalReviews   + recentTotal

accuracy = weightedCorrect / weightedTotal * 100

Level:
  < 40%  → A1
  40–54% → A2
  55–64% → B1
  65–74% → B2
  75–84% → C1
  ≥ 85%  → C2
```

Minimum `totalReviews ≥ 20` to display a level.

---

## Seeded Pre-Loaded Data

Five categories with 10 sample cards each are seeded via `backend/prisma/seed.ts`:

| Category | clientId |
|----------|----------|
| Travel ✈️ | `preloaded` |
| Business 💼 | `preloaded` |
| Daily Life 🏠 | `preloaded` |
| Food & Drink 🍜 | `preloaded` |
| Technology 💻 | `preloaded` |

Pre-loaded decks have `isPreloaded = true` and `clientId = "preloaded"`. They are
excluded from edit/delete operations at the service level.
