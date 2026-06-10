# Project Conventions

> **AI AppShield — conventions.md**
> This document defines the coding rules for the AppShield Dashboard project.
> Read this before any task. Follow every rule without exception.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|--------|
| Frontend | Next.js | 15.3.0 |
| Styling | Tailwind | v4 |
| Auth | Clerk | v6 |
| Database | Supabase (Postgres) | v2 |
| GitHub API | Octokit REST | v21 |
| Language | TypeScript | v5 |
| Hosting | Vercel | — |

---

## File & Folder Structure

```
appshield-dashboard/
├── app/                  ← Next.js App Router pages + API routes
│   ├── dashboard/        ← Protected dashboard pages
│   ├── api/scan/         ← Scan API endpoint
│   ├── sign-in/          ← Clerk sign-in
│   └── sign-up/          ← Clerk sign-up
├── components/           ← Reusable React components
├── lib/                  ← Core logic: github.ts, scanner.ts, supabase.ts
├── supabase/migrations/  ← SQL migration files
└── docs/                 ← AppShield docs for this project
```

**Rules:**
- New components go in `/components`
- New API routes go in `/app/api/`
- Core logic goes in `/lib/` — keep components thin
- Never put business logic in components

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|--------|
| Components | PascalCase | `HealthScore.tsx` |
| Functions | camelCase | `scanRepository()` |
| Variables | camelCase | `overallScore` |
| API routes | kebab-case | `/api/scan` |
| CSS classes | Tailwind utilities | `flex gap-3 mb-8` |
| DB columns | snake_case | `health_score` |

---

## Patterns — Always Use

- Always use TypeScript strict mode
- All API routes validate auth with Clerk before any logic
- All DB operations go through `/lib/supabase.ts` — never raw Supabase calls in components
- All GitHub API calls go through `/lib/github.ts`
- All scanner logic lives in `/lib/scanner.ts`
- Use async/await — never .then() chains
- Error responses always use `NextResponse.json({ error: string }, { status: N })`

---

## Patterns — Never Use

- Never put Supabase client calls directly in components or pages
- Never hardcode API keys or tokens
- Never use `var` — only `const` and `let`
- Never skip TypeScript types on function signatures
- Never use inline styles for layout — use Tailwind; use CSS variables for colors only

---

## Task Segmentation Rule

For any task touching more than 2 files:
1. Propose a phased plan
2. Wait for human approval
3. Execute one phase at a time

---

*Last updated: 2026-06-10 — Sprint 1 scaffold*
