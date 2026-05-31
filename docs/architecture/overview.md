# Architecture Overview

This base uses a three-app Turborepo layout:

- `apps/api` exposes the HTTP API and owns database access.
- `apps/web` is the public web application.
- `apps/admin` is the internal operations application.
- `packages/shared` owns cross-app contracts and small framework-neutral utilities.
- `packages/ui` owns reusable React UI primitives.

Apps may import packages. Packages must not import apps.
