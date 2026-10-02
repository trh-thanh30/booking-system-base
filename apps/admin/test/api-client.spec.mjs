import assert from "node:assert/strict";
import test from "node:test";
import axios, { AxiosError } from "axios";
import { setImmediate } from "node:timers";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  setTenantId,
} from "../src/lib/auth-token.ts";
import { createAdminSession } from "../src/lib/admin-session.ts";

let handle;
const previousAdapter = axios.defaults.adapter;
axios.defaults.adapter = async (config) => {
  const data = await handle(config);
  return {
    config,
    data: { success: true, data },
    headers: {},
    status: 200,
    statusText: "OK",
  };
};
const { apiClient, refreshAdminAccessToken } =
  await import("../src/lib/api-client.ts");
const { authService } = await import("../src/services/auth.service.ts");
const { useAdminUiStore } = await import("../src/app/stores/ui.store.ts");
axios.defaults.adapter = previousAdapter;

function reject401(config) {
  throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, {
    config,
    data: {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized" },
    },
    headers: {},
    status: 401,
    statusText: "Unauthorized",
  });
}

function browser(t) {
  globalThis.window = new EventTarget();
  globalThis.document = { cookie: "admin_has_rt=1" };
  clearAccessToken();
  t.after(() => {
    clearAccessToken();
    useAdminUiStore.getState().setActiveBusinessId(null);
    delete globalThis.window;
    delete globalThis.document;
  });
}

test("concurrent protected requests share the Admin refresh and send Tenant/Business headers", async (t) => {
  browser(t);
  setAccessToken("expired");
  setTenantId("tenant-a");
  useAdminUiStore.getState().setActiveBusinessId("business-a");
  let refreshes = 0;
  let release;
  const response = new Promise((resolve) => {
    release = resolve;
  });
  handle = async (config) => {
    assert.equal(config.withCredentials, true);
    if (config.url === "/auth/admin/refresh") {
      refreshes++;
      return response;
    }
    assert.equal(config.headers.get("x-auth-context"), "admin");
    assert.equal(config.headers.get("x-tenant-id"), "tenant-a");
    assert.equal(config.headers.get("x-business-id"), "business-a");
    if (config.headers.get("Authorization") !== "Bearer fresh")
      reject401(config);
    return { id: "protected" };
  };
  const requests = [apiClient.get("/bookings"), apiClient.get("/bookings")];
  await new Promise((resolve) => setImmediate(resolve));
  release({ access_token: "fresh" });
  await Promise.all(requests);
  assert.equal(refreshes, 1);
  assert.equal(getAccessToken(), "fresh");
});

test("failed refresh expires the session and login failure never starts refresh", async (t) => {
  browser(t);
  let expired = 0;
  let refreshes = 0;
  globalThis.window.addEventListener("booking:admin-session-expired", () => {
    expired++;
  });
  handle = async (config) => {
    if (config.url === "/auth/admin/refresh") refreshes++;
    reject401(config);
  };
  await assert.rejects(
    authService.loginAdmin({ usernameOrEmail: "owner", password: "wrong" }),
  );
  assert.equal(refreshes, 0);
  setAccessToken("expired");
  await assert.rejects(apiClient.get("/bookings"));
  assert.equal(refreshes, 1);
  assert.equal(expired, 1);
  assert.equal(getAccessToken(), undefined);
});

test("a refresh response arriving after logout cannot restore credentials", async (t) => {
  browser(t);
  let release;
  handle = () =>
    new Promise((resolve) => {
      release = resolve;
    });
  const pending = refreshAdminAccessToken();
  await new Promise((resolve) => setImmediate(resolve));
  clearAccessToken();
  release({ access_token: "stale" });
  assert.equal(await pending, false);
  assert.equal(getAccessToken(), undefined);
});

