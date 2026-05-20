# Quickstart: Simplify Study Grading — Keyboard Shortcuts + Remove AGAIN

**Feature**: `002-simplify-study-grading`
**Date**: 2026-05-17

## Overview

This guide covers how to implement and verify the "Keyboard Shortcuts + Remove AGAIN" feature.
All changes are confined to the **frontend** (`frontend/`). The backend does not change.

---

## Prerequisites

- Node.js ≥ 20 LTS
- The backend running on `http://localhost:3001` (see [backend README](../../backend/README.md))
- Frontend dev server: `cd frontend && npm run dev` → `http://localhost:3000`

---

## Change Map

| File | Action | What changes |
|------|--------|-------------|
| `frontend/components/GradeBar/GradeBar.tsx` | **Modify** | Remove AGAIN button; change `grid-cols-4` → `grid-cols-3` |
| `frontend/hooks/useSession.ts` | **Modify** | Expose `handleReveal` for keyboard trigger; `handleGrade` unchanged |
| `frontend/app/study/[sessionId]/page.tsx` | **Modify** | Add Space/Enter/ArrowRight keyboard listener via `useEffect` |
| `frontend/components/SessionSummary/SessionSummary.tsx` | **Modify** | Remove Again column; change `grid-cols-4` → `grid-cols-3` |

---

## Step-by-Step Implementation

### Step 1 — Update `GradeBar` component

**File**: `frontend/components/GradeBar/GradeBar.tsx`

Remove the AGAIN entry from the `GRADES` array and update the grid to 3 columns:

```tsx
const GRADES: { grade: Grade; label: string; color: string; key: string }[] = [
  // REMOVE: { grade: 'AGAIN', label: 'Again', color: 'bg-rose-500 hover:bg-rose-600', key: '1' },
  { grade: 'HARD', label: 'Hard', color: 'bg-orange-400 hover:bg-orange-500', key: '1' },
  { grade: 'GOOD', label: 'Good', color: 'bg-blue-500 hover:bg-blue-600', key: '2' },
  { grade: 'EASY', label: 'Easy', color: 'bg-emerald-500 hover:bg-emerald-600', key: '3' },
];
```

Change the grid class:
```tsx
// Before
<div className="max-w-lg mx-auto grid grid-cols-4 gap-2">
// After
<div className="max-w-lg mx-auto grid grid-cols-3 gap-2">
```

> **Mobile**: 3 buttons are wider than 4; touch targets become larger — easier for thumbs.

---

### Step 2 — Update `useSession` hook (minimal change)

**File**: `frontend/hooks/useSession.ts`

`handleGrade` requires no logic change. The `handleReveal` function already exists and
is returned from the hook. No code changes needed if `handleReveal` is already exported.

Verify the hook already exports `handleReveal`. If it does, **no changes needed**.

---

### Step 3 — Add keyboard shortcuts to the study page

**File**: `frontend/app/study/[sessionId]/page.tsx`

1. Import `useEffect` if not already imported.
2. Destructure both `handleReveal` and `handleGrade` from `useSession`.
3. Add a `useEffect` that registers two keyboard handlers:

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (!revealed && e.key === ' ') {
      e.preventDefault();
      handleReveal();
    } else if (revealed && (e.key === 'Enter' || e.key === 'ArrowRight')) {
      e.preventDefault();
      handleGrade('GOOD');
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [revealed, handleReveal, handleGrade]);
```

> The single `useEffect` handles both shortcuts in one listener. The `revealed` flag
> gates which action fires. The cleanup ensures no memory leaks on unmount.

---

### Step 4 — Update `SessionSummary` component

**File**: `frontend/components/SessionSummary/SessionSummary.tsx`

Remove the Again entry from the grade breakdown array and update the grid to 3 columns:

```tsx
// Change grid-cols-4 → grid-cols-3
<div className="grid grid-cols-3 gap-2 pt-2">
  {[
    // REMOVE: { label: 'Again', value: summary.again, color: 'text-rose-600' },
    { label: 'Hard', value: summary.hard, color: 'text-orange-500' },
    { label: 'Good', value: summary.good, color: 'text-blue-600' },
    { label: 'Easy', value: summary.easy, color: 'text-emerald-600' },
  ].map(...)}
</div>
```

Keep the accuracy percentage display — it's now meaningful since users select real grades.

---

## Running Tests

```bash
cd frontend
npm test -- --testPathPattern="useSession|GradeBar|SessionSummary|StudyPage"
```

Update existing `GradeBar` tests:
- Remove any test cases that check for the AGAIN button.
- Verify the component renders exactly 3 grade buttons (Hard, Good, Easy).

Add new keyboard shortcut tests in the study page tests:
- Pressing Space when front is visible → triggers reveal.
- Pressing Space when answer is already revealed → does nothing.
- Pressing Enter when answer is revealed → triggers `handleGrade('GOOD')`.
- Pressing ArrowRight when answer is revealed → triggers `handleGrade('GOOD')`.
- Pressing Enter when front is visible → does nothing.
- Pressing any key when an INPUT is focused → does nothing.

---

## Verification Checklist

- [ ] Study a deck: no AGAIN button appears at any point
- [ ] 3 grade buttons visible after reveal: Hard, Good, Easy
- [ ] Click Hard → advances to next card with Hard grade
- [ ] Click Good → advances to next card with Good grade
- [ ] Click Easy → advances to next card with Easy grade
- [ ] Press Space on front-side card → reveals answer
- [ ] Press Space when answer already visible → nothing happens
- [ ] Press Enter when answer visible → grades as Good and advances
- [ ] Press Right Arrow when answer visible → grades as Good and advances
- [ ] Press Enter when front visible → nothing happens
- [ ] Last card: any grade or Enter → shows session summary
- [ ] Session summary: shows total count, accuracy %, Hard/Good/Easy counts — no Again row
- [ ] Mobile (375 px): 3 buttons are reachable by thumb and ≥ 44 px tall
