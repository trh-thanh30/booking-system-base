import assert from "node:assert/strict";
import test from "node:test";
import { createSessionRefresh } from "../dist/http/session-refresh.js";

test("a missing marker expires the local session without requesting a token", async () => {
  let requests = 0;
  let expired = 0;
  const refresh = createSessionRefresh({
    hasRefreshMarker: () => false,
    onAccessToken: () => {},
    onSessionExpired: () => {
      expired += 1;
    },
    requestAccessToken: async () => {
      requests += 1;
      return "new-token";
    },
  });

  assert.equal(await refresh(), false);
  assert.equal(requests, 0);
  assert.equal(expired, 1);
});

test("concurrent session refreshes request and store one access token", async () => {
  let requests = 0;
  let release;
  const tokens = [];
  const tokenResponse = new Promise((resolve) => {
    release = resolve;
  });
  const refresh = createSessionRefresh({
    hasRefreshMarker: () => true,
    onAccessToken: (token) => tokens.push(token),
    onSessionExpired: () => {},
    requestAccessToken: async () => {
      requests += 1;
      return tokenResponse;
    },
  });

  const first = refresh();
  const concurrent = refresh();
  await Promise.resolve();
  release("new-token");

  assert.equal(await first, "new-token");
  assert.equal(await concurrent, "new-token");
  assert.equal(requests, 1);
  assert.deepEqual(tokens, ["new-token"]);
});

test("a failed concurrent refresh expires the session once", async () => {
  let requests = 0;
  let expired = 0;
  const refresh = createSessionRefresh({
    hasRefreshMarker: () => true,
    onAccessToken: () => {},
    onSessionExpired: () => {
      expired += 1;
    },
    requestAccessToken: async () => {
      requests += 1;
      throw new Error("refresh failed");
    },
  });

  assert.deepEqual(await Promise.all([refresh(), refresh()]), [false, false]);
  assert.equal(requests, 1);
  assert.equal(expired, 1);
});
