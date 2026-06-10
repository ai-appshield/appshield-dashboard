# Knowledge Base

> **AI AppShield — knowledge-base.md**
> Institutional memory for the AppShield Dashboard project.
> Update after every bug fix or lesson learned.

---

## Hard-Won Lessons

- Supabase RLS requires JWT claims format `request.jwt.claims` — use Clerk JWT template to include `sub` claim
- Octokit `repos.getContent` returns base64-encoded content — always decode with `Buffer.from(data.content, 'base64').toString('utf-8')`
- Next.js 15 Server Actions require `allowedOrigins` in next.config.ts for Replit dev URLs
- Clerk `auth()` in App Router is async — always `await auth()`

---

## Known Workarounds

### Replit Port Binding
- **Issue:** Replit expects apps to bind to `0.0.0.0`, not `localhost`
- **Workaround:** Next.js handles this automatically — no change needed
- **Do NOT** add custom server.js to change port binding

---

*Last updated: 2026-06-10 — Sprint 1*
