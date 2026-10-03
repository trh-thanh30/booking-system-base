import assert from "node:assert/strict";
import test from "node:test";
import {
  getSafeReturnTo,
  isPublicAuthRoute,
} from "../src/lib/admin/auth-routing.ts";

test("public verification and Google onboarding do not require an Admin session", () => {
  assert.equal(isPublicAuthRoute("/admin/verify-email"), true);
  assert.equal(isPublicAuthRoute("/admin/onboarding/business"), true);
  assert.equal(isPublicAuthRoute("/admin/dashboard"), false);
});

test("returnTo preserves dashboard filters and rejects external or auth destinations", () => {
  assert.equal(
    getSafeReturnTo("/admin/bookings?status=pending"),
    "/admin/bookings?status=pending",
  );
  for (const path of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/admin/login",
    "/vi/admin/login",
    "/%2f%2fevil.test",
    "/api/v1/auth",
    "/unknown",
    "/vi",
    "/signup-business",
    "/admin/onboarding/business",
    "/admin/login?returnTo=/admin/dashboard",
  ]) {
    assert.equal(getSafeReturnTo(path), "/admin/dashboard");
  }
});
