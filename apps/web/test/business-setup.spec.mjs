import assert from "node:assert/strict";
import test from "node:test";
import {
  getSetupViewDestination,
  getSetupDestination,
  completeFirstService,
  setupQueryKey,
  getSetupEntryDestination,
} from "../src/views/admin/business-setup/utils/business-setup.utils.ts";
import { getPostAuthReturnTo } from "../src/lib/admin/auth-routing.ts";

test("setup view keeps accepted data during refetch without trusting a new Business cache", () => {
  const query = { isFetchedAfterMount: true, isFetching: true, isError: false };
  const summary = { status: "IN_PROGRESS" };
  assert.equal(
    getSetupViewDestination("OWNER", summary, query, true),
    "/admin/business-setup",
  );
  assert.equal(getSetupViewDestination("OWNER", summary, query, false), null);
  assert.equal(
    getSetupViewDestination(
      "OWNER",
      summary,
      { ...query, isFetching: false, isError: true },
      true,
    ),
    "/admin/business-setup",
  );
});

test("entry waits for a successful fresh summary instead of redirecting from cached completion", () => {
  const cached = { status: "COMPLETED" };
  assert.equal(
    getSetupEntryDestination("OWNER", cached, {
      isFetchedAfterMount: false,
      isFetching: false,
      isError: false,
    }),
    null,
  );
  assert.equal(
    getSetupEntryDestination("OWNER", cached, {
      isFetchedAfterMount: true,
      isFetching: true,
      isError: false,
    }),
    null,
  );
  assert.equal(
    getSetupEntryDestination("OWNER", cached, {
      isFetchedAfterMount: true,
      isFetching: false,
      isError: true,
    }),
    null,
  );
  assert.equal(
    getSetupEntryDestination(
      "OWNER",
      { status: "IN_PROGRESS" },
      { isFetchedAfterMount: true, isFetching: false, isError: false },
    ),
    "/admin/business-setup",
  );
  assert.equal(
    getSetupEntryDestination("STAFF", undefined, {
      isFetchedAfterMount: false,
      isFetching: false,
      isError: false,
    }),
    "/admin/dashboard",
  );
});

test("default post-auth entry checks setup while explicit Dashboard access remains available", () => {
  assert.equal(getPostAuthReturnTo(undefined), "/admin/business-setup/entry");
  assert.equal(getPostAuthReturnTo("/admin/dashboard"), "/admin/dashboard");
  assert.equal(
    getPostAuthReturnTo("/vi/admin/business-setup"),
    "/admin/business-setup",
  );
  assert.equal(getPostAuthReturnTo("//evil.test"), "/admin/dashboard");
});

test("Owner enters only incomplete setup; Staff and skipped/completed go to Dashboard", () => {
  for (const status of ["NOT_STARTED", "IN_PROGRESS"]) {
    assert.equal(
      getSetupDestination("OWNER", { status }),
      "/admin/business-setup",
    );
    assert.equal(getSetupDestination("STAFF", { status }), "/admin/dashboard");
  }
  for (const status of ["SKIPPED", "COMPLETED"]) {
    assert.equal(getSetupDestination("OWNER", { status }), "/admin/dashboard");
  }
});

test("query cache separates both Tenant and Business contexts", () => {
  assert.notDeepEqual(setupQueryKey("t1", "b1"), setupQueryKey("t1", "b2"));
  assert.notDeepEqual(setupQueryKey("t1", "b1"), setupQueryKey("t2", "b1"));
});

test("an existing active Service continues without creating another", async () => {
  const summary = {
    status: "IN_PROGRESS",
    next_step: "BOOKING_TEMPLATE",
    steps: { first_service: true },
  };
  let created = 0;
  assert.equal(
    await completeFirstService(
      {
        getSummary: async () => summary,
        createService: async () => {
          created++;
        },
      },
      null,
    ),
    summary,
  );
  assert.equal(created, 0);
});

test("creates the first Service then reloads backend progress", async () => {
  let created = false;
  const complete = {
    status: "IN_PROGRESS",
    next_step: "BOOKING_TEMPLATE",
    steps: { first_service: true },
  };
  const api = {
    getSummary: async () =>
      created ? complete : { steps: { first_service: false } },
    createService: async (input) => {
      assert.equal(input.status, "ACTIVE");
      created = true;
    },
  };
  assert.equal(
    await completeFirstService(api, {
      name: "Haircut",
      duration_minutes: 30,
      price_amount: 100000,
    }),
    complete,
  );
});

test("Service errors do not fabricate completed progress", async () => {
  const error = new Error("API unavailable");
  await assert.rejects(
    completeFirstService(
      {
        getSummary: async () => ({ steps: { first_service: false } }),
        createService: async () => {
          throw error;
        },
      },
      { name: "Haircut" },
    ),
    error,
  );
});
