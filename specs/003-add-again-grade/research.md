# Research: Add 'Again' Grade Back to SM-2 Grading UI

**Feature**: 003-add-again-grade
**Date**: 2026-06-04
**Status**: Complete — all unknowns resolved

---

## 1. Backend Support for AGAIN Grade

**Decision**: No backend changes required.

**Rationale**:
- `backend/src/core/sm2/sm2.service.ts` already maps `AGAIN` → numeric grade 0, resets `interval = 1`, `repetitions = 0`, and leaves `easeFactor` unchanged.
- `backend/prisma/schema.prisma` already declares `AGAIN` in the `Grade` enum.
- `sessions.service.ts submitReview()` accepts any `Grade` value including `AGAIN`.
- `sessions.service.ts complete()` already counts `AGAIN` grades and returns `again: number` in the summary payload.
- `sm2.service.spec.ts` already contains a full `grade AGAIN` test suite (resets interval, easeFactor unchanged, isMastered false).

**Alternatives considered**: Adding a backend validation to block `AGAIN` (rejected — already removed per spec 002, but the field was kept for backward compatibility; we just restore the frontend path).

---

## 2. Frontend — GradeBar Layout

**Decision**: Extend the `GRADES` array in `GradeBar.tsx` with an `AGAIN` entry and switch the grid to 4 columns (`grid-cols-4`). Key hint `[1]` for Again; shift existing keys: Hard→`[2]`, Good→`[3]`, Easy→`[4]`.

**Rationale**:
- Anki-standard key mapping: 1=Again, 2=Hard, 3=Good, 4=Easy is widely known and expected by spaced-repetition users.
- Four equal columns fit the existing responsive container without overflow at 320 px (each button ≈ 72 px minimum, within the 44 px touch-target minimum after padding).

**Alternatives considered**:
- Key mapping 0=Again, 1=Hard, 2=Good, 3=Easy — rejected because 0 is less ergonomic (top of number row, away from 1–3).
- No keyboard shortcut for Again (click-only) — rejected; inconsistent with keyboard-shortcut philosophy established in spec 002.

---

## 3. Frontend — Keyboard Shortcuts in Study Page

**Decision**: Add `1`–`4` numeric key handlers in `study/[sessionId]/page.tsx` alongside the existing `Enter`/`ArrowRight` → Good shortcut. All numeric shortcuts fire only when `revealed === true` and no text input is focused.

**Rationale**:
- The existing Enter/ArrowRight → Good shortcut is preserved per FR-007 (backward compatibility).
- Numeric keys do not conflict with existing Space (reveal) or Enter/ArrowRight shortcuts.
- Guard `tag === "INPUT" || tag === "TEXTAREA"` already present in the `useEffect` handler; same guard covers numeric keys with no additional code.

**Alternatives considered**: Replacing Enter/ArrowRight with `3` for Good — rejected; would break muscle memory of existing users.

---

## 4. Frontend — SessionSummary Layout

**Decision**: Add an "Again" column (red/rose colour) to the four-column stats grid in `SessionSummary.tsx`. The `again` field is already present in the `SessionSummaryData` interface in `api.ts` (it was always returned by the backend; the UI simply never displayed it).

**Rationale**:
- `api.ts` already declares `again: number` in `SessionSummaryData`, so no type changes needed.
- A four-column grid matches the four-column GradeBar, creating visual consistency.

**Alternatives considered**: Keeping three columns and merging Again into accuracy display — rejected; doesn't satisfy FR-010.

---

## 5. Accuracy Calculation

**Decision**: No backend change. The existing formula `(GOOD + EASY) / total * 100` is already implemented in `sessions.service.ts complete()` and satisfies FR-011 (Again = incorrect).

**Alternatives considered**: Including HARD in "correct" — rejected per spec (accuracy reflects strong recall only; Hard implies partial recall but not a failure).

---

## 6. No Database Migration Required

**Decision**: No migration needed.

**Rationale**: The `Grade` enum in Prisma already includes `AGAIN`. The `CardReview` table already stores `AGAIN` values from any historical sessions. No schema changes, no `prisma migrate dev` required.

---

## Summary of Changes

| Layer | File(s) | Change |
|-------|---------|--------|
| Frontend UI | `components/GradeBar/GradeBar.tsx` | Add AGAIN entry; switch to `grid-cols-4`; renumber keyboard hints |
| Frontend UI | `app/study/[sessionId]/page.tsx` | Add numeric key `1-4` handlers in `useEffect` |
| Frontend UI | `components/SessionSummary/SessionSummary.tsx` | Add Again column to grade breakdown grid |
| Backend | — | No changes required |
| Schema | — | No migration required |
