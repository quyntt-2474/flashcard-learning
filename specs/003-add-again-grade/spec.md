# Feature Specification: Add 'Again' Grade Back to SM-2 Grading UI

**Feature Branch**: `003-add-again-grade`
**Created**: 2026-06-04
**Status**: Draft
**Input**: User description: "Thêm lại điểm đánh giá 'Again' vào khung đánh giá của thuật toán SM-2"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Grade a Card as 'Again' During Study (Priority: P1)

A learner is studying and encounters a card they cannot recall at all. After flipping
the card, they see a four-button grading bar — Again, Hard, Good, Easy — and can tap
"Again" (or press keyboard key `1`) to mark the card as failed. The SM-2 algorithm
resets that card's interval to 1 and repetition counter to 0, scheduling it for
imminent review. The session continues to the next card.

**Why this priority**: The 'Again' (failed recall) path is fundamental to the SM-2
algorithm. Without it, learners cannot express a complete failure to recall a word,
causing the algorithm to schedule cards too aggressively.

**Independent Test**: Open any deck with due cards, flip a card, click "Again", and
confirm the next card is shown. After completing the session, verify the session
summary shows the Again count.

**Acceptance Scenarios**:

1. **Given** the card back is revealed, **When** the user views the grading controls, **Then** four grade buttons are visible: Again, Hard, Good, Easy (in that order).
2. **Given** the card back is revealed, **When** the user clicks the "Again" button, **Then** the grade is recorded as AGAIN, the SM-2 algorithm resets the card's interval to 1 and repetitions to 0, and the next card is shown.
3. **Given** the card back is revealed, **When** the user presses key `1`, **Then** the card is graded as Again (equivalent to clicking the Again button).
4. **Given** the card back is revealed, **When** the user presses key `2`, **Then** the card is graded as Hard.
5. **Given** the card back is revealed, **When** the user presses key `3`, **Then** the card is graded as Good.
6. **Given** the card back is revealed, **When** the user presses key `4`, **Then** the card is graded as Easy.
7. **Given** the card back is revealed and Enter or Right Arrow is pressed, **Then** the card is still graded as Good (existing "Quick Next" shortcut preserved).

---

### User Story 2 - Session Summary Shows Again Count (Priority: P2)

After completing a session that includes Again grades, the session summary shows a
four-column breakdown: Again / Hard / Good / Easy with respective counts. Accuracy
is recalculated so that Again counts as incorrect (0 accuracy contribution).

**Why this priority**: Seeing the Again count gives the learner feedback on which cards
need the most work. The accuracy calculation must be consistent with the full grade set.

**Independent Test**: Complete a session mixing Again, Hard, Good, and Easy grades.
Confirm the summary shows all four counts and the accuracy percentage reflects
(Hard + Good + Easy) / total × 100.

**Acceptance Scenarios**:

1. **Given** a completed session, **When** the summary screen is shown, **Then** the "Again" count is displayed alongside Hard, Good, and Easy.
2. **Given** a completed session with N Again grades, **When** the summary accuracy is shown, **Then** accuracy = (total − again) / total × 100 (rounded).
3. **Given** a completed session with 0 Again grades, **When** the summary is shown, **Then** Again count reads 0 and accuracy is 100% (if all Good/Easy) or reflects Hard.

---

### Edge Cases

- What if all cards in a session are graded Again? → Session completes normally; accuracy = 0%.
- What happens when a user presses `1`–`4` before the card is revealed? → Keyboard grade shortcuts are inactive when the card back is not yet shown.
- What if keyboard events conflict with text input? → Grade shortcuts only fire when no text input/textarea is focused (existing guard preserved).
- What about the existing Enter/ArrowRight "Quick Good" shortcut? → It is preserved unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: After a card's answer is revealed, the system MUST display exactly four grade buttons: Again, Hard, Good, and Easy (in that order, left to right).
- **FR-002**: The Again button MUST submit grade `AGAIN` through the existing `/sessions/:id/review` endpoint.
- **FR-003**: Pressing keyboard key `1` when the card back is visible MUST grade the card as Again.
- **FR-004**: Pressing keyboard key `2` when the card back is visible MUST grade the card as Hard.
- **FR-005**: Pressing keyboard key `3` when the card back is visible MUST grade the card as Good.
- **FR-006**: Pressing keyboard key `4` when the card back is visible MUST grade the card as Easy.
- **FR-007**: Pressing Enter or Right Arrow when the card back is visible MUST still grade the card as Good (backward-compatible shortcut).
- **FR-008**: Grade numeric shortcuts (`1`–`4`) MUST NOT fire when a text input or textarea element is focused.
- **FR-009**: Grade numeric shortcuts MUST NOT fire when the card front is showing (i.e., not yet revealed).
- **FR-010**: The session summary screen MUST display the Again count alongside Hard, Good, and Easy counts.
- **FR-011**: The session summary accuracy percentage MUST be calculated as `(hard + good + easy) / totalCards × 100` (Again = incorrect).

### Key Entities

- **Grade**: `AGAIN | HARD | GOOD | EASY` — already defined in the Prisma schema and backend type system; no migration required.
- **GradeBar**: Frontend component that renders the grade buttons; updated to four columns with keyboard shortcut hints.
- **SessionSummary**: Frontend component displaying the post-session breakdown; updated to include an Again column.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Again button is visible and clickable on all viewport sizes (≥ 320 px).
- **SC-002**: Pressing `1` when the card is revealed grades the card as Again in 100% of activations.
- **SC-003**: The session summary correctly shows the Again count for every completed session.
- **SC-004**: The accuracy percentage in the summary equals (Hard + Good + Easy) / total × 100, verified by a unit test.
- **SC-005**: All four keyboard shortcuts (`1`–`4`) are inactive while the card front is showing or a text field is focused.

## Assumptions

- The backend already stores and processes `AGAIN` grades correctly (SM-2 reset logic is in place).
- The `SessionSummaryData` type already includes the `again` field in the API response; no backend changes to the summary endpoint are needed.
- No database migration is required because the `Grade` enum already contains `AGAIN`.
- The existing `Enter`/`ArrowRight` → Good shortcut is preserved without change.
