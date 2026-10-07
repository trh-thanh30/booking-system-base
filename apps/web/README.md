# Web — Landing + Business Admin

One Next.js app, image and frontend service on `WEB_PORT` (default `3001`).
Platform Admin remains a separate app for `SUPER_ADMIN`.

## Routes

- `/{locale}`: public Landing; `/{locale}/signup-business`: manual Owner registration.
- `/{locale}/admin/login`, `verify-email`, `forgot-password`, `reset-password`.
- `/{locale}/admin/onboarding/business`: first-time verified Google Owner.
- `/{locale}/admin/invitations/{token}`: existing invitation screen.
- `/{locale}/admin/dashboard`, `businesses`, `bookings`, `users`, `settings`, `system`.
- `/{locale}/admin`: session guard then dashboard/login. Locales: `vi`, `en`.

Marketing has no Admin bootstrap. One Admin layout owns AuthProvider and a private
QueryClient across auth/dashboard routes. DashboardShell validates the actual
profile and permissions before rendering; middleware only uses the readable
`admin_has_rt` marker for early guest redirects. Leaving Admin clears its local
credentials, context and private cache, without calling logout on the API.

Admin uses the existing `/auth/admin/*` API and memory-only access token.
Refresh token stays HttpOnly with the existing context-specific API cookie path.
Refresh is single-flight and late responses cannot restore a logged-out session.
Public registration/recovery/onboarding clients do not inherit JWT or workspace
headers. `returnTo` only allows local `/admin` dashboard routes.

`src/views/admin` owns Admin features; `src/lib/admin`, `src/services/admin`,
`src/app/providers/admin` and `src/components/layout/admin` isolate infrastructure
and shell. Shared primitives remain in `@repo/ui`; FormField, vi/en language
selector, fonts, global CSS and one Toaster are reused. One theme provider defaults
to Light; the existing Admin theme toggle controls the shared Web theme.

## Run and validate

```bash
pnpm dev:web
pnpm lint:web
pnpm typecheck:web
pnpm test:web
pnpm build:web
pnpm test:auth:smoke
```

Optional hydrated browser smoke (requires installed Chrome and workspace dependencies):

```bash
NEXT_DIST_DIR=.next-arch001 pnpm build:web
NEXT_DIST_DIR=.next-arch001 pnpm --filter @repo/web exec next start -p 3121
# In another terminal; all API calls are mocked, no real accounts/data changed:
pnpm test:web:browser
```

`FRONTEND_SMOKE_URL` may point to another localhost port; `CHROME_PATH` overrides
the Chrome binary. This checks locale/public boundaries, password session/reload,
Admin metadata, mobile overflow and Google onboarding completion using mock API.
Google Account authentication itself still needs real-account HITL verification.

Legacy `*:admin` root scripts are compatibility aliases to Web, not a second app.
Do not run `dev:web` and `dev:admin` together: both now start the same port/service.
If another `next dev` is running, use `NEXT_DIST_DIR=.next-arch001 pnpm build:web`
and the same environment variable for start/smoke to avoid overwriting `.next`.
Use `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WEB_URL`,
`NEXT_PUBLIC_ADMIN_WORKSPACE_URL` at build time and `WEB_URL`
(origin only, no `/admin` prefix) for backend Google redirects. Google authorized
callback remains the API `/api/v1/auth/admin/google/callback`.
Production API/Web subdomains must retain existing cookie-compatible Domain,
SameSite and CORS settings; do not broaden cookie Domain merely for this migration.
Set API runtime `ADMIN_WORKSPACE_URL` to the same Admin base origin. Production
also needs wildcard DNS/TLS for `{tenantSlug}.<admin-workspace-host>`.
Local development stays on `http://localhost:3001`; the URL builder only adds a
Tenant slug when the configured workspace base is not localhost. Register
`http://localhost:3000/api/v1/auth/admin/google/callback` as the development
Google OAuth redirect URI. Test the complete HTTPS Tenant-subdomain flow in
staging before production cutover.
See [cutover and rollback](../../docs/adr/0003-merge-web-business-admin.md).
