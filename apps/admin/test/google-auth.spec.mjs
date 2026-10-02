import assert from "node:assert/strict";
import test from "node:test";
import { buildGoogleLoginUrl } from "../src/lib/auth-routing.ts";
import {
  createGoogleRedirect,
  getOAuthErrorKey,
  stripOAuthError,
  getGoogleOnboardingError,
} from "../src/views/auth/utils/google-auth.utils.ts";
import { HttpClientError } from "@repo/shared";
import { parseGoogleOnboarding } from "../src/views/auth/utils/google-onboarding.utils.ts";

test("Google login navigates once to API with safe locale and returnTo", () => {
  const url = new URL(
    buildGoogleLoginUrl(
      "https://api.example.com/api/v1/",
      "en",
      "/vi/bookings?status=pending",
    ),
  );
  assert.equal(url.pathname, "/api/v1/auth/admin/google");
  assert.equal(url.searchParams.get("locale"), "en");
  assert.equal(url.searchParams.get("returnTo"), "/bookings?status=pending");
  const unsafe = new URL(
    buildGoogleLoginUrl(
      "https://api.example.com/api/v1",
      "unsafe",
      "//evil.test",
    ),
  );
  assert.equal(unsafe.searchParams.get("locale"), "vi");
  assert.equal(unsafe.searchParams.get("returnTo"), "/dashboard");
  const calls = [];
  const redirect = createGoogleRedirect((value) => calls.push(value));
  assert.equal(redirect.start(url.href), true);
  assert.equal(redirect.start(url.href), false);
  assert.equal(calls.length, 1);
  redirect.reset();
  assert.equal(redirect.start(url.href), true);
});

test("Google onboarding validates shared contract, normalizes optional fields and never posts a password or editable Google email", () => {
  const input = {
    name: " Business ",
    slug: " business ",
    default_business_name: "",
    default_business_slug: "",
    primary_domain: "",
    owner: {
      username: " owner ",
      phone: "",
      email: "tampered@example.com",
      password: "fake",
    },
    locale: "en",
    timezone: "Asia/Ho_Chi_Minh",
  };
  const parsed = parseGoogleOnboarding(input);
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.owner.username, "owner");
  assert.equal(parsed.data.name, "Business");
  assert.equal(parsed.data.default_business_name, undefined);
  assert.equal(parsed.data.owner.password, undefined);
  assert.equal(parsed.data.owner.email, undefined);
  assert.equal(
    parseGoogleOnboarding({ ...input, locale: "unsupported" }).data.locale,
    "vi",
  );
  assert.equal(
    parseGoogleOnboarding({ ...input, owner: { username: " " } }).success,
    false,
  );
});

test("callback errors are translated, unknown codes stay generic and only oauthError is removed from the URL", () => {
  assert.equal(getOAuthErrorKey("GOOGLE_AUTH_CANCELLED"), "google.cancelled");
  assert.equal(
    getOAuthErrorKey("GOOGLE_IDENTITY_CONFLICT"),
    "google.identityConflict",
  );
  assert.equal(
    getOAuthErrorKey("GOOGLE_EMAIL_NOT_VERIFIED"),
    "google.emailNotVerified",
  );
  assert.equal(
    getOAuthErrorKey("<script>secret</script>"),
    "google.unavailable",
  );
  assert.equal(
    stripOAuthError(
      "http://localhost:3002/en/login?oauthError=GOOGLE_AUTH_CANCELLED&returnTo=%2Fbookings#form",
    ),
    "/en/login?returnTo=%2Fbookings#form",
  );
  assert.deepEqual(
    getGoogleOnboardingError(
      new HttpClientError({
        message: "expired",
        code: "GOOGLE_ONBOARDING_SESSION_INVALID",
        status: 401,
        isNetworkError: false,
      }),
    ),
    { key: "google.sessionExpired", terminal: true },
  );
  assert.deepEqual(
    getGoogleOnboardingError(
      new HttpClientError({
        message: "completed",
        code: "GOOGLE_ONBOARDING_ALREADY_COMPLETED",
        status: 409,
        isNetworkError: false,
      }),
    ),
    { key: "google.alreadyCompleted", terminal: true },
  );
});
