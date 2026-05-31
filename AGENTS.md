# Agent Workflow

This repo uses a lightweight, repo-native agent workflow inspired by Matt Pocock's AI Hero skills. The goal is to keep agents aligned, testable, and architecture-aware without locking the project to a single coding agent.

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
