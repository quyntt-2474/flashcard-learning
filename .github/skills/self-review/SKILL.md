---
name: self-review
description: 'Self-review staged/unstaged git diff before committing or opening a PR. Checks spec compliance, coding convention, missing cases, validation, security, race conditions, error handling, performance, and simplification opportunities. Outputs a severity-ranked table. Triggers: self review, review diff, review changes, review trước khi commit, kiểm tra thay đổi.'
argument-hint: '[optional] Basic spec of the change, e.g. "extendOrSet should only set the key when it does not exist, using atomic Lua script"'
---

# Self-Review Diff

## Purpose

Analyze the current git diff (staged + unstaged, or against a base branch) and produce a structured review table ranked by severity — before the developer commits or opens a PR.

---

## Step 1 — Gather Diff

Run the following to collect what has changed:

```bash
# Staged changes only (what has been git add-ed)
git --no-pager diff --cached

# If a base branch is known (e.g. release/jmb_ekyc), use:
# git --no-pager diff --cached <base_branch>
```

Also collect:
- Changed file list: `git --no-pager diff --cached --name-status`
- Any new/modified spec files: filter for `*.spec.ts`, `*.e2e-spec.ts`

---

## Step 2 — Understand Context

Before reviewing, read:
1. **Changed source files** — understand the new/modified logic.
2. **Changed spec files** — understand what is already tested.
3. **The optional spec argument** provided by the user — use it as the source of truth for spec compliance.

If no spec is provided, infer intent from commit messages and the diff itself.

---

## Step 3 — Apply Review Rules

Evaluate the diff against every rule below. For each finding, record:
- **Category** (see legend)
- **File + line reference**
- **Finding** — what is wrong or noteworthy
- **Suggestion** — what to do about it

### Rule Checklist

#### 🚫 Spec Compliance
- Does the implementation fully satisfy **all** requirements stated in the spec?
- Are there any behaviors that contradict the spec (wrong endpoint, wrong response shape, wrong status code)?
- Does each Given-When-Then scenario described in the spec have a corresponding test case?
- Do new/changed API endpoints match the spec (method, path, request body, response body)?
- Are edge cases explicitly mentioned in the spec handled in code **and** covered by tests?
- Is there a PR link / reference to the spec ticket in the description?
- Has documentation (README, Swagger `@ApiOperation`, DTO `@ApiProperty` descriptions) been updated to reflect the change?

#### 🔴 Bugs, Security & Race Conditions
- Off-by-one errors, null/undefined dereference, unhandled promise rejections.
- Race conditions: shared mutable state accessed concurrently without locking (missing `redlock`, non-atomic Redis operations).
- Security: hardcoded secrets, unvalidated external input used in DB queries/Redis keys/shell commands, missing auth/guard checks, sensitive fields logged without redaction.
- Data integrity: write operations (multi-step DB updates, `Promise.all` with mixed writes) that can partially succeed without rollback or compensation logic.
- Missing input validation on DTO fields that flow into DB queries or external calls.

#### 🟡 Performance, Maintainability & Missing Cases

**Missing test cases — always check:**
- **Main / happy-path cases**: Is the primary success flow tested?
- **Edge cases**: Empty arrays/strings, zero values, max-length inputs, missing optional fields, `null`/`undefined` inputs.
- **Boundary cases**: Min/max numeric boundaries (e.g. TTL = 0, TTL < 0), date boundaries, pagination limits.
- **Error / failure paths**: Each `catch` block, each thrown error class, each external dependency throwing.
- Is C0 (statement) coverage achievable from the written tests?

**Performance:**
- N+1 queries inside loops — use `findMany` with `where: { id: { in: [...] } }` instead.
- Missing Redis cache for repeated DB reads within the same request lifecycle.
- Large payloads serialized/deserialized unnecessarily on hot paths.

**Maintainability:**
- Code duplication that should be extracted into a shared utility or base class.
- Magic numbers/strings that should be named constants in a `config/` or `constants.ts` file.
- Overly complex conditional chains — consider early returns, strategy pattern, or helper extraction.

#### 🟢 Suggestions (Simplification & Convention)

**Simplification opportunities:**
- Can a multi-step async flow be reduced to a single atomic operation?
- Can a deeply nested `if/else` be flattened with early returns?
- Can repeated `template(RedisKey.X)({ ... })` calls be extracted into a helper?
- Can multiple `Promise` chains be collapsed into `Promise.all`?
- Is there an existing utility (lodash, date-fns, NestJS built-in) that already does what the new code does?

**Convention:**
- Variable/function names that don't match project conventions (`camelCase` for vars, `PascalCase` for classes, `SCREAMING_SNAKE_CASE` for constants).
- Missing JSDoc on new public methods.
- Unnecessary `await` on non-async calls or already-resolved values.
- Dead code, unused imports, unused variables.
- Test descriptions that don't follow `should ...` pattern.
- Missing `it('should be defined', ...)` smoke test for new classes.

#### 💡 Alternative Approach Analysis (Think Outside the Box)

This section is **mandatory** regardless of whether the implementation is correct. Even if the code works and passes all rules above, always step back and ask: *"Is this the best way to solve the problem?"*

**Core questions to answer:**

1. **Is the chosen approach solving the root problem, or just the symptom?**
   - Example: adding a retry is treating the symptom; fixing the underlying race condition is treating the root cause.

