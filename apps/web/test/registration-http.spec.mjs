import assert from "node:assert/strict";
import test from "node:test";
import axios from "axios";
import {
  getAdminVerificationUrl,
  parseOwnerRegistration,
} from "../src/views/signup-business/utils/registration.utils.ts";

const calls = [];
const previousAdapter = axios.defaults.adapter;
axios.defaults.adapter = async (config) => {
  calls.push(config);
  return {
    config,
    data: {
      success: true,
      data: {
        sessionId: "opaque-session",
        tenant: { name: "Booking" },
        business: {},
        owner: {},
      },
    },
    status: 200,
    statusText: "OK",
    headers: {},
  };
};
const { authService } = await import("../src/services/auth.service.ts");
axios.defaults.adapter = previousAdapter;

test("manual registration posts Owner, Tenant and default Business then hands off without login or credentials", async () => {
  calls.length = 0;
  const parsed = parseOwnerRegistration({
    name: "Booking",
    slug: "booking",
    default_business_name: "First Branch",
    default_business_slug: "first-branch",
    owner: {
      username: "owner",
      email: "owner@example.com",
      password: "Password1",
      confirmPassword: "Password1",
    },
  });
  assert.equal(parsed.success, true);
  const result = await authService.registerOwner(parsed.data);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "/auth/register");
  assert.deepEqual(
    JSON.parse(calls[0].data),
    JSON.parse(JSON.stringify(parsed.data)),
  );
  assert.equal(calls[0].headers.get("Authorization"), undefined);
  assert.equal(result.access_token, undefined);
  assert.equal(
    getAdminVerificationUrl("http://localhost:3002", "en", result.sessionId),
    "http://localhost:3002/en/verify-email?sessionId=opaque-session",
  );
});
