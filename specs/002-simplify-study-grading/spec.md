# Feature Specification: Simplify Study Grading — Keyboard Shortcuts + Remove AGAIN

**Feature Branch**: `002-simplify-study-grading`
**Created**: 2026-05-17
**Status**: Draft
**Input**: User description: "Giữ lại việc đánh giá HARD/GOOD/EASY khi thực hiện reveal nghĩa một từ. Có thể sử dụng phím 'next' để sang từ tiếp theo và 'space' để reveal nghĩa."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Study Cards with Grade Selection and Keyboard Shortcuts (Priority: P1)

A learner opens a study session for a deck. Cards appear one at a time — the English
word/phrase is shown on the front. The learner can press the Space key to reveal the
back (definition / translation) without reaching for a mouse. After revealing, three
grade buttons appear — Hard, Good, Easy — and the learner selects one to record their
recall quality and advance to the next card. Alternatively, pressing the designated
"Next" keyboard key (Enter or Right Arrow) acts as a shortcut for the Good grade and
advances immediately. The AGAIN grade is removed from this flow.

**Why this priority**: This is the complete core study loop with improved keyboard
accessibility. Keyboard shortcuts enable faster review sessions without mouse interaction.

**Independent Test**: Open any deck with due cards, flip through all cards using only
the keyboard (Space to reveal, Enter/Right Arrow to grade as Good, or click
Hard/Good/Easy buttons), and land on the session summary with valid accuracy data.

**Acceptance Scenarios**:

1. **Given** a study session is active and a card is showing its front side, **When** the user presses the Space key, **Then** the back of the card is revealed.
2. **Given** a study session is active and a card is showing its front side, **When** the user taps the "Show Answer" button, **Then** the back of the card is revealed (existing behaviour unchanged).
3. **Given** the card back is revealed, **When** the user views the grading controls, **Then** only Hard, Good, and Easy buttons are visible — no Again button.
4. **Given** the card back is revealed, **When** the user clicks the Hard, Good, or Easy button, **Then** the grade is recorded and the next card is shown with only its front side visible.
5. **Given** the card back is revealed, **When** the user presses the Enter key or Right Arrow key, **Then** the card is graded as Good and the next card is shown.
6. **Given** the last card's back has been revealed, **When** the user selects any grade or presses the Next key, **Then** the session summary screen is shown.
7. **Given** a study session is active and the front side is visible, **When** the user presses Enter or Right Arrow, **Then** nothing happens (the shortcut is inactive before reveal).

---

### User Story 2 - Session Summary with Accurate Progress (Priority: P2)

After completing a session, the learner sees a summary screen showing how many cards
were reviewed, the accuracy percentage, and the grade breakdown (Hard / Good / Easy
counts) — giving meaningful feedback on recall quality.

**Why this priority**: Accurate progress data motivates learners and feeds into the
CEFR level estimate. The summary must reflect real three-grade data.

**Independent Test**: Complete a session deliberately mixing Hard, Good, and Easy
grades; confirm the summary shows correct counts for each grade and a meaningful
accuracy percentage.

**Acceptance Scenarios**:

1. **Given** a completed session, **When** the summary screen is shown, **Then** the total number of cards reviewed is displayed.
2. **Given** a completed session, **When** the user views the summary, **Then** separate counts for Hard, Good, and Easy are shown.
3. **Given** a completed session, **When** the user views the summary, **Then** no "Again" count is displayed.
4. **Given** the session summary, **When** the user taps "Back to Deck" or "Home", **Then** they navigate to the corresponding page.

---

### Edge Cases

- What happens when a deck has only one card? → Selecting a grade or pressing the Next key on the single revealed card ends the session and shows the summary.
- What if the user navigates back (browser back button) mid-session? → Navigating back exits the session; only already-submitted grades are saved.
- What if keyboard events conflict with text input on the page? → Keyboard shortcuts only fire when no text input is focused.
- What happens if a user presses Space while the answer is already revealed? → Nothing; Space is only active when the front side is showing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The study session screen MUST NOT display an AGAIN grade button at any point.
- **FR-002**: After a card's answer is revealed, the system MUST display exactly three grade buttons: Hard, Good, and Easy.
- **FR-003**: Selecting a grade button MUST record the grade for that card through the spaced repetition algorithm and advance to the next card.
- **FR-004**: The system MUST support a keyboard shortcut to reveal the card answer: pressing Space when the card front is visible MUST reveal the back (same as tapping "Show Answer").
- **FR-005**: The system MUST support a "Next" keyboard shortcut: pressing Enter or Right Arrow when the card back is visible MUST grade the card as Good and advance to the next card.
- **FR-006**: Keyboard shortcuts (Space, Enter, Right Arrow) MUST NOT fire when a text input or textarea element is focused on the page.
- **FR-007**: The spaced repetition scheduling MUST use the user's explicitly selected grade (Hard, Good, or Easy) to compute the next review interval via the SM-2 algorithm.
- **FR-008**: The session summary MUST display the total number of cards reviewed, the accuracy percentage, and separate counts for Hard, Good, and Easy grades.
- **FR-009**: The session summary MUST NOT display an "Again" count or row.

### Key Entities

- **Study Session**: Represents an active review of a set of due cards; records a user-selected grade (Hard, Good, or Easy) per card.
- **Card Review**: Records the grade selected by the user (Hard/Good/Easy) and the new due date computed by SM-2. The AGAIN grade is never submitted from the UI (remains valid in the data layer for backward compatibility only).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete an entire study session using only the keyboard — Space to reveal, Enter or Right Arrow to grade as Good — without touching the mouse.
- **SC-002**: The time to reveal a card answer is reduced to a single key press (Space) compared to requiring a mouse click.
- **SC-003**: Zero instances of an "Again" button appear on any screen during an active study session.
- **SC-004**: The session summary accurately reflects the three-grade breakdown (Hard / Good / Easy) and the corresponding accuracy percentage.
- **SC-005**: Keyboard shortcuts (Space, Enter, Right Arrow) trigger their respective actions reliably in 100% of activations when the correct card state is active and no input field is focused.

## Assumptions

- The "Show Answer" button remains on screen; Space is an additional keyboard shortcut for the same action, not a replacement.
- The "Next" keyboard shortcut (Enter / Right Arrow) defaults to Good grade; learners who want to record Hard or Easy must use the on-screen buttons.
- Progress tracking and CEFR level estimation continue to function correctly because real user-selected grades are submitted to the SM-2 algorithm.
- The AGAIN grade is preserved in the database schema and backend API for backward compatibility; it is simply never sent from this UI flow.
- The feature applies to all study sessions (pre-loaded category decks and personal decks); no mode toggle is introduced.
- Mobile touch targets for the three grade buttons must meet the existing 44×44 px minimum size requirement.
