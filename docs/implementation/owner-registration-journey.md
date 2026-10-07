# Owner registration journey — implementation handoff

## Delivered

Centered Blue Brand authentication card/header with vi/en switcher, shared
PasswordInput, signup-only account fields and a two-step Business wizard reused
by email/Google. The wizard collects general details and a manual address/OSM map
pin. Back navigation retains entered values.
UI/UX Pro Max guidance was applied to labels/errors, minimum touch targets,
keyboard focus/progress and responsive layouts; the screenshots guided the quiet
centered-card composition without copying SimplyBook branding/trial claims.

Email Owner is persisted unverified before workspace provisioning. Verified
pending Owner resumes using a separate limited HttpOnly ticket, never an Admin
JWT. Google callback persists verified password-null Owner/identity; repeated
Google sign-in resumes that account. Workspace provisioning conditionally attaches
the existing Owner in one transaction. No new Prisma model/migration is needed.

The obsolete RegistrationField component was removed; shared FormField replaces
it. Original user changes in API main.ts were preserved. Legacy all-at-once Auth
registration and older Google tickets remain compatible for cutover.

## Checks

- API: full Jest suite (49 suites / 200 tests), typecheck and production build.
- Web: 56 tests, typecheck and production Turbopack build in `.next-auth-journey`.
- Web lint and Web/UI design-token validation pass; UI typecheck pass.
- API lint passes with warnings (no errors); existing and mock-test unsafe-type
  warnings remain rather than expanding this task into repo-wide lint cleanup.
- Browser smoke passes for account → OTP → business → map pin → login,
  back-step value preservation, expired ticket, shared Google wizard and no
  password field, and 375/768/1440px overflow checks.
- Browser APIs and OSM tiles were mocked; no real account/workspace was created.
- Isolated-build changes to next-env.d.ts/tsconfig.json were restored afterward.

## Remaining environment QA

Test real SMTP/OTP, real Google account/callback/cookies, real browser location
permission (HTTPS or localhost), live OSM tile access and database-backed
concurrent rollback in the development/staging environment. Business form values
are persisted locally with a seven-day expiry and can be resumed after reload or
login. Opening hours are configured after onboarding and are not inferred from
defaults. See ADR 0004 for endpoints and storage details.
