import assert from "node:assert/strict";
import test from "node:test";
import { routing } from "@/src/i18n/routing";
import { getAccessToken } from "@/src/lib/auth-token";

test("Platform test loader resolves TypeScript aliases against Platform, not Web", () => {
  assert.equal(routing.defaultLocale, "vi");
  assert.deepEqual(routing.locales, ["vi", "en"]);
  // This module exists only in Platform; the old Web-only alias root cannot load it.
  assert.equal(getAccessToken(), undefined);
});
