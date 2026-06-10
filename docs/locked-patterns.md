# Locked Patterns

> **AI AppShield — locked-patterns.md**
> Do NOT modify anything listed here without explicit human approval.

---

## Locked Architecture

- **Auth system:** Clerk — do not replace or modify auth flow
- **Database:** Supabase — do not switch providers
- **GitHub API:** Octokit REST v21 — do not swap to GraphQL without approval
- **Hosting:** Vercel — do not introduce Docker or server config

---

## Locked Files — Do Not Modify

| File | Reason |
|------|--------|
| `middleware.ts` | Auth protection — changes affect all routes |
| `supabase/migrations/*.sql` | Production schema — never alter existing migrations |
| `.env.example` | Public reference — never add real secrets |

---

## Locked Dependencies

| Package | Pinned Version | Reason |
|---------|---------------|--------|
| `next` | 15.3.0 | Stable App Router — do not upgrade mid-sprint |
| `@clerk/nextjs` | ^6.0.0 | Auth API stable — do not upgrade without testing |

---

## Scope Boundaries

- Do NOT add payments or billing (Phase 2)
- Do NOT add team/multi-user features (Phase 2)
- Do NOT modify Supabase RLS policies without human review

---

*Last updated: 2026-06-10 — Sprint 1 scaffold*
