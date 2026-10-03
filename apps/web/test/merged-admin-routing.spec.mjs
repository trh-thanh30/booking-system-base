import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import middleware from "../middleware.ts";

test("merged frontend redirects only private Admin routes, not marketing", () => {
  const response = middleware(
    new NextRequest("http://localhost:3001/en/admin/bookings?status=pending"),
  );
  const location = new URL(response.headers.get("location"));
  assert.equal(location.pathname, "/en/admin/login");
  assert.equal(
    location.searchParams.get("returnTo"),
    "/admin/bookings?status=pending",
  );
  for (const path of [
    "/vi",
    "/en/signup-business",
    "/vi/admin/verify-email?sessionId=s",
    "/en/admin/onboarding/business",
  ]) {
    assert.equal(
      middleware(new NextRequest(`http://localhost:3001${path}`)).headers.get(
        "location",
      ),
      null,
    );
  }
});

test("private Admin root and unknown Admin routes do not bypass the guest boundary", () => {
  for (const path of ["/vi/admin", "/en/admin/unknown", "/admin/dashboard"]) {
    const response = middleware(
      new NextRequest(`http://localhost:3001${path}`),
    );
    assert.equal(response.status, 307);
    assert.match(
      new URL(response.headers.get("location")).pathname,
      /^\/(vi|en)\/admin\/login$/,
    );
  }
});

test("Admin marker never turns marketing routes into private routes", () => {
  for (const cookie of [
    "admin_has_rt=1",
    "platform_has_rt=1",
    "client_has_rt=1",
  ]) {
    for (const path of ["/vi", "/en/signup-business"]) {
      const response = middleware(
        new NextRequest(`http://localhost:3001${path}`, {
          headers: { cookie },
        }),
      );
      assert.equal(response.headers.get("location"), null);
    }
  }
});
