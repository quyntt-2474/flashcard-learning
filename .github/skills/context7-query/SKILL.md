---
name: context7-query
description: >
  Mandatory Context7 lookup skill — ALWAYS call Context7 tools before answering any question
  about a library, framework, SDK, API, CLI tool, or cloud service. Covers React, Next.js,
  NestJS, Prisma, Tailwind, TanStack Query, and every other external package.
  Triggers: any mention of a library or framework name, "how to use", "best practice",
  "example", "docs for", "latest version", "hỏi về thư viện", "cách dùng", "tài liệu".
argument-hint: 'Library or framework name + optional topic, e.g. "NestJS guards" or "Prisma transactions"'
tools:
  - read
  - search
  - context7/resolve-library-id
  - context7/get-library-docs
---

# Context7 Query — Mandatory Documentation Lookup

## Purpose

Ensure every library/framework question is answered from **current, verified documentation**
retrieved via Context7 — never from stale training-data memory.

---

## 🚨 GOLDEN RULE

> **STOP. Do NOT answer from memory.**
> Identify the library → resolve its ID → fetch its docs → THEN answer.

This rule applies to **every** question that mentions a library name, package, framework, or
external tool — no exceptions.

---

## Step 1 — Identify the Library

Extract the library/framework name from the user's question:

| User says | Library to look up |
|---|---|
| "how to use useEffect" | `react` |
| "Next.js routing" | `next.js` |
| "Prisma findMany" | `prisma` |
| "NestJS guard" | `nestjs` |
| "TanStack Query" | `@tanstack/react-query` |
| "Tailwind dark mode" | `tailwindcss` |
| "Zod schema" | `zod` |

---

## Step 2 — Resolve Library ID (REQUIRED)

Call `mcp_context7_resolve-library-id` with the library name:

```
mcp_context7_resolve-library-id({ libraryName: "prisma" })
```

From the returned list, choose the best match based on:
- **Exact name match** first
- **Highest benchmark / trust score**
- **Official repo** (e.g. `/prisma/prisma` over a fork)

---

## Step 3 — Fetch Documentation (REQUIRED)

Call `mcp_context7_get-library-docs` with the resolved ID and a focused topic:

```
mcp_context7_get-library-docs({
  context7CompatibleLibraryID: "/prisma/prisma",
  topic: "transactions",   // be specific — "routing", "hooks", "middleware", etc.
  tokens: 5000             // increase to 8000–10000 for complex architectural questions
})
```

**Good topic strings:**

- Next.js → `routing`, `middleware`, `server-components`, `api-routes`
- React → `hooks`, `context`, `suspense`, `error-boundaries`
- NestJS → `guards`, `interceptors`, `pipes`, `modules`, `decorators`
- Prisma → `queries`, `transactions`, `migrations`, `relations`
- TanStack Query → `queries`, `mutations`, `prefetching`, `invalidation`
- Tailwind → `utilities`, `responsive-design`, `dark-mode`, `customization`
- Zod → `schemas`, `validation`, `error-handling`

---

## Step 4 — Check Current Version in Workspace

Read the project's dependency file to find the installed version:

**JavaScript / TypeScript:**
```
read "package.json"   →   "prisma": "^5.14.0"
```

**Python:**
```
read "requirements.txt"   →   django==5.0.3
```

**Other ecosystems:** `go.mod`, `Cargo.toml`, `composer.json`, `pom.xml`, `*.csproj`.

---

## Step 5 — Check for Upgrades

Compare the installed version with what Context7 returned in the `Versions` field.
If Context7 has no version info, check the registry:

| Ecosystem | Registry URL |
|---|---|
| npm | `https://registry.npmjs.org/{package}/latest` |
| PyPI | `https://pypi.org/pypi/{package}/json` |
| crates.io | `https://crates.io/api/v1/crates/{crate}` |
| RubyGems | `https://rubygems.org/api/v1/gems/{gem}.json` |

If a newer version exists, fetch docs for **both** versions and provide a migration summary:

```
Current: Prisma 5.14.0
Latest:  Prisma 6.x.x   ← fetch docs for this too
```

---

## Step 6 — Answer Using Retrieved Docs Only

Now compose the answer using **only** information from the fetched documentation:

- ✅ Use API signatures exactly as they appear in the docs
- ✅ Include working code examples from the docs
- ✅ Follow patterns and best practices stated in the docs
- ✅ State the version the answer targets: "In Prisma 5..."
- ✅ Mention upgrade availability if a newer version exists
- ❌ Do NOT guess, hallucinate methods, or use patterns from memory

---

## Quality Checklist (verify before every response)

- [ ] Called `mcp_context7_resolve-library-id` ✓
- [ ] Called `mcp_context7_get-library-docs` with a focused topic ✓
- [ ] Read `package.json` (or equivalent) for current installed version ✓
- [ ] Determined latest available version ✓
- [ ] Informed user about upgrade availability (YES or NO) ✓
- [ ] Answer uses only APIs found in retrieved docs ✓
- [ ] No deprecated patterns included ✓
- [ ] Version explicitly mentioned in the answer ✓

---

## Example Workflow

**User:** "How do I use optimistic updates in TanStack Query?"

```
Step 1 → Library: @tanstack/react-query

Step 2 → mcp_context7_resolve-library-id({ libraryName: "@tanstack/react-query" })
         Select: /tanstack/query

Step 3 → mcp_context7_get-library-docs({
           context7CompatibleLibraryID: "/tanstack/query",
           topic: "optimistic-updates",
           tokens: 6000
         })

Step 4 → read "frontend/package.json"
         Found: "@tanstack/react-query": "^5.45.1"

Step 5 → Context7 versions: v5.x → up to date ✓

Step 6 → Answer using docs for TanStack Query v5
```

---

## Scope — When This Skill Applies

**Always apply** when the question involves:
- Any npm/PyPI/crates.io/RubyGems package name
- Frontend frameworks: React, Next.js, Vue, Svelte, Angular
- Backend frameworks: NestJS, Express, Fastify, Django, Rails
- ORMs / DB clients: Prisma, TypeORM, Sequelize, SQLAlchemy
- CSS/UI: Tailwind, shadcn/ui, MUI, Radix, Headless UI
- State / data-fetching: TanStack Query, Zustand, Redux
- Validation: Zod, Yup, class-validator
- Build / test tools: Vite, Webpack, Jest, Vitest, Playwright
- Cloud SDKs: AWS SDK, Firebase, Supabase

**Skip Context7** only for:
- Pure business logic unrelated to a library
- General programming concepts (algorithms, data structures)
- Refactoring that doesn't touch library-specific APIs
