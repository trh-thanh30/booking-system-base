import assert from "node:assert/strict";
import test from "node:test";
import {
  findNativeHtmlViolations,
  scanClientNativeHtml,
} from "../../../../scripts/testing/native-html-policy.mjs";

test("Platform policy rejects native img and internal anchor without a reason", () => {
  assert.equal(findNativeHtmlViolations('<img src="/logo.svg" />').length, 1);
  assert.equal(
    findNativeHtmlViolations('<a href="/login">Login</a>').length,
    1,
  );
  assert.deepEqual(
    findNativeHtmlViolations('<a href="https://example.com">Help</a>'),
    [],
  );
});

test("Platform Admin source uses Next Image/Link outside explicit exceptions", async () => {
  const errors = await scanClientNativeHtml("platform-admin");
  assert.deepEqual(
    errors,
    [],
    `Platform native HTML violations:\n${errors.join("\n")}`,
  );
});
