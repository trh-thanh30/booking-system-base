# Booking System Base

Reusable Turborepo monorepo base for product teams. The repo starts generic by design: domain modules should be added as vertical slices instead of being baked into the template.

## Structure

- `apps/api` - NestJS API skeleton with Prisma-ready boundaries.
- `apps/web` - public Next.js app.
- `apps/admin` - internal Next.js admin app.
- `packages/shared` - shared types, schemas, constants, HTTP helpers, and utilities.
- `packages/ui` - reusable React UI primitives.
- `packages/eslint-config` - shared ESLint configuration.
- `packages/typescript-config` - shared TypeScript configuration.
- `docs/agents` - agent workflow playbooks inspired by AI Hero skills.

## Common Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm check-types
```

Use `AGENTS.md` before planning or implementing larger changes.
