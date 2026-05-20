# Feature Specification: Flashcard English Learning App (Consolidated)

**Last updated**: 2026-05-20
**Status**: Active

---

## User Scenarios & Testing

### User Story 1 - Browse Topics and Start Studying (Priority: P1)

A learner opens the app and lands on the Home page. They see vocabulary categories
(e.g., Travel, Business, Daily Life), pick one that interests them, and immediately
start a study session from the default deck in that category. Cards appear one at a
time — English word/phrase on the front; the learner thinks of the answer, then reveals
the back (by tapping "Show Answer" or pressing Space) and selects a recall grade
(Hard / Good / Easy). At the end of the session, a summary shows how many cards were
reviewed and the accuracy rate.

**Why this priority**: This is the complete core learning loop. Without it there is no
product. All other stories extend or enrich this loop.

**Independent Test**: A first-time visitor can open the app, tap a category on the Home
page, flip through all cards in the default deck using only the keyboard (Space to
reveal, Enter/Right Arrow to grade as Good), and see a session summary — all without
any prior setup or login.

**Acceptance Scenarios**:

1. **Given** the Home page is open, **When** the user taps a category tile, **Then** a deck overview page shows the category name, total card count, and a "Start Studying" button.
2. **Given** the deck overview page is shown, **When** the user taps "Start Studying", **Then** the first due card is displayed with only its front (English side) visible.
3. **Given** a card is shown front-side only, **When** the user taps "Show Answer" or presses Space, **Then** the back of the card (definition / translation) is revealed.
4. **Given** the card back is revealed, **When** the user views the grading controls, **Then** only Hard, Good, and Easy buttons are visible — no Again button.
5. **Given** the card back is revealed, **When** the user selects a grade (Hard / Good / Easy), **Then** the next due card is shown and the previous card's next review date is computed by the SM-2 algorithm.
6. **Given** the card back is revealed, **When** the user presses Enter or Right Arrow, **Then** the card is graded as Good and the next card is shown.
7. **Given** a card is showing its front side, **When** the user presses Enter or Right Arrow, **Then** nothing happens (the shortcut is inactive before reveal).
8. **Given** all due cards in the session have been graded, **When** the last card is graded, **Then** a session summary screen is shown with total cards reviewed, per-grade breakdown (Hard/Good/Easy), and overall accuracy percentage.
9. **Given** the session summary is shown, **When** the user taps "Finish" or "Back to Deck", **Then** they return to the Home or Deck page.

---

### User Story 2 - Create and Manage Personal Decks & Cards (Priority: P2)

A learner wants to build their own vocabulary deck. They navigate to a "My Decks" area,
create a new deck with a title and optional category, then add cards with a front
(English word/phrase) and a back (Vietnamese meaning or English definition). They can
also edit or delete existing cards.

**Why this priority**: Personal decks multiply the app's value. Without this, learners
are limited to pre-loaded content and cannot tailor the experience.

**Independent Test**: Create a new deck titled "Test Deck", add 3 cards, edit one card,
delete one card, then start a study session on the deck — all without using any
pre-loaded content.

**Acceptance Scenarios**:

1. **Given** the Home or My Decks page, **When** the user taps "New Deck", **Then** a form is shown for deck title and category.
2. **Given** the deck creation form is filled, **When** the user submits, **Then** the new deck appears in the deck list with zero cards.
3. **Given** a deck detail page, **When** the user taps "Add Card", **Then** a form appears for front text and back text.
4. **Given** the add card form is filled, **When** the user saves, **Then** the card appears in the deck's card list.
5. **Given** an existing card is shown, **When** the user edits its front or back text and saves, **Then** the updated text is displayed.
6. **Given** an existing card, **When** the user deletes it, **Then** the card is removed from the deck and will not appear in future sessions.
7. **Given** a deck with at least one card, **When** the user taps "Study Now", **Then** a session begins with that deck's due cards.

---

### User Story 3 - View Proficiency Level and Progress (Priority: P3)

After accumulating review history, the learner can view their estimated English
proficiency level (A1 through C2 on the CEFR scale) alongside performance statistics:
cards mastered, accuracy per category, and study streak.

**Why this priority**: Level feedback and progress visibility are key motivation drivers.
Without them, learners lack long-term goals and a sense of advancement.