test("public email lifecycle endpoints send only their contracts without session credentials or automatic refresh", async (t) => {
  browser(t);
  setAccessToken("stale");
  setTenantId("tenant-a");
  useAdminUiStore.getState().setActiveBusinessId("business-a");
  const calls = [];
  handle = (config) => {
    calls.push(config.url);
    assert.equal(config.headers.get("Authorization"), undefined);
    assert.equal(config.headers.get("x-tenant-id"), undefined);
    assert.equal(config.headers.get("x-business-id"), undefined);
    if (config.url === "/auth/verify") reject401(config);
    return { sessionId: "opaque-session" };
  };
  assert.deepEqual(
    await authService.requestVerification({ email: "owner@example.com" }),
    { sessionId: "opaque-session" },
  );
  await authService.resendVerification({ sessionId: "opaque-session" });
  await assert.rejects(
    authService.verifyEmail({ sessionId: "opaque-session", code: "123456" }),
    (error) => error.status === 401,
  );
  assert.deepEqual(
    await authService.forgotPassword({ email: "owner@example.com" }),
    { sessionId: "opaque-session" },
  );
  await authService.resetPassword({
    sessionId: "opaque-session",
    code: "123456",
    password: "Password1",
    confirmPassword: "Password1",
  });
  assert.deepEqual(calls, [
    "/auth/request-verification",
    "/auth/resend-verification",
    "/auth/verify",
    "/auth/forgot-password",
    "/auth/reset-password",
  ]);
  assert.equal(getAccessToken(), "stale");
});

test("Google callback refresh cookie bootstraps existing Owner through refresh and /auth/me, without password login", async (t) => {
  browser(t);
  const owner = {
    id: "owner-google",
    role: "OWNER",
    status: "ACTIVE",
    is_verified: true,
    tenant_id: "tenant-g",
    tenant: { id: "tenant-g", status: "ACTIVE" },
    businesses: [{ id: "business-g", tenant_id: "tenant-g", is_default: true }],
    permissions: [],
  };
  const calls = [];
  handle = (config) => {
    calls.push(config.url);
    if (config.url === "/auth/admin/refresh")
      return { access_token: "google-access" };
    assert.equal(config.url, "/auth/me");
    assert.equal(config.headers.get("Authorization"), "Bearer google-access");
    return owner;
  };
  let context;
  const session = createAdminSession({
    hasRefreshMarker: () => true,
    getAccessToken,
    refresh: refreshAdminAccessToken,
    getMe: authService.getMe,
    login: authService.loginAdmin,
    logout: authService.logout,
    setAccessToken,
    clearCredentials: clearAccessToken,
    getActiveBusinessId: () => null,
    clearCache() {},
    setContext(user, businessId) {
      context = { user, businessId };
    },
  });
  assert.deepEqual(await session.bootstrap(), owner);
  assert.deepEqual(calls, ["/auth/admin/refresh", "/auth/me"]);
  assert.equal(context.businessId, "business-g");
});

test("Google onboarding uses cookie-based public GET/POST, with one request and no Admin refresh on expired cookie", async (t) => {
  browser(t);
  const calls = [];
  const profile = {
    email: "owner@example.com",
    full_name: "Google Owner",
    avatar_url: "https://lh3.googleusercontent.com/avatar",
  };
  handle = (config) => {
    calls.push(config);
    assert.equal(config.url, "/auth/admin/google/onboarding");
    assert.equal(config.withCredentials, true);
    assert.equal(config.headers.get("Authorization"), undefined);
    return config.method === "get"
      ? profile
      : {
          access_token: "google-access",
          user: {},
          locale: "en",
          return_to: "/dashboard",
        };
  };
  assert.deepEqual(await authService.getGoogleOnboardingProfile(), profile);
  const input = {
    name: "Tenant",
    slug: "tenant",
    owner: { username: "owner" },
    locale: "en",
    timezone: "Asia/Ho_Chi_Minh",
  };
  await authService.completeGoogleOnboarding(input);
  assert.equal(calls.length, 2);
  assert.deepEqual(JSON.parse(calls[1].data), input);
  handle = (config) => {
    calls.push(config);
    reject401(config);
  };
  await assert.rejects(
    authService.getGoogleOnboardingProfile(),
    (error) => error.status === 401,
  );
  assert.equal(calls.length, 3);
});
