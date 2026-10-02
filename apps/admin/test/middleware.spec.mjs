import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import middleware from "../middleware.ts";

test("dashboard middleware redirects a guest to localized login with original filters", () => {
  const response = middleware(
    new NextRequest("http://localhost:3002/en/bookings?status=pending"),
  );
  assert.equal(response.status, 307);
  const location = new URL(response.headers.get("location"));
  assert.equal(location.pathname, "/en/login");
  assert.equal(
    location.searchParams.get("returnTo"),
    "/bookings?status=pending",
  );
});

test("verification and onboarding stay public without an Admin refresh marker", () => {
  for (const path of [
    "/vi/verify-email",
    "/en/verify-email?sessionId=s",
    "/vi/forgot-password",
    "/en/reset-password?sessionId=s",
    "/en/onboarding/business",
  ]) {
    const response = middleware(
      new NextRequest(`http://localhost:3002${path}`),
    );
    assert.equal(response.headers.get("location"), null);
  }
});

test("a stale marker does not force login back to dashboard and create a redirect loop", () => {
  const response = middleware(
    new NextRequest("http://localhost:3002/vi/login", {
      headers: { cookie: "admin_has_rt=1" },
    }),
  );
  assert.equal(response.headers.get("location"), null);
});

test("Platform marker cannot unlock an Admin dashboard", () => {
  const response = middleware(
    new NextRequest("http://localhost:3002/vi/dashboard", {
      headers: { cookie: "platform_has_rt=1" },
    }),
  );
  assert.equal(new URL(response.headers.get("location")).pathname, "/vi/login");
});
