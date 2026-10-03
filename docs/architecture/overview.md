# Architecture Overview

The core runtime uses API, merged Web + Business Admin, and separate Platform Admin:

- `apps/api` exposes the HTTP API and owns database access.
- `apps/web` hosts public Landing and Business Admin (`/{locale}/admin/*`).
- `apps/platform-admin` hosts global Super Admin separately.
- `packages/shared` owns cross-app contracts and small framework-neutral utilities.
- `packages/hooks` owns reusable React hooks for frontend clients.
- `packages/ui` owns reusable React UI primitives.

Apps may import packages. Packages must not import apps.

Backend module structure is documented in `docs/architecture/backend-folder-structure.md`.
Frontend client structure is documented in `docs/architecture/frontend-folder-structure.md`.
Shared frontend hooks are documented in `docs/architecture/frontend-shared-hooks.md`.