2. **Are there simpler built-in mechanisms that were overlooked?**
   - Redis: `SET NX PX` (SET if Not eXists) vs. custom Lua scripts; `GETSET`; `INCR`/`DECR` for counters.
   - Prisma: `upsert`, `createMany`, `updateMany` vs. loop + individual writes.
   - NestJS: interceptors, middleware, pipes for cross-cutting concerns vs. inline logic in every service.
   - Node.js: `Promise.allSettled` vs. manual `try/catch` per item in a loop.

3. **Does the abstraction sit at the right layer?**
   - Should this logic live in a shared utility/service instead of being duplicated across services?
   - Should this be a NestJS interceptor/guard/pipe rather than inline code?
   - Is a new method on `RedisCacheService` the right place, or does it belong in a domain service?

4. **Does this scale? What happens at 10x or 100x load?**
   - Will this approach create a hotspot key in Redis?
   - Will this approach trigger N+1 DB calls under load?
   - Is there a distributed coordination requirement being assumed away?

5. **Trade-off comparison — for each alternative found, briefly note:**
   - ✅ Advantage over current approach
   - ⚠️ Downside or constraint
   - 🎯 When it would be the better choice

**Output for this section:**
```
### 💡 Alternative Approach Analysis

**Current approach summary**: {1-2 sentences describing what the code does and how}

**Alternative(s) considered**:

| # | Alternative | vs. Current | Trade-off | Better when |
|---|-------------|------------|-----------|-------------|
| 1 | {approach name} | {advantage} | {downside} | {condition} |

**Verdict**: {Is the current approach optimal? If not, which alternative is recommended and why?}
```

If no better alternative exists, explicitly state: `✅ Current approach is appropriate for this use case because {reason}.`

#### 👍 Good Practices
- Atomic operations used correctly (e.g. Lua scripts for Redis `extendOrSet`).
- Proper use of `externalErrorHandler` / `databaseErrorHandler`.
- CLS `setFunctionName` called before every external API call.
- Correct use of `@InjectPrisma()` / `@InjectReadOnlyPrisma()` / `@InjectPrismaAdmin()`.
- Tests follow AAA, mock dependencies with explicit `jest.fn()`, and assert exact payloads sent to Prisma.
- No use of `objectContaining` where full object assertion is possible.

---

## Step 4 — Output Format

Present findings as a **Markdown table**, grouped by severity, with a summary count at the top.

### Severity Legend

| Mức độ | Icon | Mô tả | Hành động |
|--------|------|-------|-----------|
| Vi phạm Spec | 🚫 | Không khớp đặc tả | **Phải sửa** |
| Nghiêm trọng | 🔴 | Bugs, vấn đề bảo mật, race condition | **Phải sửa** |
| Quan trọng | 🟡 | Performance, khả năng bảo trì, duplication | **Nên sửa** |
| Gợi ý | 🟢 | Convention, naming, simplification | Tùy chọn |
| Hướng tiếp cận | 💡 | Alternative approach tối ưu hơn | Cân nhắc |
| Khen ngợi | 👍 | Thực hành tốt, đáng ghi nhận | Ghi nhận |

### Output Template

```
## Self-Review Report

**Spec**: {spec provided by user, or "Inferred from diff"}
**Files changed**: {count} | **Spec violations**: {n} | **Critical**: {n} | **Important**: {n} | **Suggestions**: {n} | **Alt. Approach**: {n} | **Praise**: {n}

### 💡 Alternative Approach Analysis
> **Current approach summary**: {1-2 sentences}
>
> | # | Alternative | vs. Current | Trade-off | Better when |
> |---|-------------|------------|-----------|-------------|
> | 1 | {approach} | {advantage} | {downside} | {condition} |
>
> **Verdict**: {Is current approach optimal? If yes: "✅ Current approach is appropriate because {reason}."}

### 👍 Good Practices
> {Acknowledge what was done well}

---

| # | Mức độ | File | Finding | Suggestion |
|---|--------|------|---------|------------|
| 1 | 🚫 Vi phạm Spec | `src/foo/bar.service.ts:42` | ... | ... |
| 2 | 🔴 Nghiêm trọng | `src/foo/bar.service.ts:88` | ... | ... |
| 3 | 🟡 Quan trọng | `src/foo/bar.spec.ts:15` | ... | ... |
| 4 | 🟢 Gợi ý | `src/foo/bar.service.ts:10` | ... | ... |
| 5 | 💡 Hướng tiếp cận | `src/foo/bar.service.ts` | ... | ... |
| 6 | 👍 Khen ngợi | `src/foo/bar.service.ts:55` | ... | ... |

---

### 🚫 Spec Violations (must fix)
> {Detail each violation with code snippet and explanation}

### 🔴 Critical (must fix)
> {Detail each finding}

### 🟡 Important (should fix)
> {Detail each finding}

### 🟢 Suggestions (optional)
> {Detail each suggestion}


```

---

## Constraints

- Only report findings that are **visible in the diff** — do not invent issues from files that were not changed.
- When no issues are found in a category, write `✅ Nothing found` for that section.
- Be specific: always include file + approximate line number.
- If the diff is large (>500 lines), prioritize 🚫 and 🔴 findings first; mention that 🟡/🟢 may be incomplete.
- Do NOT suggest changes unrelated to the diff (e.g. refactoring untouched files).
