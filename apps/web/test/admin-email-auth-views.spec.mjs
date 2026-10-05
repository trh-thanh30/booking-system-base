import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime.js";
import { VerifyEmailView } from "../src/views/admin/auth/verify-email.view.tsx";
import { ResetPasswordView } from "../src/views/admin/auth/reset-password.view.tsx";
import { ForgotPasswordView } from "../src/views/admin/auth/forgot-password.view.tsx";

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
  assert.equal((html.match(/data-slot="input-otp-slot"/g) ?? []).length, 6);
  assert.match(html, /15:00/);
  const resendAction = html.match(
    new RegExp(
      `<button[^>]*>${messages.Auth.verify.resend.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}<\\/button>`,
    ),
  )?.[0];
  assert.ok(resendAction);
  assert.match(resendAction, /text-primary/);
  assert.doesNotMatch(resendAction, /border-border/);
  assert.doesNotMatch(html, /secret-session|name="sessionId"|type="email"/);
});

test("verification without a session renders the public email request form", () => {
  for (const view of [VerifyEmailView, ForgotPasswordView]) {
    const html = render(view);
    assert.match(html, /type="email"/);
    assert.match(html, /lucide-mail/);
    const input = html.match(/<input[^>]*type="email"[^>]*>/)?.[0];
    assert.match(input, /bg-card/);
    assert.doesNotMatch(input, /bg-background/);
  }
});

test("reset without a session has actionable expired state and no editable session field", () => {
  const html = render(ResetPasswordView);
  assert.match(html, /forgot-password/);
  assert.doesNotMatch(html, /role="alert"|border-destructive/);
  assert.doesNotMatch(html, /name="sessionId"|type="password"/);
});

test("Auth API notifications do not render destructive banners inside forms", () => {
  const viewFiles = [
    "forgot-password.view.tsx",
    "google-onboarding.view.tsx",
    "login.view.tsx",
    "owner-onboarding.view.tsx",
    "reset-password.view.tsx",
    "verify-email.view.tsx",
  ];
  const source = viewFiles
    .map((file) =>
      readFileSync(
        new URL(`../src/views/admin/auth/${file}`, import.meta.url),
        "utf8",
      ),
    )
    .join("\n");

  assert.doesNotMatch(source, /<EmailAuthFeedback\b/);
  assert.doesNotMatch(source, /border-destructive\/30\s+bg-destructive\/10/);
});

test("valid reset session renders OTP and matching password fields without exposing the session", () => {
  const html = render(ResetPasswordView, {
    initialSessionId: "secret-session",
  });
  assert.match(html, /name="code"/);
  assert.match(html, /name="password"/);
  assert.match(html, /name="confirmPassword"/);
  for (const input of html.matchAll(/<input[^>]*>/g)) {
    assert.match(input[0], /bg-card/);
    assert.doesNotMatch(input[0], /bg-background/);
  }
  assert.doesNotMatch(html, /secret-session|name="sessionId"/);
});
