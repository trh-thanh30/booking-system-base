import assert from "node:assert/strict";
import test from "node:test";
import { getSafeReturnTo, isPublicAuthRoute } from "../src/lib/auth-routing.ts";

test("public verification and Google onboarding do not require an Admin session", () => {
  assert.equal(isPublicAuthRoute("/verify-email"), true);
  assert.equal(isPublicAuthRoute("/onboarding/business"), true);
  assert.equal(isPublicAuthRoute("/dashboard"), false);
});

test("returnTo preserves dashboard filters and rejects external or auth destinations", () => {
  assert.equal(
    getSafeReturnTo("/bookings?status=pending"),
    "/bookings?status=pending",
  );
  for (const path of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/login",
    "/vi/login",
    "/%2f%2fevil.test",
    "/api/v1/auth",
    "/unknown",
  ]) {
    assert.equal(getSafeReturnTo(path), "/dashboard");
  }
});
