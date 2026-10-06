# 0004. Account-first Owner registration and verified business setup

## Status

Accepted, 2026-10-03; amended 2026-10-07. Supersedes the registration timing
and single-endpoint restriction in ADR 0002; preserves its Auth → Tenant
boundary.

## Decision

- Email registration persists an ACTIVE, unverified OWNER with `tenant_id=null`
  and a hashed password. Its temporary internal username is replaced during setup.
- Email verification precedes Business information, address and operating hours.
- A pending Owner never receives Admin JWT/refresh tokens. Admin password login
  returns `EMAIL_NOT_VERIFIED` or, after verified credentials,
  `OWNER_ONBOARDING_REQUIRED`. An expiring HttpOnly ticket permits only onboarding.
- Google callback persists a verified, password-null Owner and Google identity
  before Business setup. Repeated Google login resumes that same pending account.
- Auth owns registration, verification and limited onboarding sessions. No new
  Nest module or database model is introduced.
- Tenant provisioning atomically creates Tenant/default Business/membership and
  conditionally attaches the verified, active Owner whose tenant is still null.
  A competing/replayed attach throws inside the transaction, rolling back the
  competing workspace. The existing password/identity is preserved.
- A country-neutral address contract stores `countryCode` (ISO alpha-2),
  `addressLine1`, optional `addressLine2`, `locality`, optional administrative
  levels 1/2, postal code, provider-formatted address and optional pin
  coordinates. It does not hard-code ward/district/state semantics into storage.
  Address and seven daily same-day opening intervals are validated using shared
  schemas and stored in `Business.settings.onboarding`.
  They are not copied into Tenant settings. Slot availability integration is a
  separate booking feature; these settings alone do not enforce bookable slots.
- Manual completion returns workspace information and redirects to login;
  Google completion establishes its existing Admin session.

## Public endpoints

Under the configured API prefix:

| Endpoint                             | Purpose                                                   |
| ------------------------------------ | --------------------------------------------------------- |
| POST /auth/admin/onboarding/register | Persist email Owner, return opaque verification sessionId |
| POST /auth/admin/onboarding/verify   | Verify OTP, issue limited onboarding cookie if needed     |
| POST /auth/admin/onboarding/login    | Resume pending verified Owner with valid credentials      |
| GET /auth/admin/onboarding           | Read verified pending Owner profile using ticket          |
| POST /auth/admin/onboarding          | Complete business setup using ticket                      |
| GET /common/geocoding/forward        | Resolve an explicitly submitted address to coordinates    |
| GET /common/geocoding/reverse        | Resolve an explicitly selected coordinate to an address   |

The legacy `POST /auth/register` remains compatible during cutover; the Web UI
no longer calls it. Existing OTP request/resend/password recovery endpoints are
reused. Existing Google onboarding tickets without userId remain supported until
they expire; new tickets bind to the persisted Owner.

## Map and privacy

Leaflet loads client-side. OSM tiles show visible attribution; endpoint is
configurable. Forward geocoding runs only when the user chooses **Find on map**;
reverse geocoding runs after an explicit map pin selection, drag or browser
location action. Public Nominatim is called through the API proxy with caching,
timeout and serialized rate limiting; it is never used for per-keystroke
autocomplete or tile prefetching. Provider-specific output is normalized into
the shared country-neutral address contract.

Denied location permissions and unavailable geocoding do not block manual entry.
No password, JWT or onboarding ticket is stored in URLs, localStorage or
sessionStorage. The Business form draft may be stored in localStorage under a
versioned key so it survives closing the tab. It is scoped to the verified
profile, expires after seven days and is validated with a draft-specific schema
before restoration. It remains independent from authentication credentials and
is removed after successful onboarding or explicit discard.
