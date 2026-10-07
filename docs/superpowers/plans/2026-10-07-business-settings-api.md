# ONB-001 Business Settings API Implementation Plan

**Goal:** Persist Business quick setup after Auth and expose the three-step progress to ONB-002.

**Architecture:** Controller -> use case -> repository. Store `working_hours`, `booking_template_id`, and `quick_setup_skipped` in the existing Business.settings JSON object. Use Prisma ORM reads and writes inside a Serializable transaction, scoped by Tenant and Business, preserving unrelated settings. Retry the entire transaction on P2034 write conflicts, with at most three attempts. Reuse ServiceModule for active Service checks and creation. No Auth changes or database migration.

**Tech stack:** NestJS, Prisma/PostgreSQL, shared Zod contracts, Jest with mocked repositories.

## Contract and decisions

- Existing authenticated Tenant and `x-business-id` contexts supply identity; request bodies never supply scope.
- Read endpoints allow Owner and Staff. Every mutation requires Owner.
- Working hours contain each `day_of_week` from 0 (Sunday) through 6 exactly once. One interval per open day, local HH:mm, closing strictly after opening; closed days have null times. At least one day must open. Overnight hours and break times are outside MVP.
- Timezone always comes from Business; callers cannot override it.
- Templates are the built-in `classic`, `modern`, and `minimal` catalog with vi/en labels. ONB-002 can use these stable IDs; this task does not implement template rendering/editor.
- Summary has boolean steps `working_hours`, `first_service`, `booking_template`, counts, timezone, selected template, status and `next_step`.
- Completed data takes precedence over skip. Otherwise skipped -> SKIPPED; any completed step -> IN_PROGRESS; none -> NOT_STARTED. `next_step` is always the first incomplete step, including when skipped, or null when completed.
- Skip/resume only set/clear `quick_setup_skipped`. Resume without completed data remains NOT_STARTED; no separate completion or started flag is persisted.

## Endpoints

All below are under the existing API prefix and response envelope, at `/business-settings`:

| Method | Path                 | Body/result                                 |
| ------ | -------------------- | ------------------------------------------- |
| GET    | `/setup-summary`     | BusinessSetupSummary                        |
| GET    | `/working-hours`     | timezone and saved days, or days:null       |
| PUT    | `/working-hours`     | `{days:[seven day entries]}` -> saved hours |
| GET    | `/booking-templates` | catalog and selected_template_id            |
| PUT    | `/booking-template`  | `{template_id}` -> selection                |
| POST   | `/skip`              | updated setup summary                       |
| POST   | `/resume`            | updated setup summary                       |

Use existing `POST /services` for the first service (ACTIVE by default). Existing active services complete that step automatically.

## Execution

- [x] Shared types/schema and use-case tests: status matrix, validation, invalid persisted data, scoped reads, skip/resume persistence and no lost saved data.
- [x] Implement BusinessSettingsRepository, seven focused use cases, DTOs, controller and module registration. Add ServiceRepository.hasActiveInBusiness.
- [x] HTTP tests with real RolesGuard and BusinessGuard: Owner vs Staff, cross-Tenant 403, malformed bodies, no spoofed identity, response and reload behavior.
- [x] Run Shared lint/typecheck/tests/build and API lint/typecheck/tests/build. Review diff, record results. Do not commit/push automatically.

## Verification commands

```powershell
pnpm --filter @repo/shared build
pnpm --filter @repo/shared lint
pnpm --filter @repo/shared check-types
pnpm --filter @repo/shared test
pnpm lint:api
pnpm typecheck:api
pnpm test:api -- --runInBand
pnpm build:api
pnpm --filter @repo/api exec node test/business-settings.smoke.cjs
```

The optional smoke command runs the built use cases and repositories against PostgreSQL using `.env.development`. It creates disposable Tenant/Business/Service records and removes its Tenant and child records in a finally block. It checks persistence, concurrent ORM writes, active/inactive/archived Service detection, timezone, preservation of unrelated settings, and Tenant isolation.

## ONB-002 integration

- Use `BusinessSetupSummary`, `BusinessWorkingHours`, `BookingTemplateCatalog`, `UpdateBusinessWorkingHoursInput`, and `SelectBookingTemplateInput` from `@repo/shared`.
- Send the existing Admin auth/Tenant context and `x-business-id` on each call. Read the result from the standard `data` envelope.
- Route Owner NOT_STARTED/IN_PROGRESS using `next_step`. SKIPPED/COMPLETED and Staff go to Dashboard. Offer a resume entry even while skipped. Summary provides next_step for that entry without forcing a redirect.
- Call `/resume` only on an explicit resume action; never on each login or page render.
- Save hours with a seven-entry `days` array. A closed-day entry is `{ day_of_week: 0, is_closed: true, opens_at: null, closes_at: null }`; an open-day entry is `{ day_of_week: 1, is_closed: false, opens_at: "09:00", closes_at: "17:00" }`. Render the Business timezone supplied by GET; never send a timezone override.
- A new Service should use existing `POST /services` with name, duration_minutes and price_amount; ACTIVE is the default. Refresh summary after creation. An existing active Service requires no extra creation.
- Templates return vi/en names and descriptions for the picker. Save `{ template_id: "modern" }`, then refresh summary to decide whether setup is complete.

## Verified results

- Shared build/lint/typecheck pass; all 16 Shared tests pass.
- API typecheck/build pass; all 58 suites and 271 tests pass, including 52 quick-setup tests.
- API lint exits successfully: 0 errors, 972 warnings across existing code and mock-based tests.
- Real PostgreSQL smoke passes, including simultaneous working-hours/template/skip writes and cleanup of all disposable fixtures.
- Root `test:api` now uses explicit `pnpm run test` so `pnpm test:api -- --runInBand` forwards the Jest option correctly.
- No migration, new environment variable, frontend/Auth change, commit or push is required by this implementation.
