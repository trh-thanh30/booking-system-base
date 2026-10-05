# ADR 0003 — One Web service for Landing and Business Admin

Date: 2026-10-03. Status: accepted; external production cutover requires approval.

## Decision

`apps/web` hosts Landing and tenant administration. `apps/admin` tracked source
is migrated, then removed. API/email worker and `apps/platform-admin` stay separate.
The Business Admin domain and `admin` JWT/cookie context do not change.

URLs are `/{locale}/admin/*` (real `admin` segment). `(marketing)` owns public SEO;
Admin metadata is noindex without Landing canonical. Auth and dashboard share
one Admin provider boundary, with its own private QueryClient; marketing never
bootstraps Admin. Leaving Admin clears local session state and private cache.
Shared UI tokens, FormField, locale helper, root font and Toaster are not copied.
One shared theme provider defaults Light; an explicit Admin theme choice also
applies to Landing on the same service. No system-theme auto-switch is added.

Backend redirects use `WEB_URL` then `NEXT_PUBLIC_WEB_URL`, with origin-only
configuration. OAuth state/callback and frontend use the same shared Admin
returnTo allowlist. The Google API callback URI and secure cookie paths stay
unchanged. Public HTTP clients cannot inherit Admin credentials/context.

CI builds/tests/scans one Web image, plus API and Platform Admin. Root `*:admin`
scripts remain compatibility aliases to Web. Marketing and Admin now release
together; routing/layout isolation does not imply separate deployment isolation.

## Cutover checklist (operator / HITL)

1. Set GitHub build variables `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WEB_URL` to
   public production origins. Next.js embeds public env at build, not container
   start. Set API `WEB_URL` to the same Web origin, without `/admin` suffix.
2. Keep the API Google callback in Google Console unchanged unless the API origin
   itself changes. Confirm Google test accounts and real-account login/onboarding.
3. Confirm existing CORS permits Web origin and existing cookies are readable
   by Web where needed. Host-only cookies from an old frontend host may require
   signing in again; do not copy tokens into URLs or loosen HttpOnly/SameSite.
4. If an old Admin domain is deployed, redirect **on that host only**:
   `/{locale}/{path}` → `https://web.example/{locale}/admin/{path}` and
   `/{locale}` → `https://web.example/{locale}/admin`. Preserve query parameters
   (sessionId, returnTo, oauthError), use a temporary redirect during validation,
   and never send a redirect back to the old host. Legacy returnTo values without
   `/admin` safely fall back to dashboard. No Web-wide `/login` redirect is added.
   If no old domain was deployed, skip these ingress compatibility rules.
5. Verify password/OTP/recovery, existing/new Google Owner, Business switch,
   logout, locale changes, public Landing and Platform Admin with deployed URLs.
6. Only then retire the old Admin container at deployment cutover. Keep the prior
   immutable image tags, Compose definition and env backup for rollback.

## Rollback

Pre-ARCH automatic image rollback cannot reconstruct a removed Admin service.
To restore a pre-merge release, restore the prior Git ref/Compose, env snapshot,
API + Web + Admin image tags and previous ingress routes **together**. Do not
delete old images. Database schema is unchanged by ARCH-001. After cutover, normal
image rollback works between compatible merged releases. No external host,
secret, running container or production deployment is modified by local work.
