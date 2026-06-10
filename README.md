# AppShield Dashboard

> Analyze your AI AppShield `/docs` folder, score compliance, and get actionable quick wins.
> Built by [TraghmTech](https://github.com/NerdChild137) · Part of the [AI AppShield](https://github.com/ai-appshield/ai-shield) ecosystem.

---

## What It Does

Connect any GitHub repository that uses AI AppShield. The dashboard scans your `/docs` folder and shows:

- **Health Score** — 0-100 overall AppShield compliance score
- **Document Status** — per-document cards with staleness, placeholder count, and completeness
- **Quick Wins** — auto-generated top 5 actions to improve your score

## Tech Stack

- **Frontend:** Next.js 15 + Tailwind v4
- **Auth:** Clerk (GitHub OAuth)
- **Database:** Supabase (Postgres)
- **GitHub API:** Octokit SDK
- **Hosting:** Vercel

## Getting Started

1. Clone this repo into Replit
2. Add environment variables (see `.env.example`)
3. Run `npm install`
4. Run `npm run dev`

## Environment Variables

See `.env.example` for all required variables.

---

*Part of the [AI AppShield](https://github.com/ai-appshield/ai-shield) ecosystem · MIT License · TraghmTech*
