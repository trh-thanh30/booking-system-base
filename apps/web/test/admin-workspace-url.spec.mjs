import assert from "node:assert/strict";
import test from "node:test";
import {
  isAdminWorkspaceHostname,
  buildAdminBaseUrl,
  buildTenantAdminUrl,
  isTenantWorkspaceHostname,
} from "../src/lib/admin/admin-workspace-url.ts";

test("development Admin URL stays on localhost and preserves locale and safe query", () => {
  assert.equal(
    buildTenantAdminUrl({
      baseUrl: "http://localhost:3001",
      locale: "en",
      tenantSlug: "acme",
      returnTo: "/vi/admin/bookings?status=pending",
    }),
    "http://localhost:3001/en/admin/bookings?status=pending",
  );

  assert.equal(
    buildTenantAdminUrl({
      baseUrl: "https://app.bookingbase.com",
      locale: "vi",
      tenantSlug: "spa-ha-noi",
      returnTo: "https://evil.test/steal",
    }),
    "https://spa-ha-noi.app.bookingbase.com/vi/admin/dashboard",
  );
});

test("production base and Tenant hosts bootstrap the Admin session", () => {
  assert.equal(
    isAdminWorkspaceHostname(
      "app.bookingbase.com",
      "https://app.bookingbase.com",
    ),
    true,
  );
  assert.equal(
    isAdminWorkspaceHostname(
      "acme.app.bookingbase.com",
      "https://app.bookingbase.com",
    ),
    true,
  );
  assert.equal(
    isAdminWorkspaceHostname("localhost", "http://localhost:3001"),
    false,
  );
});

test("tenant Admin URL rejects a slug that could alter the configured hostname", () => {
  for (const tenantSlug of ["", "Acme", "-acme", "acme-", "a.b", "evil/test"]) {
    assert.throws(() =>
      buildTenantAdminUrl({
        baseUrl: "https://app.bookingbase.com",
        locale: "en",
        tenantSlug,
        returnTo: "/admin/dashboard",
      }),
    );
  }
});

test("production uses a Tenant subdomain while development stays on localhost", () => {
  assert.equal(
    buildTenantAdminUrl({
      baseUrl: "https://app.bookingbase.com",
      locale: "vi",
      tenantSlug: "acme",
      returnTo: "/admin/dashboard",
    }),
    "https://acme.app.bookingbase.com/vi/admin/dashboard",
  );
  assert.equal(
    buildTenantAdminUrl({
      baseUrl: "http://localhost:3001",
      locale: "en",
      tenantSlug: "acme",
      returnTo: "/admin/dashboard",
    }),
    "http://localhost:3001/en/admin/dashboard",
  );
});

test("base Admin URL stays on the configured auth host", () => {
  assert.equal(
    buildAdminBaseUrl({
      baseUrl: "http://localhost:3001",
      locale: "en",
      pathname: "/admin/login?returnTo=%2Fadmin%2Fbookings",
    }),
    "http://localhost:3001/en/admin/login?returnTo=%2Fadmin%2Fbookings",
  );
});

test("workspace hostname only accepts one tenant label below the configured base", () => {
  assert.equal(
    isTenantWorkspaceHostname("acme.localhost", "http://localhost:3001"),
    false,
  );
  assert.equal(
    isTenantWorkspaceHostname(
      "acme.app.bookingbase.com",
      "https://app.bookingbase.com",
    ),
    true,
  );
  assert.equal(
    isTenantWorkspaceHostname("localhost", "http://localhost:3001"),
    false,
  );
  assert.equal(
    isTenantWorkspaceHostname(
      "nested.acme.app.bookingbase.com",
      "https://app.bookingbase.com",
    ),
    false,
  );
  assert.equal(
    isTenantWorkspaceHostname(
      "evil-bookingbase.com",
      "https://app.bookingbase.com",
    ),
    false,
  );
});
