# Agent Workflow

This repo uses a lightweight, repo-native agent workflow inspired by Matt Pocock's AI Hero skills. The goal is to keep agents aligned, testable, and architecture-aware without locking the project to a single coding agent.

## Skill Library

- `docs/agents/README.md` explains how to use the repo workflow with Codex, Claude Code, Cursor, Windsurf, Antigravity, Gemini CLI, Copilot, and other assistants.
- `docs/agents/skills/mattpocock/` vendors the Matt Pocock skills so agents can read them from the repo without relying on global `~/.agents/skills`.
- `docs/agents/skills/ui-ux-pro-max/` vendors UI/UX Pro Max for frontend, design-system, styling, accessibility, responsive, dashboard, and visual QA work.
- When a user names a skill, read the matching `docs/agents/skills/mattpocock/<skill>/SKILL.md` before acting unless a repo-specific workflow in `docs/agents/workflows/` is more appropriate.
- When a task changes UI/UX, read `docs/agents/skills/ui-ux-pro-max/README.md` and the relevant `docs/agents/skills/ui-ux-pro-max/claude-skills/<skill>/SKILL.md` before implementation.
- UI/UX Pro Max platform-specific skill bundles live in `docs/agents/skills/ui-ux-pro-max/platform-skills/` for GPT, Codex, Gemini, and Antigravity.

## Default Flow

1. Start with `docs/agents/workflows/01-grill-with-docs.md` for unclear or high-impact work.
2. Write a PRD in `docs/prd/` using `docs/agents/workflows/02-to-prd.md`.
3. Split the PRD into vertical slices in `docs/issues/` using `docs/agents/workflows/03-to-issues.md`.
4. Implement risky behavior with `docs/agents/workflows/04-tdd.md`.
5. Debug regressions with `docs/agents/workflows/05-diagnose.md`.
6. Review architecture with `docs/agents/workflows/06-improve-codebase-architecture.md`.
7. Triage queued work with `docs/agents/workflows/07-triage.md`.
8. Create a handoff before context switches with `docs/agents/workflows/08-handoff.md`.

## Repo Memory

- `CONTEXT.md` defines shared language and architectural decisions.
- `docs/adr/` stores accepted architecture decisions.
- `docs/prd/` stores product requirements.
- `docs/issues/` stores local implementation tickets when GitHub or Linear is not configured.
