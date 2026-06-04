<!--
## Sync Impact Report
- Version change: (new) → 1.0.0
- Added sections: Core Principles (I–V), Tech Stack & Quality Standards, Development Workflow, Governance
- Removed sections: N/A (initial ratification)
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ compatible (Constitution Check section present)
  - .specify/templates/spec-template.md ✅ compatible (user stories + requirements structure intact)
  - .specify/templates/tasks-template.md ✅ compatible (phase structure supports TDD workflow)
- Follow-up TODOs: None — all placeholders resolved
-->

# Flashcard Learning Constitution

## Core Principles

### I. Spaced Repetition Algorithm (NON-NEGOTIABLE)

The SM-2 algorithm (or a compatible variant) MUST be the sole engine for computing
review intervals. Scheduling logic MUST NOT be hard-coded or bypassed by any feature.

- Grade inputs (Again / Hard / Good / Easy) MUST map to defined ease-factor adjustments
  before any interval calculation is performed.
- Review due-dates MUST be derived exclusively from algorithm output; manual overrides
  are not permitted unless explicitly modelled as an algorithm input.
- The scheduling module MUST be isolated as a pure, side-effect-free function so it
  can be unit-tested in isolation.

**Rationale**: Spaced repetition is the core value proposition. Any drift from the
algorithm undermines the product's primary purpose.

### II. User-Owned Content & Data Isolation

Every Deck, Card, and Study Session belongs to exactly one authenticated user.
Cross-user data access MUST be prevented at the service boundary.

- All database queries involving user content MUST be scoped by `user_id`.
- No authenticated user MAY read, modify, or delete another user's data.
- Authorization checks MUST be enforced at the service/controller layer, not only
  at the UI layer.

**Rationale**: Content privacy is a baseline trust requirement; violations expose
both legal risk and user trust damage.

### III. Mobile-First, Responsive UI (NON-NEGOTIABLE)

All views MUST be usable on mobile viewports starting at 320 px width.

- Interactive touch targets (buttons, cards, inputs) MUST be at least 44 × 44 px.
- Layouts MUST adapt gracefully across three breakpoints: mobile (< 768 px),
  tablet (768–1024 px), and desktop (> 1024 px).
- Study session flows (card flip, grading buttons) MUST be optimised for one-handed
  mobile use: grade buttons MUST appear within thumb reach at the bottom of the screen.

**Rationale**: The primary use-case is short review sessions during commutes or breaks;
a broken mobile experience eliminates the product's key usage window.

### IV. Test-Driven Development

Core algorithm scheduling logic MUST have unit tests written and reviewed before
implementation begins. Tests MUST fail before the implementation is written (red phase).

- Service-layer logic (deck CRUD, session lifecycle, card scheduling) MUST have
  integration tests covering the happy path and the primary error paths.
- Acceptance criteria defined in each feature spec MUST map 1-to-1 to at least one
  automated test before the story is marked complete.
- The Red-Green-Refactor cycle is enforced for all scheduling and domain logic;
  UI-only changes may use snapshot / E2E tests as the primary gate.

**Rationale**: The scheduling algorithm is mathematically precise; regressions are
invisible without automated coverage.

### V. Simplicity & YAGNI

Features are built to satisfy stated requirements only. No speculative generalisation,
no premature optimisation.

- Additional complexity (extra config flags, plugin architecture, advanced analytics)
  MUST be justified by a concrete, accepted user story before implementation starts.
- Start with the simplest data model that satisfies the current sprint; evolve through
  migrations rather than over-engineering upfront.
- Dependencies MUST be evaluated for necessity; prefer standard library or well-known
  ecosystem packages over custom solutions.

**Rationale**: An over-engineered MVP ships late and accrues maintenance debt before
any user feedback is received.

## Tech Stack & Quality Standards

**Project type**: Web application (responsive, mobile-first)

**Recommended stack** (can be overridden per feature plan, but constitution compliance
still applies):

| Layer | Choice |
|-------|--------|
| Frontend | React / Vue / Svelte (SPA) with CSS responsive framework |
| Backend | Node.js (Express / Fastify) or Python (FastAPI / Django) |
| Database | PostgreSQL (relational; required for per-user scoping) |
| Scheduling | Isolated module implementing SM-2 (unit-testable pure function) |
| Testing | Jest / Vitest (frontend), pytest / Jest (backend), Playwright (E2E) |

**Quality gates** (all MUST pass before merge):

- Unit test coverage ≥ 80 % for scheduling module.
- All mobile breakpoints (320 px, 375 px, 768 px) verified via responsive testing.
- No open HIGH or CRITICAL severity security issues (OWASP Top 10 scan).
- Linting and formatting checks pass (zero errors, warnings allowed only for TODO items).

## Development Workflow

- Feature work begins only after a spec (`spec.md`) is approved and a plan (`plan.md`)
  exists with a passing Constitution Check.
- Tasks are implemented in dependency order; parallel tasks (tagged `[P]`) MAY be
  worked concurrently.
- Every PR MUST reference the user story it addresses and include evidence that
  its acceptance criteria are met (test output or screenshot for UI changes).
- The `main` branch MUST remain deployable at all times; feature branches are merged
  only when all quality gates pass.
- Database migrations MUST be reversible; every `up` migration MUST have a
  corresponding `down` migration.

## Governance

This constitution supersedes all other development practices and informal conventions.
Any deviation requires a formal amendment:

1. Propose the change with rationale (open a discussion or PR against this file).
2. Increment the version following semantic versioning (see below).
3. Update all dependent templates and document the change in the Sync Impact Report
   comment at the top of this file.
4. Obtain at least one peer review before merging.

**Versioning policy**:
- MAJOR — backward-incompatible governance change (removing or redefining a principle).
- MINOR — new principle or section added, or material guidance expanded.
- PATCH — clarification, wording fix, typo correction.

All PRs and code reviews MUST verify compliance with the five Core Principles.
Complexity introduced beyond what a user story requires MUST be justified in the PR
description or it will be rejected.

**Version**: 1.0.0 | **Ratified**: 2026-04-29 | **Last Amended**: 2026-04-29
