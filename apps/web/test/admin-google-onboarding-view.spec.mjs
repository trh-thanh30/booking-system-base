import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderToStaticMarkup(
    createElement(
      NextIntlClientProvider,
      { locale: "en", messages, timeZone: "UTC" },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(GoogleBusinessForm, {
          profile,
          locale: "en",
          isPending,
          onSubmit: async () => {},
        }),
      ),
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
  for (const name of ["owner.username", "owner.phone", "name", "timezone"]) {
    assert.ok(html.includes(`name="${name}"`));
  }
  assert.ok(!html.includes('name="slug"'));
  assert.ok(!html.includes('name="locale"'));
  assert.match(html, /Business category/);
  assert.match(html, /your-business\.bookingbase\.com/);
  assert.doesNotMatch(
    html,
    /name="owner.email"|type="password"|name="password"/,
  );
});

test("onboarding form locks inputs and submit while workspace creation is pending", () => {
  const html = render(true);
  assert.match(html, /fieldset disabled=""/);
  assert.ok(html.includes(messages.AuthJourney.completing));
});