**Independent Test**: After grading at least 20 cards (mix of Hard / Good / Easy),
navigate to the Progress page and confirm a CEFR level badge, a mastery count, and an
accuracy percentage are all displayed.

**Acceptance Scenarios**:

1. **Given** fewer than 20 total card reviews have been recorded, **When** the user visits the Progress page, **Then** a message explains that more reviews are needed to estimate the level.
2. **Given** 20 or more card reviews have been recorded, **When** the user visits the Progress page, **Then** a CEFR level badge (A1–C2) is prominently displayed alongside the accuracy rate that determined it.
3. **Given** multiple categories have been studied, **When** the Progress page is viewed, **Then** per-category accuracy is broken down in the statistics section.
4. **Given** the user has studied on consecutive days, **When** the Progress page is viewed, **Then** the current study streak (days in a row) is shown.
5. **Given** any card reaches the "mastered" threshold (consecutive Good/Easy responses meeting algorithm criteria), **When** the user views deck stats, **Then** the mastered card count is incremented.

---

### User Story 4 - Review Due Cards from the Home Page (Priority: P4)

Returning learners open the app and are immediately shown which decks have cards due for
review today. They can start a review session with a single tap, without needing to
navigate to individual deck pages.

**Why this priority**: Reducing friction for daily review is critical for maintaining the
spaced repetition schedule. Without this, users lose the compounding benefit of the algorithm.

**Independent Test**: After completing a session that produces cards due tomorrow,
reopen the app the next day. The Home page must show a due-count badge on the relevant
deck and allow a one-tap launch of the review session.

**Acceptance Scenarios**:

1. **Given** the Home page is open, **When** any deck has cards due today or overdue, **Then** the deck tile shows a badge with the due card count.
2. **Given** a deck tile shows a due count badge, **When** the user taps "Review Now" on a deck, **Then** the session starts with only the due/overdue cards for that deck.
3. **Given** no cards are due today, **When** the user opens the Home page, **Then** a friendly message confirms there is nothing to review and shows the next upcoming due date.

---

### Edge Cases

- What happens when a user starts a session on a deck with no cards? → Show an empty-state message with a prompt to add cards.
- What happens when a deck has only one card? → Selecting a grade or pressing the Next key on the single revealed card ends the session and shows the summary.
- What happens if the user closes the app mid-session? → Session progress for already-graded cards is saved and restored on next open; ungraded cards appear again in the next session.
- What happens if the user navigates back (browser back button) mid-session? → Navigating back exits the session; only already-submitted grades are saved.
- What happens when a deck is deleted? → All cards in the deck and their review history are removed.
- What happens on a very narrow screen (320 px)? → Grade buttons stack vertically and remain tappable (min 44×44 px each) without horizontal scrolling.
- What if keyboard events conflict with text input on the page? → Keyboard shortcuts only fire when no text input or textarea is focused.
- What happens if a user presses Space while the answer is already revealed? → Nothing; Space is only active when the front side is showing.

---

## Requirements

### Functional Requirements

#### Core App
- **FR-001**: System MUST display a Home page with category tiles for browsing vocabulary topics.
- **FR-002**: System MUST provide at least 5 pre-loaded vocabulary categories (e.g., Travel, Business, Daily Life, Food & Drink, Technology).
- **FR-003**: System MUST allow users to create named decks associated with a category.
- **FR-004**: System MUST allow users to add cards to a deck, each with a front (English) and a back (definition or translation).
- **FR-005**: System MUST allow users to edit and delete existing cards.
- **FR-006**: System MUST allow users to edit and delete existing decks.
- **FR-007**: System MUST present cards one at a time during a study session, showing only the front initially.
- **FR-008**: System MUST reveal the card back when the user explicitly requests it ("Show Answer" button or Space key).
- **FR-009**: System MUST present exactly three grade buttons — Hard, Good, and Easy — after the card back is revealed. No "Again" button is displayed.
- **FR-010**: System MUST compute the next review date for each card using the SM-2 spaced repetition algorithm based on the grade given (Hard / Good / Easy).
- **FR-011**: System MUST only include cards whose due date is today or earlier in a new review session.
- **FR-012**: System MUST display a session summary (total reviewed, Hard/Good/Easy breakdown, accuracy %) when all due cards in a session are graded. No "Again" count is shown.
- **FR-013**: System MUST display a due-card count badge on each deck tile on the Home page when cards are due.
- **FR-014**: System MUST persist all decks, cards, and review history without requiring authentication.
- **FR-015**: System MUST calculate and display an estimated CEFR proficiency level (A1, A2, B1, B2, C1, C2) after a minimum of 20 card reviews.
- **FR-016**: System MUST display per-category accuracy and a study-streak count on a Progress page.
- **FR-017**: All UI views MUST be fully usable on mobile viewports starting at 320 px width.
- **FR-018**: Grade buttons MUST meet a minimum touch target size of 44 × 44 px on mobile viewports.

