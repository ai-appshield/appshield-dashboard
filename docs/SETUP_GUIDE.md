# AppShield Setup Guide

Welcome to AppShield — the AI governance health monitor for your codebase. This guide walks you through installing the AppShield documentation framework in your repository so the dashboard can start tracking your AI health score.

---

## How It Works

AppShield scans your repository for 7 standard documentation files that define how AI agents should behave in your codebase. Each file is scored based on:

- **Presence** — Does the file exist?
- **Completeness** — Are placeholders filled in?
- **Freshness** — Has it been updated recently?

Your **Overall Health Score** (0–100) is the average across all 7 documents.

---

## Step 1 — Create the `docs/` Folder

In your repository, create a folder called `docs/` at the root level if it doesn't already exist.

---

## Step 2 — Add the 7 Required Files

Create each of the following files inside your `docs/` folder:

| File | Purpose |
|---|---|
| `docs/conventions.md` | Coding standards and naming conventions AI agents must follow |
| `docs/locked-patterns.md` | Patterns that must never be changed without human approval |
| `docs/knowledge-base.md` | Key decisions, architecture notes, and context for AI agents |
| `docs/session-handoff.md` | Current state of the project — updated every session |
| `docs/update-process.md` | How and when documentation should be updated |
| `docs/decision-log.md` | A log of all major decisions made in the project |
| `docs/agent-workflow.md` | How AI agents should operate within this codebase |

---

## Step 3 — Use These Starter Templates

Copy the template content below into each file, then replace the `[PLACEHOLDER]` sections with your actual project details.

### `docs/conventions.md`
```markdown
# Conventions

## Naming Conventions
[PLACEHOLDER — describe your naming standards for files, variables, functions, etc.]

## Code Style
[PLACEHOLDER — describe formatting rules, linting standards, preferred patterns]

## Folder Structure
[PLACEHOLDER — describe how the project is organized and why]
```

### `docs/locked-patterns.md`
```markdown
# Locked Patterns

The following patterns must NOT be changed without explicit human approval.

## Authentication
[PLACEHOLDER — describe auth patterns that are locked]

## Database Schema
[PLACEHOLDER — describe any schema or data structures that are locked]

## API Contracts
[PLACEHOLDER — list any API contracts that cannot be changed]
```

### `docs/knowledge-base.md`
```markdown
# Knowledge Base

## Project Overview
[PLACEHOLDER — describe what this project does and why it exists]

## Architecture Decisions
[PLACEHOLDER — describe key architectural choices and their rationale]

## Known Issues
[PLACEHOLDER — list known issues and workarounds]

## Key Dependencies
[PLACEHOLDER — list critical dependencies and why they were chosen]
```

### `docs/session-handoff.md`
```markdown
# Session Handoff

**Last Updated:** [DATE]

## Current Status
[PLACEHOLDER — describe where the project stands right now]

## In Progress
[PLACEHOLDER — list what is currently being worked on]

## Next Up
[PLACEHOLDER — list the next priorities]

## Blockers
[PLACEHOLDER — list anything blocking progress]
```

### `docs/update-process.md`
```markdown
# Update Process

## When to Update Docs
[PLACEHOLDER — describe triggers for updating documentation, e.g., after each session, after each deploy]

## Who Updates Docs
[PLACEHOLDER — human, AI agent, or both?]

## Review Process
[PLACEHOLDER — describe how doc updates are reviewed before committing]
```

### `docs/decision-log.md`
```markdown
# Decision Log

A running log of major decisions made in this project.

## [DATE] — [Decision Title]
**Decision:** [PLACEHOLDER]
**Rationale:** [PLACEHOLDER]
**Alternatives Considered:** [PLACEHOLDER]

---

_Add new decisions above this line in reverse chronological order._
```

### `docs/agent-workflow.md`
```markdown
# Agent Workflow

## How AI Agents Should Operate
[PLACEHOLDER — describe the expected behavior and boundaries for AI agents in this codebase]

## Before Starting a Session
[PLACEHOLDER — what should an agent read or check before beginning work?]

## During a Session
[PLACEHOLDER — what constraints apply during active development?]

## After a Session
[PLACEHOLDER — what must be updated or committed before ending a session?]

## Escalation Rules
[PLACEHOLDER — what situations require human approval before proceeding?]
```

---

## Step 4 — Scan Your Repo

Once all 7 files are created and saved:

1. Return to your [AppShield Dashboard](https://appshield.ai)
2. Enter your repository name (e.g. `yourname/your-repo`)
3. Click **Scan Repo**

Your first real health score will appear within seconds. The **Quick Wins** section will tell you exactly which placeholders to fill in to improve your score.

---

## Tips for a High Score

- **Fill all placeholders** — each file with zero placeholders scores 30 points higher
- **Update `session-handoff.md` every session** — it has stricter freshness rules (stale after 7 days)
- **Keep all files updated** — docs older than 30 days start losing freshness points
- **Aim for 100+ words per file** — thin docs score lower on completeness

---

## Need Help?

Open an issue at [github.com/ai-appshield/appshield-dashboard](https://github.com/ai-appshield/appshield-dashboard/issues) and we'll help you get set up.
