# Owner Auth / Registration Journey

## Agreed scope

- Redesign Web registration and Admin authentication with a centered, narrow
  card, quiet semantic background, BookingBase header and vi/en selector.
- Use the supplied SimplyBook screenshots as visual reference, not their logo,
  subscription claims, legal copy, marketplace opt-ins or CAPTCHA.
- Persist an unverified OWNER account at initial email/password registration.
- Verify email before collecting Business information, address and opening hours.
- Provision Tenant/default Business/membership atomically at final completion;
  attach the existing verified Owner, never create a second User.
- Pending Owners must not receive Admin JWT/refresh tokens or dashboard access.
- Support resume after reload/login with an expiring, HttpOnly onboarding ticket.
- Reuse the same Business wizard for Google onboarding; verified Google email
  stays read-only, OAuth-only accounts never receive a fake password.
- Include OpenStreetMap + Leaflet, click/drag pin, explicit browser location,
  reverse geocoding from a selected pin and explicit address-to-map lookup.
- Store address/location/weekly opening hours in default Business settings.
- Keep current owner registration endpoint compatible during cutover; new Web
  account-first registration uses dedicated Auth endpoints. No new module/model.

## Constraints

Use shared UI/tokens/hooks; thin route pages; preserve Admin query/session
isolation and locale/safe returnTo rules. No production deployment, no DB reset,
no automatic migration execution. Preserve user changes in API main.ts.

Map tile URL is configurable; display visible OSM attribution. No tile scraping
or prefetching. Public Nominatim is accessed only through the API proxy, with
cache, timeout and serialized rate limiting. Do not implement per-keystroke
autocomplete. Browser location and address lookup require explicit user action.
Persist ISO country code and country-neutral address levels rather than
country-specific ward/district/state fields.

## Verification

Tests: pending account registration, verification-before-completion, session
expiry, no pending Admin tokens, resume, transaction attach/replay, schema
address/hours/location bounds, vi/en form rendering and Google compatibility.
Run API/Web/shared lint/typecheck/tests/build/token validation and browser QA
where available. Keep real Google account and location permissions as HITL.
