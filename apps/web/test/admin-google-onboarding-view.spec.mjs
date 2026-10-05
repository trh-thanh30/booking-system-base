import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { GoogleBusinessForm } from "../src/views/admin/auth/components/google-business-form.tsx";

const messages = JSON.parse(
  readFileSync(new URL("../src/messages/en.json", import.meta.url), "utf8"),
);
const profile = {
  email: "verified@example.com",
  full_name: "Google Owner",
  avatar_url: null,
};
function render(isPending = false) {
  return renderToStaticMarkup(
    createElement(
      NextIntlClientProvider,
      { locale: "en", messages, timeZone: "UTC" },
      createElement(GoogleBusinessForm, {
        profile,
        locale: "en",
        isPending,
        onSubmit: async () => {},
      }),
    ),
  );
}

test("Google onboarding displays verified identity, read-only email and workspace fields without a password", () => {
  const html = render();
  assert.match(html, /Google Owner/);
  assert.match(
    html,
    /id="google-email"[^>]*readOnly=""[^>]*value="verified@example.com"/i,
  );
  for (const name of [
    "owner.username",
    "owner.phone",
    "name",
    "slug",
    "default_business_name",
    "default_business_slug",
    "timezone",
    "locale",
    "primary_domain",
  ]) {
    assert.ok(html.includes(`name="${name}"`));
  }
  assert.doesNotMatch(
    html,
    /name="owner.email"|type="password"|name="password"/,
  );
});

test("onboarding form locks inputs and submit while workspace creation is pending", () => {
  const html = render(true);
  assert.match(html, /fieldset disabled=""/);
  assert.ok(html.includes(messages.Auth.google.completing));
});
