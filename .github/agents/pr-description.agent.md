---
description: Generate a pull request description from git diff between two branches using the project PR template
---

# Generate PR Description

Automatically generate a pull request description by comparing a **base branch** against a **target branch** and filling in the project's PR template.

## User Input

```text
$ARGUMENTS
```

Parse the user input to extract:
- `base` — the branch to compare FROM (default: `main`)
- `target` — the branch to compare TO (default: current branch)

Accepted input formats:
- `main..feature/my-branch`
- `base: main, target: feature/my-branch`
- `feature/my-branch` (target only; base defaults to `main`)
- (empty) — uses current branch as target, `main` as base

## Execution Steps

### Step 1 — Resolve branches

Run the following to determine current branch if target is not specified:
```bash
git rev-parse --abbrev-ref HEAD
```

Verify both branches exist:
```bash
git rev-parse --verify <base>
git rev-parse --verify <target>
```

If either branch does not exist, stop and report a clear error to the user.

### Step 2 — Collect the diff

Run all commands below to gather context:

```bash
# Commit log between branches
git log <base>..<target> --oneline --no-merges

# List of changed files
git diff <base>..<target> --name-status

# Full diff (for content analysis)
git diff <base>..<target> -- . ':(exclude)*.lock' ':(exclude)package-lock.json' ':(exclude).next/**'
```

### Step 3 — Read the PR template

Read the file `.github/pull_request_template.md` to get the current template structure.

### Step 4 — Analyse the diff

From the diff output, extract:

1. **Summary** — one-sentence description of the overall goal of the changes
2. **Backend changes** — changed files under `backend/src/`, grouped by module (e.g., `modules/decks`, `modules/cards`, `prisma`)
3. **Frontend changes** — changed files under `frontend/`, grouped by concern (e.g., `services/api.ts`, `components/`, `app/`)
4. **Type of change** — infer from commit messages and diff:
   - `bug fix` if commit messages contain fix/bug/patch keywords
   - `new feature` if new files or new exported functions/components are added
   - `breaking change` if interfaces, DTOs, or API contracts are modified
   - `refactor` if logic is reorganised without behavioural change
   - `chore` if only config, deps, or non-source files change
5. **Test steps** — derive manual test steps from the feature story in changed spec files if present, otherwise infer from the diff
6. **Checklist items** — automatically check any item that can be verified from the diff:
   - `console.log` check: scan for `console.log` in non-test files
   - `'use client'` check: verify new Next.js page/component files have the directive if they use hooks
   - API contract check: compare `services/api.ts` types against backend DTO files

### Step 5 — Fill and output the PR description

Replace every placeholder comment in the template with the extracted content.

Mark checkboxes as `[x]` when the diff confirms the item is satisfied, leave as `[ ]` when it cannot be confirmed automatically.

## Output Format

Output the final filled PR description as a **single fenced markdown code block** (using triple backticks) so the user can copy the entire content easily. No preamble or explanation outside the code block.
