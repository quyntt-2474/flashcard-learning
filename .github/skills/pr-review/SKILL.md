---
name: pr-review
description: 'Review changes and write high-quality review comments for another developer PR using mandatory base/target branches and ticket spec. Prioritizes spec compliance, correctness, security, performance, and maintainability. Outputs a severity-ranked report matching self-review format.'
argument-hint: 'base_branch target_branch ticket_spec, e.g. "release/jmb_ekyc feature/ekyc-name-change Name-change spec: validate applicantId, update swagger, add e2e for invalid type"'
---

# PR Review Comment

## Purpose

Review a PR created by another developer and produce actionable, high-signal review comments.
Use mandatory inputs (base branch, target branch, ticket spec) to evaluate implementation correctness and compliance.

---

## Required Input

All of the following are mandatory:

- `base_branch`: branch used as comparison baseline
- `target_branch`: branch to review
- `ticket_spec`: ticket requirement/specification text (source of truth)

If any input is missing, stop and ask for missing values before reviewing.

---

## Step 1 - Gather Context

### 1) Validate and normalize inputs

- Ensure `base_branch` and `target_branch` are not empty.
- Ensure `ticket_spec` has enough detail to verify behavior.
- If spec is ambiguous, list assumptions explicitly before reviewing.

### 2) Collect diff and metadata

Run commands to understand what changed:

```bash
# Full diff between base and target
 git --no-pager diff <base_branch>...<target_branch>

# Changed file list
 git --no-pager diff --name-status <base_branch>...<target_branch>

# Commit history in range
 git --no-pager log --oneline <base_branch>..<target_branch>
```

### 3) Read PR description + spec

- Read PR description (if available from user, PR body, or commit context).
- Combine PR description + `ticket_spec` to infer intended behavior and acceptance criteria.
- Treat `ticket_spec` as highest-priority source of truth.

### 4) Read code and tests in changed scope

- Read changed source files first.
- Read changed spec files (`*.spec.ts`, `*.e2e-spec.ts`) to verify coverage.
- Verify Swagger/docs updates when APIs are changed.

### 5) Optionally invoke codebase exploration

When diff is unclear, touches shared abstractions, or behavior depends on nearby modules,
invoke skill `codebase-explorer` to gather architecture and reusable-pattern context.

Use it especially when:
- New logic references existing utilities/services not in diff
- Behavior depends on module conventions
- There is risk of duplicated logic or wrong abstraction layer

---

## Step 2 - Perform Review

Use `self-review` rules and output style as the baseline.
Prioritize findings in the exact order below.

### Review Priority Order

#### Priority 1: Spec Compliance

- Does implementation match spec exactly?
- Are all requested requirements implemented?
- Do all required scenarios behave as specified?
- Do APIs match spec (path, method, payload, response)?
- Are spec edge cases handled?
- Is there any unauthorized deviation from spec?

#### Priority 2: Correctness and Logic

- Does code behave correctly in success and failure paths?
- Are edge cases handled (`null`, `undefined`, empty values, boundaries)?
- Is error handling appropriate and consistent?

#### Priority 3: Security

- Is input validation present and sufficient?
- Any injection risk (SQL/command/template/redis key misuse)?
- Is sensitive data protected and not leaked in logs?
- Are auth/authorization checks correct?

#### Priority 4: Performance

- Is algorithmic approach efficient for expected load?
- Any N+1 queries or repeated expensive I/O?
- Is cache usage appropriate and safe?

#### Priority 5: Maintainability

- Clear naming and readable structure?
- Function size and complexity reasonable?
- Duplication avoided?

### What makes a good review

#### Do

- Be specific with evidence and examples
- Explain why an issue matters
- Suggest practical alternatives
- Acknowledge good practices
- Focus on code and behavior, not the person

#### Do not

- Nitpick style handled by automated tools
- Block based on personal preference only
- Review while rushed or unfocused
- Approve without real review
- Use vague, passive-aggressive, or harsh language

---

## Output Format

Output must follow the same structure as `self-review`.

```markdown
## Self-Review Report

**Spec**: {ticket_spec or inferred summary}
**Files changed**: {count} | **Spec violations**: {n} | **Critical**: {n} | **Important**: {n} | **Suggestions**: {n} | **Alt. Approach**: {n} | **Praise**: {n}

### 💡 Alternative Approach Analysis
> **Current approach summary**: {1-2 sentences}
>
> | # | Alternative | vs. Current | Trade-off | Better when |
> |---|-------------|------------|-----------|-------------|
> | 1 | {approach} | {advantage} | {downside} | {condition} |
>
> **Verdict**: {If no better option: "Current approach is appropriate because ..."}

### 👍 Good Practices
> {Acknowledge well-implemented parts}

---

| # | Muc do | File | Finding | Suggestion |
|---|--------|------|---------|------------|
| 1 | 🚫 Vi pham Spec | `src/foo/bar.service.ts:42` | ... | ... |
| 2 | 🔴 Nghiem trong | `src/foo/bar.service.ts:88` | ... | ... |
| 3 | 🟡 Quan trong | `src/foo/bar.spec.ts:15` | ... | ... |
| 4 | 🟢 Goi y | `src/foo/bar.service.ts:10` | ... | ... |
| 5 | 💡 Huong tiep can | `src/foo/bar.service.ts` | ... | ... |
| 6 | 👍 Khen ngoi | `src/foo/bar.service.ts:55` | ... | ... |

---

### 🚫 Spec Violations (must fix)
> {Detail each violation with explanation}

### 🔴 Critical (must fix)
> {Detail each finding}

### 🟡 Important (should fix)
> {Detail each finding}

### 🟢 Suggestions (optional)
> {Detail each suggestion}
```

---

## Constraints

- Only report findings visible from the reviewed diff/context.
- If no findings in a category, write `Nothing found`.
- Always include file + approximate line reference.
- If diff is very large (>500 lines), prioritize Spec and Critical first; state that lower-priority checks may be partial.
- Avoid unrelated refactors outside the changed scope.
- Keep comments concise, respectful, and actionable.
