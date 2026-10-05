import assert from "node:assert/strict";
import test from "node:test";
import {
  parseOwnerRegistration,
  getAdminVerificationUrl,
} from "../src/views/signup-business/utils/registration.utils.ts";

const registration = {
  name: " My Business ",
  slug: " my-business ",
  locale: "vi",
  timezone: "Asia/Ho_Chi_Minh",
  default_business_name: "",
  default_business_slug: "",
  primary_domain: "",
  owner: {
    username: " owner ",
    email: " owner@example.com ",
    password: "Password1",
    confirmPassword: "Password1",
    full_name: "",
    phone: "",
  },
};
test("registration normalizes optional business fields and validates the shared Owner contract", () => {
  const result = parseOwnerRegistration(registration);
  assert.equal(result.success, true);
  assert.equal(result.data.name, "My Business");
  assert.equal(result.data.owner.email, "owner@example.com");
  assert.equal(result.data.default_business_name, undefined);
  for (const owner of [
    { ...registration.owner, email: "bad" },
    { ...registration.owner, password: "short" },
    { ...registration.owner, confirmPassword: "mismatch" },
  ]) {
    assert.equal(
      parseOwnerRegistration({ ...registration, owner }).success,
      false,
    );
  }
});
test("Web hands off to localized Admin verification, not login, and encodes the opaque session", () => {
  assert.equal(
    getAdminVerificationUrl("https://admin.example.com/", "vi", "a+b"),
    "https://admin.example.com/vi/admin/verify-email?sessionId=a%2Bb",
  );
  assert.throws(() =>
    getAdminVerificationUrl("javascript:alert(1)", "vi", "s"),
  );
});
