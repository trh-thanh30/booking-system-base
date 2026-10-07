import assert from "node:assert/strict";
import test from "node:test";
import {
  HttpClientError,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@repo/shared";
import {
  formatCountdown,
  getEmailAuthError,
  getSessionUrl,
  getUnverifiedEmailUrl,
} from "../src/views/admin/auth/utils/email-auth.utils.ts";

test("verification countdown formats a stable mm:ss value", () => {
  assert.equal(formatCountdown(900), "15:00");
  assert.equal(formatCountdown(61), "1:01");
  assert.equal(formatCountdown(-1), "0:00");
});

test("OTP is exactly six digits and reset password must match and have eight characters", () => {
  for (const code of ["12345", "1234567", "12345a", ""]) {
    assert.equal(
      verifyEmailSchema.safeParse({ sessionId: "session", code }).success,
      false,
    );
  }
  assert.equal(
    verifyEmailSchema.safeParse({ sessionId: "session", code: "012345" })
      .success,
    true,
  );
  const reset = {
    sessionId: "session",
    code: "012345",
    password: "Password1",
    confirmPassword: "Password1",
  };
  assert.equal(resetPasswordSchema.safeParse(reset).success, true);
  assert.equal(
    resetPasswordSchema.safeParse({ ...reset, sessionId: "" }).success,
    false,
  );
  assert.equal(
    resetPasswordSchema.safeParse({
      ...reset,
      password: "short",
      confirmPassword: "short",
    }).success,
    false,
  );
  assert.equal(
    resetPasswordSchema.safeParse({ ...reset, confirmPassword: "different" })
      .success,
    false,
  );
});

test("email-auth errors distinguish expired session, invalid OTP, rate limit and network without showing server messages", () => {
  const error = (status, message, details) =>
    new HttpClientError({ status, message, details, isNetworkError: false });
  assert.equal(
    getEmailAuthError(
      error(401, "Invalid or expired verification session"),
      "otp",
    ).key,
    "emailFlow.sessionExpired",
  );
  assert.equal(
    getEmailAuthError(error(400, "Invalid or expired verification code"), "otp")
      .key,
    "emailFlow.invalidCode",
  );
  assert.deepEqual(
    getEmailAuthError(error(429, "quota", { retryAfter: 120 }), "request"),
    { key: "emailFlow.rateLimited", expired: false, retryAfter: 120 },
  );
  assert.equal(
    getEmailAuthError(error(404, "User not found"), "request").key,
    "emailFlow.failed",
  );
  assert.equal(
    getEmailAuthError(
      error(400, "secret@example.com does not exist"),
      "request",
    ).key,
    "emailFlow.failed",
  );
  assert.equal(
    getEmailAuthError(
      new HttpClientError({ message: "network", isNetworkError: true }),
      "request",
    ).key,
    "emailFlow.networkError",
  );
});

test("verification handoff preserves only a safe returnTo and login EMAIL_NOT_VERIFIED uses its session", () => {
  const error = new HttpClientError({
    message: "Verify email",
    code: "EMAIL_NOT_VERIFIED",
    details: { sessionId: "a+b" },
    isNetworkError: false,
  });
  assert.equal(
    getUnverifiedEmailUrl(error, "/admin/bookings"),
    "/admin/verify-email?sessionId=a%2Bb&returnTo=%2Fadmin%2Fbookings",
  );
  assert.equal(
    getUnverifiedEmailUrl(new Error("other"), "/admin/bookings"),
    null,
  );
  assert.equal(
    getSessionUrl("verify-email", "s", "https://evil.test"),
    "/admin/verify-email?sessionId=s&returnTo=%2Fadmin%2Fdashboard",
  );
});
