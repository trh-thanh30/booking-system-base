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
