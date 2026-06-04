# Tasks: Add 'Again' Grade Back to SM-2 Grading UI

**Input**: Design documents from `specs/003-add-again-grade/`
**Branch**: `003-add-again-grade`
**Total tasks**: 7 | **Parallelizable**: 6 of 7

> **Scope reminder**: All changes are **frontend-only** (3 files). Backend,
> schema, and API contracts are already complete and require no modification.

---

## Phase 1: User Story 1 — Grade a Card as 'Again' During Study (Priority: P1) 🎯 MVP

**Goal**: Restore the Again button and add numeric keyboard shortcuts 1–4 so
learners can express complete failure to recall a card.

**Independent Test**: Open any deck, start a study session, flip a card →
confirm four buttons (Again / Hard / Good / Easy) appear; press `1` → card
advances; press `2`/`3`/`4` before reveal → nothing happens.

### Tests for User Story 1 (Constitution IV — write first, must fail before implementation)

- [X] T001 [P] [US1] Write failing tests for GradeBar: renders 4 buttons in order (Again/Hard/Good/Easy), clicking Again calls `onGrade("AGAIN")`, key-hint spans show `[1]`–`[4]` in `frontend/components/GradeBar/GradeBar.test.tsx`
- [X] T002 [P] [US1] Write failing tests for study page keyboard shortcuts: key `1` fires `handleGrade("AGAIN")`, keys `2`/`3`/`4` fire Hard/Good/Easy, keys inactive when `revealed=false`, keys inactive when input is focused in `frontend/app/study/[sessionId]/page.test.tsx`

### Implementation for User Story 1

- [X] T003 [P] [US1] Add `{ grade: 'AGAIN', label: 'Again', color: 'bg-rose-500 hover:bg-rose-600', key: '1' }` as first entry in `GRADES`; shift Hard/Good/Easy keys to `[2]`/`[3]`/`[4]`; change grid to `grid-cols-4` in `frontend/components/GradeBar/GradeBar.tsx`
- [X] T004 [P] [US1] Add `else if (e.key === "1") handleGrade("AGAIN")` / `"2"→HARD` / `"3"→GOOD` / `"4"→EASY` branches inside the existing `revealed` block of the `useEffect` keydown listener in `frontend/app/study/[sessionId]/page.tsx`

**Checkpoint**: T001 and T002 tests pass; four-button GradeBar renders correctly; all five keyboard shortcuts (Space / Enter / ArrowRight / 1–4) work as specified.

---

## Phase 2: User Story 2 — Session Summary Shows Again Count (Priority: P2)

**Goal**: Surface the `again` field (already returned by the backend) in the
session summary so learners can see how many cards they failed.

**Independent Test**: Complete a session with at least one Again grade →
summary shows Again count column; accuracy = (Hard + Good + Easy) / total × 100.

### Tests for User Story 2

- [X] T005 [P] [US2] Write failing test for SessionSummary: renders `again` count in a dedicated column, uses rose colour, grid has 4 columns in `frontend/components/SessionSummary/SessionSummary.test.tsx`

### Implementation for User Story 2

- [X] T006 [US2] Add `{ label: 'Again', value: summary.again, color: 'text-rose-500' }` as first item in the grade-breakdown array; switch grid to `grid-cols-4` in `frontend/components/SessionSummary/SessionSummary.tsx`

**Checkpoint**: T005 test passes; summary displays four grade columns; accuracy formula unchanged (backend already excludes Again from correct count).

---

## Phase 3: Polish & Cross-Cutting Concerns

- [X] T007 [P] Run full manual smoke test per `specs/003-add-again-grade/quickstart.md`: 4-button bar visible at 320 px, all keyboard shortcuts work, summary shows correct Again count and accuracy

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** and **Phase 2** are **independent** — they touch different files and can proceed in parallel once a developer is available.
- **Polish (Phase 3)**: depends on Phase 1 and Phase 2 completion.

### Within Phase 1

```
T001 (write GradeBar tests)  ──→ T003 (implement GradeBar)
T002 (write page tests)      ──→ T004 (implement keyboard shortcuts)
```

T001 and T002 are parallel. T003 and T004 are parallel (different files). T003 depends on T001; T004 depends on T002.

### Within Phase 2

```
T005 (write SessionSummary test) ──→ T006 (implement SessionSummary)
```

### Full Order

```
[T001, T002, T005]   ← all parallel (different files)
      ↓
[T003, T004, T006]   ← all parallel after respective tests exist
      ↓
     T007
```

---

## Parallel Execution Examples

**Solo developer** (sequential, TDD):
```
T001 → T003 → T002 → T004 → T005 → T006 → T007
```

**Two developers**:
```
Dev A: T001 → T003 → T007 (wait)
Dev B: T002 → T004 → T005 → T006 → T007
```

**Three developers**:
```
Dev A: T001 → T003
Dev B: T002 → T004
Dev C: T005 → T006
All: T007
```

---

## Implementation Strategy

**MVP** (User Story 1 only — T001–T004): Delivers the Again button and keyboard
shortcuts. Learners can grade cards as Again. Session summary still shows 3 columns.

**Full delivery** (all tasks): Both US1 and US2 complete; session summary shows
all four grade counts and correct accuracy.

---

## Format Validation

All tasks follow the required checklist format:
`- [ ] [TaskID] [P?] [Story?] Description with file path`

| Task | Checkbox | ID | P? | Story? | File path |
|------|----------|----|----|--------|-----------|
| T001 | ✅ | ✅ | ✅ | ✅ US1 | ✅ |
| T002 | ✅ | ✅ | ✅ | ✅ US1 | ✅ |
| T003 | ✅ | ✅ | ✅ | ✅ US1 | ✅ |
| T004 | ✅ | ✅ | ✅ | ✅ US1 | ✅ |
| T005 | ✅ | ✅ | ✅ | ✅ US2 | ✅ |
| T006 | ✅ | ✅ | — | ✅ US2 | ✅ |
| T007 | ✅ | ✅ | ✅ | — | ✅ |
