import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime.js";
import { VerifyEmailView } from "../src/views/auth/verify-email.view.tsx";
import { ResetPasswordView } from "../src/views/auth/reset-password.view.tsx";
import { ForgotPasswordView } from "../src/views/auth/forgot-password.view.tsx";

const messages = JSON.parse(
  readFileSync(new URL("../src/messages/en.json", import.meta.url), "utf8"),
);
function render(component, props = {}) {
  return renderToStaticMarkup(
    createElement(
      AppRouterContext.Provider,
      { value: { replace() {}, push() {}, prefetch() {} } },
      createElement(
        NextIntlClientProvider,
        { locale: "en", messages, timeZone: "UTC" },
        createElement(
          QueryClientProvider,
          { client: new QueryClient() },
          createElement(component, props),
        ),
      ),
    ),
  );
}

test("verification handoff renders OTP without displaying or editing its session ID", () => {
  const html = render(VerifyEmailView, { initialSessionId: "secret-session" });
  assert.match(html, /autoComplete="one-time-code"/i);
  assert.match(html, /maxLength="6"/i);
  assert.ok(html.includes(messages.Auth.verify.resend));
  assert.doesNotMatch(html, /secret-session|name="sessionId"|type="email"/);
});

test("verification without a session renders the public email request form", () => {
  assert.match(render(VerifyEmailView), /type="email"/);
  assert.match(render(ForgotPasswordView), /type="email"/);
});

test("reset without a session has actionable expired state and no editable session field", () => {
  const html = render(ResetPasswordView);
  assert.match(html, /role="alert"/);
  assert.match(html, /invalid or expired/i);
  assert.match(html, /forgot-password/);
  assert.doesNotMatch(html, /name="sessionId"|type="password"/);
});

test("valid reset session renders OTP and matching password fields without exposing the session", () => {
  const html = render(ResetPasswordView, {
    initialSessionId: "secret-session",
  });
  assert.match(html, /name="code"/);
  assert.match(html, /name="password"/);
  assert.match(html, /name="confirmPassword"/);
  assert.doesNotMatch(html, /secret-session|name="sessionId"/);
});
