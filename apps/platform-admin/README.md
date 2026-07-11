# Platform Admin

`apps/platform-admin` is the super admin portal for platform-level operations.

It is intentionally separate from `apps/admin`:

- `apps/admin`: business/tenant admin portal for owners, managers, and staff.
- `apps/platform-admin`: platform portal for super admins and internal operators.

Current scope:

- Platform login route.
- Platform dashboard shell.
- Tenant registry placeholder.
- Platform user management placeholder.
- System operations placeholder.

Backend dependency:

- `x-auth-context: platform`
- `POST /auth/login-platform`
- platform refresh/logout cookies: `platform_refresh_token`, `platform_has_rt`
- a dedicated super admin role, recommended as `SUPER_ADMIN`

Until the API supports that context, the app builds and renders but platform
login is not expected to succeed against the current auth module.
