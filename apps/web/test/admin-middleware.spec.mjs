import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import middleware from "../middleware.ts";

test("dashboard middleware redirects a guest to localized login with original filters", () => {
  const response = middleware(
    new NextRequest("http://localhost:3001/en/admin/bookings?status=pending"),
  );
  assert.equal(response.status, 307);
  const location = new URL(response.headers.get("location"));
  assert.equal(location.pathname, "/en/admin/login");
  assert.equal(
    location.searchParams.get("returnTo"),
    "/admin/bookings?status=pending",
  );
});

test("verification and onboarding stay public without an Admin refresh marker", () => {
  for (const path of [
    "/vi/admin/verify-email",
    "/en/admin/verify-email?sessionId=s",
    "/vi/admin/forgot-password",
    "/en/admin/reset-password?sessionId=s",
    "/en/admin/onboarding/business",
  ]) {
    const response = middleware(
      new NextRequest(`http://localhost:3001${path}`),
    );
    assert.equal(response.headers.get("location"), null);
  }
});

test("a stale marker does not force login back to dashboard and create a redirect loop", () => {
  const response = middleware(
    new NextRequest("http://localhost:3001/vi/admin/login", {
      headers: { cookie: "admin_has_rt=1" },
    }),
  );
  assert.equal(response.headers.get("location"), null);
});

test("Platform marker cannot unlock an Admin dashboard", () => {
  const response = middleware(
    new NextRequest("http://localhost:3001/vi/admin/dashboard", {
      headers: { cookie: "platform_has_rt=1" },
    }),
  );
  assert.equal(
    new URL(response.headers.get("location")).pathname,
    "/vi/admin/login",
  );
});
