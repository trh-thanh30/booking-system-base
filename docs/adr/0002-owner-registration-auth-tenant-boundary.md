# 0002. Owner registration belongs to Auth and uses Tenant provisioning

## Status

Accepted

Registration timing and endpoint restriction are superseded by
[ADR 0004](0004-account-first-owner-onboarding.md). The Auth → Tenant boundary
and no-separate-Onboarding-module decision remain applicable.

## Context

The current phase has one public registration flow. A person registers as an
`OWNER`; the system creates a Tenant account, its default Business, and the
Owner's BusinessMembership. The Owner must then verify their email before
signing in through the Business Admin auth context.

Previously, Auth had a generic user-registration use case while Tenant had a
second public signup use case that also hashed passwords, created verification
sessions, generated OTPs, and queued email. This duplicated registration
behavior and made Tenant depend on authentication concerns.

## Decision

- `POST /auth/register` is the only public registration endpoint in this
  phase. It always creates an `OWNER`; callers cannot choose a role.
- Auth owns identity uniqueness checks, credential validation, password
  hashing, verification sessions, OTP generation, and verification email.
- Tenant exposes `CreateTenantWorkspaceUseCase` as a narrow provisioning
  operation. It creates Tenant settings, optional domain, default Business,
  Owner record, and BusinessMembership in one database transaction.
- The dependency direction is Auth to Tenant. Tenant provisioning must not
  import Auth, Verification, Email, or HTTP registration DTOs.
- Registration returns the Tenant, default Business, unverified Owner, and a
  verification `sessionId`. It does not issue access or refresh tokens.
- Staff joins a Tenant through invitation. Public Customer registration is
  outside the current phase, although the `CUSTOMER` role remains in the
  domain model for future work.
- No separate Onboarding module is introduced.

## Consequences

Registration, verification, and login remain separate steps. The public Web
calls Auth for registration, while Business Admin handles Owner verification
and login. Tenant remains focused on workspace data and transactional
invariants. A future Customer registration flow should use a dedicated Auth
workflow instead of adding role switches to Owner registration.

Assigning invited Staff to one or more businesses remains a separate follow-up
because the current invitation flow does not create BusinessMembership.
