import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import {
  getLoginErrorKey,
  getLoginValidationErrorKey,
} from "../src/views/admin/auth/utils/auth.utils.ts";

test("login errors map to translated actionable messages without exposing raw errors", () => {
  const error = (payload) =>
    new HttpClientError({
      message: "internal error",
      isNetworkError: false,
      ...payload,
    });
  assert.equal(
    getLoginErrorKey(error({ status: 401 })),
    "login.invalidCredentials",
  );
  assert.equal(
    getLoginErrorKey(
      error({ status: 422, message: "Invalid email/username or password" }),
    ),
    "login.invalidCredentials",
  );
  assert.equal(
    getLoginErrorKey(
      error({
        status: 422,
        message: "Account is inactive. Please contact support",
      }),
    ),
    "login.inactive",
  );
  assert.equal(
    getLoginErrorKey(error({ isNetworkError: true })),
    "login.networkError",
  );
  assert.equal(getLoginErrorKey(error({ status: 429 })), "login.rateLimited");
  assert.equal(
    getLoginErrorKey(new Error("ADMIN_PROFILE_INVALID")),
    "login.invalidWorkspace",
  );
  assert.equal(getLoginErrorKey(error({ status: 500 })), "login.failed");
});

test("login field validation maps to localized message keys", () => {
  assert.equal(
    getLoginValidationErrorKey("usernameOrEmail"),
    "login.usernameOrEmailRequired",
  );
  assert.equal(
    getLoginValidationErrorKey("password"),
    "login.passwordRequired",
  );
});
