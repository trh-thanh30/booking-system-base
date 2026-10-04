import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryProvider } from "../src/app/providers/query-provider.tsx";
import { NextIntlClientProvider } from "next-intl";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime.js";
import { SignupBusinessView } from "../src/views/signup-business/signup-business.view.tsx";

test("Landing registration only collects account details before verification and business setup", () => {
  const messages = JSON.parse(
    readFileSync(new URL("../src/messages/vi.json", import.meta.url), "utf8"),
  );
  const html = renderToStaticMarkup(
    createElement(
      AppRouterContext.Provider,
      { value: { replace() {}, push() {}, prefetch() {} } },
      createElement(
        NextIntlClientProvider,
        { locale: "vi", messages, timeZone: "UTC" },
        createElement(QueryProvider, null, createElement(SignupBusinessView)),
      ),
    ),
  );
  for (const field of ["email", "password", "confirmPassword"]) {
    assert.ok(html.includes(`name="${field}"`));
  }
  assert.match(html, /for="owner-email"/);
  assert.ok(html.includes(messages.AuthJourney.continueEmail));
  assert.doesNotMatch(html, /name="slug"|name="name"|name="owner.username"/);
  assert.doesNotMatch(html, /name="sessionId"/);
  const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  assert.ok(header, "Auth uses the shared site header");
  assert.match(header, /aria-label="BookingBase"/);
  assert.doesNotMatch(header, /<nav\b|aria-haspopup="dialog"/);
  assert.doesNotMatch(header, /lucide-calendar-days/);
  for (const field of ["email", "password", "confirmPassword"]) {
    const input = html.match(
      new RegExp(`<input[^>]*name="${field}"[^>]*>`),
    )?.[0];
    assert.ok(input);
    assert.match(input, /placeholder="[^"]+"/);
  }
  assert.match(html, /lucide-lock/);
  assert.match(html, /lucide-mail/);
  for (const input of html.matchAll(/<input[^>]*>/g)) {
    assert.match(input[0], /bg-card/);
    assert.doesNotMatch(input[0], /bg-background/);
  }
  assert.match(html, /hover:bg-transparent/);
  assert.match(html, /src="\/icons\/google.svg"/);
  assert.match(html, /data-nimg="1"/);
});
