import assert from "node:assert/strict";
import test from "node:test";
import { createSetupServices } from "../src/views/admin/business-setup/utils/setup-services.utils.ts";

test("multiple setup services are created before fetching the next step", async () => {
  const calls = [],
    saved = [];
  const api = {
    createService: async (input) => {
      calls.push(input.name);
    },
    getSummary: async () => {
      calls.push("summary");
      return { next_step: "BOOKING_TEMPLATE" };
    },
  };
  const items = [1, 2].map((key) => ({
    key,
    input: { name: `Service ${key}` },
  }));
  assert.equal(
    (await createSetupServices(api, items, (key) => saved.push(key))).next_step,
    "BOOKING_TEMPLATE",
  );
  assert.deepEqual(calls, ["Service 1", "Service 2", "summary"]);
  assert.deepEqual(saved, [1, 2]);
});

test("retry excludes successfully saved rows after a later service fails", async () => {
  const saved = [],
    calls = [];
  let fail = true;
  const items = [1, 2].map((key) => ({
    key,
    input: { name: `Service ${key}` },
  }));
  const api = {
    createService: async (input) => {
      calls.push(input.name);
      if (input.name === "Service 2" && fail) throw new Error("offline");
    },
    getSummary: async () => ({ next_step: "BOOKING_TEMPLATE" }),
  };
  await assert.rejects(
    createSetupServices(api, items, (key) => saved.push(key)),
    /offline/,
  );
  assert.deepEqual(saved, [1]);
  fail = false;
  await createSetupServices(
    api,
    items.filter((item) => !saved.includes(item.key)),
    (key) => saved.push(key),
  );
  assert.deepEqual(calls, ["Service 1", "Service 2", "Service 2"]);
});
