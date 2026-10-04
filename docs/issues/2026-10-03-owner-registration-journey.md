# Owner registration journey and centered authentication design

## Scope

Based on the supplied SimplyBook screenshots, reuse Blue Brand tokens and shared
UI for centered registration/login/verification/recovery screens. Email account
is persisted first, then verified, then Business info/address/weekly hours are
collected. Google uses the same Business wizard. Map is OpenStreetMap + Leaflet
with explicit geolocation, draggable/clickable pin and coordinate fallback.

## Implementation

- Auth-owned account registration and limited HttpOnly onboarding sessions.
- Conditional attach of existing Owner inside Tenant provisioning transaction.
- New shared account/business-profile schemas; no schema migration/new model.
- Shared AuthenticationLayout/PasswordInput/Google redirect hook.
- One BusinessOnboardingForm for manual and Google accounts.
- Legacy workspace registration endpoint remains compatible during cutover.

## Validation

Record executed commands and remaining HITL in the implementation handoff.
Browser smoke: `scripts/smoke-owner-onboarding-browser.mjs`, local-only with mocked
API and map tiles. Real Google account, email delivery, database-backed rollback
and browser location permission need environment validation.
