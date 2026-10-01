import assert from "node:assert/strict";
import test from "node:test";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  getTenantId,
  setTenantId,
} from "../src/lib/auth-token.ts";

test("access token and tenant stay in memory, never read persisted credentials", () => {
  let writes = 0;
  globalThis.window = {};
  globalThis.localStorage = {
    getItem: () => "stale-token",
    setItem: () => {
      writes++;
    },
    removeItem: () => {},
  };
  clearAccessToken();
  assert.equal(getAccessToken(), undefined);
  setAccessToken("new-token");
  setTenantId("tenant-a");
  assert.equal(getAccessToken(), "new-token");
  assert.equal(getTenantId(), "tenant-a");
  assert.equal(writes, 0);
  clearAccessToken();
  assert.equal(getTenantId(), undefined);
  delete globalThis.window;
  delete globalThis.localStorage;
});
