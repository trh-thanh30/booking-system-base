import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getLocaleSwitchTarget,
  isLandingLocale,
  LANDING_LANGUAGES,
} from "../src/utils/locale-switch.utils.ts";

test("Landing locale switching supports only vi/en and preserves route, query and hash", () => {
  assert.deepEqual(
    LANDING_LANGUAGES.map(({ code }) => code),
    ["vi", "en"],
  );
  assert.equal(isLandingLocale("fr"), false);
  assert.equal(isLandingLocale("en"), true);
  assert.equal(
    getLocaleSwitchTarget("/signup-business", "?campaign=test", "#form"),
    "/signup-business?campaign=test#form",
  );
  assert.equal(getLocaleSwitchTarget("//external.example", "", ""), "/");
});
