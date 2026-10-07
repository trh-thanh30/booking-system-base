import assert from "node:assert/strict";
import test from "node:test";
import { createContactAvailabilityCheck } from "../src/views/admin/auth/utils/contact-availability.utils.ts";

test("a late duplicate response cannot overwrite a newly edited value", async () => {
  let value = "old";
  let finish;
  const states = [];
  const check = createContactAvailabilityCheck({
    getValue: () => value,
    request: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
    onStatus: (state) => states.push(state),
  });
  const pending = check();
  value = "new";
  finish({ available: false });
  assert.equal(await pending, false);
  assert.deepEqual(states, ["checking"]);
});

test("blur and Continue share a pending check, and failures never count as available", async () => {
  let calls = 0,
    finish;
  const states = [];
  const check = createContactAvailabilityCheck({
    getValue: () => "owner",
    request: () => {
      calls++;
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
    onStatus: (state) => states.push(state),
  });
  const first = check(),
    second = check();
  finish({ available: false });
  assert.equal(await first, false);
  assert.equal(await second, false);
  assert.equal(calls, 1);
  assert.deepEqual(states, ["checking", "unavailable"]);
  const fail = createContactAvailabilityCheck({
    getValue: () => "owner",
    request: async () => {
      throw new Error("offline");
    },
    onStatus: (state) => states.push(state),
  });
  assert.equal(await fail(), false);
  assert.equal(states.at(-1), "error");
});
