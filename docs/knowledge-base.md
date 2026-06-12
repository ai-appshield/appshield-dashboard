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

## Security Architecture Decisions

### Token Encryption — HKDF-SHA256 Key Derivation
- **Decision date:** June 12, 2026
- **Problem caught:** Encryption key was committed to `.replit` (source control) — a critical vulnerability allowing anyone with repo access to decrypt all stored GitHub tokens
- **Fix:** Removed the committed key entirely. Encryption key is now derived **at runtime** using HKDF-SHA256 from `DATABASE_URL`
- **Why this is secure:** `DATABASE_URL` is Replit-managed, never committed, and never appears in database backups — no standalone key exists anywhere in code
- **Encrypt/decrypt:** AES-GCM with the HKDF-derived key. Round-trip verified after fix.
- **⚠️ LOCKED PATTERN — Do NOT:** hardcode or commit any encryption key, store a raw key in `.replit`, `.env`, or any tracked file, or revert to a static key approach

### GitHub Token Resolution Priority (`lib/github-token.ts`)
The `getGithubToken()` function resolves tokens in this exact order — do not change the priority:
1. `manualToken` — passed directly by the caller (user-supplied PAT in UI)
2. `process.env.GITHUB_PAT` — Replit Secret for server-side private repo access (owner/admin use)
3. Clerk OAuth token — retrieved via `clerkClient.users.getUserOauthAccessToken(userId, 'oauth_github')` for authenticated users
4. `undefined` — public repos still work without any token

### Private Repo Access — Current Approach
- **Context:** Replit-managed Clerk does not expose OAuth scope configuration — `repo` scope cannot be added via Clerk dashboard
- **Current solution:** `GITHUB_PAT` Replit Secret with `repo` scope covers private repo scanning for owner/testing
- **Future path:** Migrate to standalone Clerk account (clerk.com) to enable per-user private repo OAuth with full scope control — planned for post-MVP

---

*Last updated: 2026-06-12 — Sprint 3 (Security hardening + private repo access)*
