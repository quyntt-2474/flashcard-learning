# Research: Simplify Study Grading — Keyboard Shortcuts + Remove AGAIN

**Feature**: `002-simplify-study-grading`
**Date**: 2026-05-17
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## 1. Grading Model: Remove AGAIN, Keep HARD/GOOD/EASY

### Decision
Remove only the AGAIN grade from the study session UI. Keep HARD, GOOD, and EASY buttons.
Users continue to submit explicit grades; SM-2 scheduling remains fully driven by user input.

### Rationale
- AGAIN resets a card's interval to day 1, which can feel punishing for learners who
  simply need more time rather than a full reset. Removing it simplifies the mental model.
- HARD/GOOD/EASY still give the SM-2 algorithm meaningful input, preserving scheduling
  accuracy and keeping CEFR/progress tracking valid.
- No backend changes are needed: the DTO still accepts all four grades; the UI just never
  sends AGAIN.

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|-------------|
| Remove all grading (Next-only, auto-GOOD) | Useful for speed but loses all recall quality signal; CEFR accuracy becomes meaningless |
| Keep all four grades unchanged | AGAIN is confusing/discouraging for casual learners; scope of this feature is simplification |
| Replace AGAIN with a "Skip" that doesn’t update SM-2 | Adds complexity; YAGNI |

---

## 2. Keyboard Navigation Pattern (FR-004, FR-005)

### Decision
Two keyboard shortcuts:
1. **Space** (when front is visible) → reveal answer (same as clicking “Show Answer”)
2. **Enter or Right Arrow** (when answer is revealed) → grade as Good + advance

Both are gated on:
- Correct card state (`revealed` flag)
- No text input is focused (`document.activeElement` is not INPUT/TEXTAREA)

Call `event.preventDefault()` on Space to prevent page scroll.

### Rationale
- **Space to reveal**: Natural convention; mirrors physical flashcard flip.
- **Enter/Right Arrow as Good shortcut ("Next")**: Most common outcome in a session is
  Good — representing average successful recall. A single key press for the most frequent
  action maximises study speed while keeping explicit Hard/Easy accessible via buttons.
- Learners can still click Hard or Easy buttons for accurate tracking; the keyboard shortcut
  is a speed aid, not a replacement for the full grading UI.

### Implementation Note
Use `useEffect` + `window.addEventListener('keydown', handler)` in the study page component.
Add cleanup on unmount. Re-register on `revealed` state change.

---

## 3. Session Summary UI (FR-008, FR-009)

### Decision
Keep the session summary largely unchanged. Remove only the “Again” row/count from the
grade breakdown grid. Adjust the grid from 4 columns to 3 columns (Hard / Good / Easy).
The accuracy percentage display remains because grades are now real user input.

### Rationale
- Displaying a real accuracy percentage (based on GOOD + EASY ÷ total) is meaningful and
  motivating when actual user grades are recorded.
- Removing only the AGAIN column requires a minor layout change (4 → 3 column grid).

---

## 4. Affected Files — Summary

| Layer | File | Change Type |
|-------|------|-------------|
| Frontend component | `frontend/components/GradeBar/GradeBar.tsx` | Modify: remove AGAIN button, change grid to 3 columns |
| Frontend hook | `frontend/hooks/useSession.ts` | Modify: add keyboard handler logic (Space=reveal, Enter/Arrow=Good grade) |
| Frontend page | `frontend/app/study/[sessionId]/page.tsx` | Modify: add Space/Enter/ArrowRight keyboard listener via useEffect |
| Frontend component | `frontend/components/SessionSummary/SessionSummary.tsx` | Modify: remove Again from grade grid, adjust to 3 columns |
| Backend | All backend files | **No changes needed** |
| DB schema | `prisma/schema.prisma` | **No changes needed** |

---

## 5. Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Keyboard listener fires during text input | Low | Guard with `activeElement` check |
| Learners accidentally press Enter/Arrow and get Good instead of Easy | Low | Hard and Easy buttons remain prominently visible; keyboard shortcut is opt-in |
| Space press scrolls the page before `preventDefault` | Low | Call `event.preventDefault()` in the handler |
| Existing unit tests for `GradeBar` / `useSession` break | High | Update tests: remove AGAIN cases, add keyboard shortcut test cases |
