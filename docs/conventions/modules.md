# Module Conventions

## API

Each API module should expose a clear Nest module boundary:

- `*.module.ts`
- `*.controller.ts`
- `*.service.ts`
- `dto.ts` or `dto/` for request contracts

Domain modules should live under `apps/api/src/modules/<domain>`.

## Frontend

Create features as vertical slices near the app that owns the route. Move code into `packages/ui` or `packages/shared` only when it is reused by at least two apps or is clearly framework-neutral.

## Shared Packages

`packages/shared` should contain types, schemas, constants, and utilities that do not depend on Next.js or NestJS.
