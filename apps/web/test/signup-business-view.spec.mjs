import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryProvider } from "../src/app/providers/query-provider.tsx";
import { NextIntlClientProvider } from "next-intl";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime.js";
import { SignupBusinessView } from "../src/views/signup-business/signup-business.view.tsx";

test("Landing registration renders business and Owner fields with labels and no editable session", () => {
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
  for (const field of [
    "name",
    "slug",
    "default_business_name",
    "default_business_slug",
    "owner.username",
    "owner.email",
    "owner.password",
    "owner.confirmPassword",
  ]) {
    assert.ok(html.includes(`name="${field}"`));
  }
  assert.match(html, /for="owner-email"/);
  assert.ok(html.includes(messages.SignupBusiness.submit));
  assert.doesNotMatch(html, /name="sessionId"/);
});
