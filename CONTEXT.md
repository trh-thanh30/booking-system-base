# Project Context

## Shared Language

- **Base repo**: reusable monorepo template that new products can fork or copy from.
- **Vertical slice**: a small task that passes through the relevant API, package, and UI layers to validate integration early.
- **Core module**: generic module that can be reused across domains, such as auth, users, settings, files, email, notifications, and health.
- **Domain module**: product-specific module, such as booking, ecommerce, CRM, inventory, or billing.
- **Platform Admin Portal**: `apps/platform-admin`, the super-admin surface for managing the whole SaaS platform.
- **Business Admin Portal**: `apps/admin`, the tenant workspace for a business owner and staff.
- **Tenant**: an organization/account boundary on the platform. It owns billing, users, domains, settings, and one or more businesses. Tenant-scoped APIs must not leak data across tenants.
- **Business**: an operational booking unit inside a tenant, such as a branch, brand, location, or store. Business-scoped APIs use `x-business-id` and `@RequireBusiness()` so booking/service/staff data stays inside `tenant_id + business_id`.
- **Super Admin**: global platform operator. Uses `SUPER_ADMIN`, does not require `tenant_id`, and authenticates with the `platform` context.
- **Owner**: tenant owner/business admin. Uses `OWNER`, belongs to one tenant, can access all businesses in that tenant, and authenticates with the `admin` context.
- **Staff**: tenant employee/operator. Uses `STAFF`, belongs to one tenant, can be scoped to businesses through `BusinessMembership`, and receives explicit `UserPermission` grants.
- **Customer**: public booking user. Uses `CUSTOMER` and authenticates with the `client` context.
- **Auth context**: app boundary sent with `x-auth-context`. Valid values are `platform`, `admin`, and `client`.

## Architecture Principles

- Keep template code generic. Domain code belongs in separate modules.
- Prefer deep modules with clear public interfaces over many shallow helper files.
- Shared packages must not import from apps.
- Apps may import from packages through workspace dependencies.
- Add tests around behavior and module contracts, not implementation details.
- Frontend i18n uses locale-prefixed routes with `vi` as the default locale and
  `en` as the secondary locale. Next.js apps own their `src/messages` catalogs
  and use app-local `src/i18n/navigation.ts` helpers for locale-aware links.
- Do not use one role to mean both global and tenant administration. Platform
  administration is `SUPER_ADMIN`; tenant administration is `OWNER`.
- Do not use `Tenant` to mean a physical business location. Use `Business`
  for branches/brands/locations under the tenant account.
- Business-scoped backend routes must resolve business context before use-case execution; controllers should receive `@Business()` rather than trusting a raw request body `business_id`.
