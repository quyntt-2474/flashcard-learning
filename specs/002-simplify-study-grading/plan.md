# Implementation Plan: Simplify Study Grading — Keyboard Shortcuts + Remove AGAIN

**Branch**: `002-simplify-study-grading` | **Date**: 2026-05-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-simplify-study-grading/spec.md`

## Summary

Simplify the study session UX in two ways:
1. **Remove the AGAIN grade button** — the GradeBar shrinks from 4 buttons to 3 (Hard/Good/Easy).
2. **Add keyboard shortcuts** — Space reveals the card answer; Enter or Right Arrow grades the card
   as Good and advances to the next card.

Grading remains real and user-driven; SM-2 scheduling continues to use the explicit user grade.
No backend or database changes are required.

## Technical Context

**Language/Version**: TypeScript 5.x — Node.js ≥ 20 LTS (frontend SSR)
**Primary Dependencies**: Next.js 15 (App Router), React 19, TanStack Query 5, Tailwind CSS 4
**Storage**: No schema change — PostgreSQL 17 via Prisma; AGAIN remains a valid DB enum value
**Testing**: Jest + React Testing Library (frontend component/hook tests)
**Target Platform**: Modern browsers; responsive 320 px – desktop (mobile-first)
**Project Type**: Web application — frontend-only change (Next.js)
**Performance Goals**: Study session interaction latency unchanged (single API call, < 200 ms p95)
**Constraints**: No backend API changes; SM-2 must remain active (Constitution I); 44×44 px touch targets
**Scale/Scope**: 3 frontend files modified, 0 files created, 0 files deleted; 0 backend files changed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spaced Repetition Algorithm | ✅ PASS | User still selects Hard/Good/Easy; SM-2 receives explicit grade every review |
| II. User-Owned Content & Data Isolation | ✅ PASS | No authorization changes; `clientId` scoping untouched |
| III. Mobile-First, Responsive UI | ✅ PASS | 3-column GradeBar is simpler and larger per button than the 4-column version; 44×44 px enforced |
| IV. Test-Driven Development | ✅ PASS | Updated `GradeBar` tests (remove AGAIN cases); new keyboard shortcut tests; existing SM-2 tests unaffected |
| V. Simplicity & YAGNI | ✅ PASS | Minimal scope — 3 file edits, no new components, no config flags |

**Post-design re-check**: ✅ All Phase 1 artifacts confirm no unintended complexity introduced.

## Project Structure

### Documentation (this feature)

```text
specs/002-simplify-study-grading/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: decisions + rationale
├── data-model.md        # Phase 1: entity impact analysis
├── quickstart.md        # Phase 1: developer setup guide
├── contracts/
│   └── api.md           # Phase 1: API contract (no changes confirmed)
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root — files touched by this feature)

```text
frontend/
├── app/
│   └── study/
│       └── [sessionId]/
│           └── page.tsx          # MODIFY: add Space/Enter/ArrowRight keyboard listener
├── components/
│   ├── GradeBar/
│   │   └── GradeBar.tsx          # MODIFY: remove AGAIN button, change grid-cols-4 → grid-cols-3
│   └── SessionSummary/
│       └── SessionSummary.tsx    # MODIFY: remove Again column, change grid-cols-4 → grid-cols-3
└── hooks/
    └── useSession.ts             # MODIFY: expose handleReveal for keyboard trigger; handleGrade unchanged

backend/                          # NO CHANGES
prisma/                           # NO CHANGES
```

**Structure Decision**: Frontend-only change within the existing Next.js App Router project.
No new files or directories are created.
