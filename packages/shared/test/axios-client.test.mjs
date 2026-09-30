import assert from "node:assert/strict";
import test from "node:test";
import { AxiosError } from "axios";
import { createHttpClient } from "../dist/http/axios-client.js";
import { HttpClientError } from "../dist/http/http.types.js";

function unauthorized(config) {
  return new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, {
    config,
    data: { message: "Unauthorized" },
    headers: {},
    status: 401,
    statusText: "Unauthorized",
  });
}

test("a request that already retried does not trigger another refresh", async () => {
  let refreshCalls = 0;
  const client = createHttpClient({
    onUnauthorized: async () => {
      refreshCalls += 1;
      return "new-access-token";
    },
  });

  client.defaults.adapter = async (config) => {
    throw unauthorized(config);
  };

  await assert.rejects(client.get("/protected"));
  assert.equal(refreshCalls, 1);
});

test("an excluded unauthorized request does not start session refresh", async () => {
  let refreshCalls = 0;
  const client = createHttpClient({
    onUnauthorized: async () => {
      refreshCalls += 1;
      return "new-access-token";
    },
    shouldHandleUnauthorized: () => false,
  });

  client.defaults.adapter = async (config) => {
    throw unauthorized(config);
  };

  await assert.rejects(client.post("/auth/admin/login"));
  assert.equal(refreshCalls, 0);
});

test("request interceptors resolve the latest token and dynamic headers", async () => {
  let token = "first-token";
  let tenant = "tenant-1";
  const requests = [];
  const client = createHttpClient({
    getAccessToken: () => token,
    getHeaders: () => ({ "x-tenant-id": tenant }),
  });

  client.defaults.adapter = async (config) => {
    requests.push({
      authorization: config.headers.get("Authorization"),
      tenant: config.headers.get("x-tenant-id"),
    });
    return {
      config,
      data: { success: true },
      headers: {},
      status: 200,
      statusText: "OK",
    };
  };

  await client.get("/protected");
  token = "second-token";
  tenant = "tenant-2";
  await client.get("/protected");

  assert.deepEqual(requests, [
    { authorization: "Bearer first-token", tenant: "tenant-1" },
    { authorization: "Bearer second-token", tenant: "tenant-2" },
  ]);
});

test("a successful refresh retries the original request once with the new token", async () => {
  let attempts = 0;
  let refreshCalls = 0;
  const client = createHttpClient({
    onUnauthorized: async () => {
      refreshCalls += 1;
      return "refreshed-token";
    },
  });

  client.defaults.adapter = async (config) => {
    attempts += 1;
    if (attempts === 1) {
      throw unauthorized(config);
    }

    assert.equal(config.headers.get("Authorization"), "Bearer refreshed-token");
    return {
      config,
      data: { success: true },
      headers: {},
      status: 200,
      statusText: "OK",
    };
  };

  assert.deepEqual(await client.get("/protected"), { success: true });
  assert.equal(attempts, 2);
  assert.equal(refreshCalls, 1);
});

test("the final Axios error is exposed as HttpClientError", async () => {
  const client = createHttpClient();
  client.defaults.adapter = async (config) => {
    throw new AxiosError(
      "Unprocessable Entity",
      "ERR_BAD_REQUEST",
      config,
      undefined,
      {
        config,
        data: { code: "INVALID_INPUT", message: "Invalid input" },
        headers: {},
        status: 422,
        statusText: "Unprocessable Entity",
      },
    );
  };

  await assert.rejects(client.post("/bookings"), (error) => {
    assert.ok(error instanceof HttpClientError);
    assert.equal(error.message, "Invalid input");
    assert.equal(error.status, 422);
    assert.equal(error.isNetworkError, false);
    return true;
  });
});

test("nested API errors preserve domain code and details", async () => {
  const client = createHttpClient();
  client.defaults.adapter = async (config) => {
    throw new AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      config,
      undefined,
      {
        config,
        data: {
          success: false,
          error: {
            code: "EMAIL_NOT_VERIFIED",
            message: "Please verify your email before logging in",
            details: { sessionId: "verify-session" },
          },
        },
        headers: {},
        status: 422,
        statusText: "Unprocessable Entity",
      },
    );
  };

  await assert.rejects(client.post("/auth/admin/login"), (error) => {
    assert.ok(error instanceof HttpClientError);
    assert.equal(error.code, "EMAIL_NOT_VERIFIED");
    assert.equal(error.message, "Please verify your email before logging in");
    assert.deepEqual(error.details, { sessionId: "verify-session" });
    return true;
  });
});