#### Keyboard Shortcuts
- **FR-019**: Pressing Space when a card front is visible MUST reveal the card back (same as tapping "Show Answer").
- **FR-020**: Pressing Enter or Right Arrow when the card back is visible MUST grade the card as Good and advance to the next card.
- **FR-021**: Keyboard shortcuts (Space, Enter, Right Arrow) MUST NOT fire when a text input or textarea element is focused.

### Key Entities

- **Category**: A thematic grouping of vocabulary (e.g., Travel, Business). Has a title and an icon/colour.
- **Deck**: A collection of flashcards. Belongs to one Category. Has a title and a creation date. Can be pre-loaded (read-only) or user-created (editable).
- **Card**: A single flashcard. Belongs to one Deck. Has a front (English word/phrase) and a back (definition or translation). Stores scheduling state: `easeFactor`, `interval` (days), `repetitions`, `dueDate`.
- **StudySession**: One sitting of reviewing cards from a deck. Records start time, end time, and total cards reviewed.
- **CardReview**: A single grading event for one card within a session. Records the grade given (Hard/Good/Easy — AGAIN is preserved in the data layer for backward compatibility only), the timestamp, and the resulting next-due date.
- **ProgressRecord**: Aggregated statistics per user (accuracy rate, mastered card count, study streak, estimated CEFR level).

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: A learner can complete a 10-card review session in under 5 minutes from deck selection to session summary.
- **SC-002**: All views render correctly and are fully usable on a 320 px wide viewport with no horizontal scrolling required.
- **SC-003**: Grade buttons on mobile are tappable with a single finger without accidental mis-taps, meeting a 44 × 44 px minimum touch target.
- **SC-004**: A learner can create a new deck with 5 cards in under 3 minutes.
- **SC-005**: A CEFR level estimate is displayed after a minimum of 20 card reviews with no additional user action.
- **SC-006**: Cards graded "Easy" are not shown again for at least 4 days; cards graded "Hard" receive a reduced interval compared to Good.
- **SC-007**: The Home page correctly shows the due-card count for each deck, refreshing on each visit without requiring a manual sync.
- **SC-008**: The app loads and is fully functional on a mid-range mobile device within 3 seconds on a standard Wi-Fi connection.
- **SC-009**: Users can complete an entire study session using only the keyboard — Space to reveal, Enter or Right Arrow to grade as Good — without touching the mouse.
- **SC-010**: Zero instances of an "Again" button appear on any screen during an active study session.
- **SC-011**: Keyboard shortcuts (Space, Enter, Right Arrow) trigger their respective actions reliably when the correct card state is active and no input field is focused.

---

## Assumptions

- No user authentication is required; all data is stored server-side scoped by a browser-generated `clientId`.
- CEFR level estimation is based on the learner's card accuracy history, not a formal adaptive exam.
- Pre-loaded decks include sample vocabulary cards for each category and are read-only (cannot be deleted by the user).
- The default card back language is Vietnamese translation; users may enter any language for personal cards.
- Daily review scheduling is based on calendar days in the user's local timezone.
- Study streak counts consecutive calendar days on which at least one review session was completed.
- The CEFR level mapping uses the following accuracy thresholds: < 40 % → A1, 40–54 % → A2, 55–64 % → B1, 65–74 % → B2, 75–84 % → C1, ≥ 85 % → C2.
- The "Show Answer" button remains on screen; Space is an additional shortcut, not a replacement.
- The Enter / Right Arrow shortcut defaults to Good grade; learners who want Hard or Easy must use the on-screen buttons.
- The AGAIN grade is preserved in the database schema and backend API for backward compatibility; it is simply never sent from the UI.
- Mobile touch targets for the three grade buttons must meet the existing 44 × 44 px minimum size requirement.
- The feature applies to all study sessions (pre-loaded category decks and personal decks); no mode toggle is introduced.
