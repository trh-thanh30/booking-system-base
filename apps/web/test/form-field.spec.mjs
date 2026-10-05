import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Input } from "@repo/ui";
import { FormField } from "../src/components/common/index.ts";

test("FormField marks required controls visually and semantically", () => {
  const required = renderToStaticMarkup(
    createElement(
      FormField,
      { htmlFor: "business-name", label: "Business name", required: true },
      createElement(Input, { id: "business-name" }),
    ),
  );
  const optional = renderToStaticMarkup(
    createElement(
      FormField,
      { htmlFor: "phone", label: "Phone" },
      createElement(Input, { id: "phone" }),
    ),
  );

  assert.match(required, /aria-hidden="true"[^>]*>\*<\/span>/);
  assert.match(required, /aria-required="true"/);
  assert.doesNotMatch(optional, />\*<\/span>|aria-required="true"/);
});

test("FormField does not decorate supporting content as a form control", () => {
  const markup = renderToStaticMarkup(
    createElement(
      FormField,
      { htmlFor: "password", label: "Password", required: true },
      createElement(Input, { id: "password" }),
      createElement("p", { className: "password-hint" }, "Use 8 characters"),
    ),
  );

  assert.match(markup, /<input[^>]*aria-required="true"/);
  assert.match(markup, /<p class="password-hint">Use 8 characters<\/p>/);
  assert.doesNotMatch(markup, /<p[^>]*(?:min-h-11|aria-required|aria-invalid)/);
});
