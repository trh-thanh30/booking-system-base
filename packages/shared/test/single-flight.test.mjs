import assert from "node:assert/strict";
import test from "node:test";
import { createSingleFlight } from "../dist/http/single-flight.js";

test("concurrent calls share one operation and a later call starts a new one", async () => {
  let calls = 0;
  let release;
  const firstResult = new Promise((resolve) => {
    release = resolve;
  });
  const run = createSingleFlight(async () => {
    calls += 1;
    return calls === 1 ? firstResult : "second-token";
  });

  const first = run();
  const concurrent = run();

  assert.equal(calls, 0);
  release("first-token");
  assert.equal(await first, "first-token");
  assert.equal(await concurrent, "first-token");
  assert.equal(calls, 1);

  assert.equal(await run(), "second-token");
  assert.equal(calls, 2);
});
