# Tasks: Simplify Study Grading — Keyboard Shortcuts + Remove AGAIN

**Input**: Design documents from `specs/002-simplify-study-grading/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api.md ✅ | quickstart.md ✅

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US1]**, **[US2]**: Which user story this task belongs to

---

## Phase 1: User Story 1 — Grade Selection + Keyboard Shortcuts (Priority: P1) 🎯 MVP

**Goal**: Remove AGAIN grade button; add Space to reveal and Enter/Right Arrow to grade as Good.

**Independent Test**: Open any study session — verify no AGAIN button; press Space to reveal answer; press Enter to advance; confirm SM-2 grades card correctly.

- [X] T001 [P] [US1] Update `frontend/components/GradeBar/GradeBar.tsx` — remove AGAIN entry from the `GRADES` array, update keyboard hint keys (Hard=1, Good=2, Easy=3), change grid class from `grid-cols-4` to `grid-cols-3`
- [X] T002 [P] [US1] Verify `handleReveal` is returned from `frontend/hooks/useSession.ts`; if not already exported, add it to the return object (no logic change needed)
- [X] T003 [US1] Add `useEffect` keyboard handler to `frontend/app/study/[sessionId]/page.tsx` — Space when front visible → `handleReveal()`; Enter or ArrowRight when revealed → `handleGrade('GOOD')`; guard both against INPUT/TEXTAREA focus; call `event.preventDefault()` on Space

**Parallel opportunities**: T001 and T002 can be implemented simultaneously (different files). T003 depends on T002 being confirmed.

**Checkpoint**: US1 complete — keyboard navigation fully working with 3-button grading.

---

## Phase 2: User Story 2 — Session Summary Update (Priority: P2)

**Goal**: Remove Again column from session summary; keep Hard/Good/Easy counts and accuracy percentage.

**Independent Test**: Complete a session mixing Hard, Good, Easy grades — confirm summary shows 3 columns (no Again), correct counts per grade, and a meaningful accuracy percentage.

- [X] T004 [P] [US2] Update `frontend/components/SessionSummary/SessionSummary.tsx` — remove the Again entry from the grade breakdown array, change grid class from `grid-cols-4` to `grid-cols-3`

**Parallel opportunities**: T004 is fully independent — it can be done in parallel with Phase 1 tasks (different file, different component).

**Checkpoint**: US2 complete — session summary reflects accurate three-grade data.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T005 End-to-end smoke test: study a deck, verify (1) no AGAIN button visible, (2) Space reveals answer, (3) Enter/Right Arrow grades as Good and advances, (4) Hard and Easy buttons still function, (5) session summary shows 3-column breakdown with real accuracy %

---

## Dependency Graph

```
T001 ──────────────────┐
T002 ──► T003          ├──► T005
T004 ──────────────────┘
```

- T001 and T002 → no dependencies, parallel
- T004 → no dependencies, parallel with all Phase 1 tasks
- T003 → depends on T002 (needs handleReveal confirmed)
- T005 → depends on all prior tasks

---

## Parallel Execution Examples

**Maximum parallelism (3 agents)**:
- Agent A: T001 (GradeBar)
- Agent B: T002 (useSession hook verification)
- Agent C: T004 (SessionSummary)

Then:
- Agent A or B: T003 (keyboard handler in study page, after T002)
- Agent A: T005 (smoke test, after all)

---

## Implementation Strategy

**MVP** (Phase 1 only): Delivers the full keyboard UX improvement and simplified grading UI. US2 is a cosmetic cleanup of the summary — Phase 1 alone is shippable.

**Total tasks**: 5
- US1: 3 tasks (T001–T003)
- US2: 1 task (T004)
- Polish: 1 task (T005)
