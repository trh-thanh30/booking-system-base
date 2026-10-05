import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  LandingContainer,
  MarketingButton,
  PricingCard,
  SectionHeading,
  TestimonialCard,
} from "../src/components/common/landing-compositions.tsx";
import { createLandingMetadata } from "../src/utils/metadata.utils.ts";
import { cn } from "@repo/ui";
import {
  withColorAlpha,
  isHexColor,
} from "../src/views/home/utils/home.utils.ts";

test("custom type scale does not erase semantic text colors when merging classes", () => {
  assert.equal(
    cn("text-primary-foreground text-sm", "text-label"),
    "text-primary-foreground text-label",
  );
  assert.equal(
    cn("text-muted-foreground", "text-body"),
    "text-muted-foreground text-body",
  );
});

test("custom brand opacity accepts CSS tokens and validates native six-digit hex", () => {
  assert.equal(isHexColor("#006aff"), true);
  assert.equal(isHexColor("#garbage"), false);
  assert.match(
    withColorAlpha("var(--color-primary)", "80"),
    /color-mix\(in srgb, var\(--color-primary\) 50.20%, transparent\)/,
  );
});

test("marketing compositions reuse shared primitives and accessible variants", () => {
  const render = (component, props) =>
    renderToStaticMarkup(createElement(component, props));
  assert.match(render(LandingContainer, {}), /max-w-landing/);
  const button = render(MarketingButton, { disabled: true, children: "Try" });
  assert.match(button, /disabled=""/);
  assert.match(button, /focus-visible:ring-ring/);
  assert.match(button, /min-h-11/);
  assert.match(render(PricingCard, { featured: true }), /border-primary/);
  assert.doesNotMatch(render(PricingCard, {}), /ring-primary/);
  assert.match(render(SectionHeading, { title: "Features" }), /<h2/);
  assert.match(
    render(TestimonialCard, { quote: "Helpful", author: "Owner" }),
    /<blockquote/,
  );
});

test("metadata provides localized canonical/hreflang/Open Graph without indexing signup", () => {
  const en = createLandingMetadata("en");
  assert.equal(en.alternates.canonical, "/en");
  assert.equal(en.alternates.languages.vi, "/vi");
  assert.equal(en.openGraph.locale, "en_US");
  assert.equal(createLandingMetadata("unknown").alternates.canonical, "/vi");
  assert.equal(
    createLandingMetadata("vi", "/signup-business").robots.index,
    false,
  );
});

test("all six shared color scales include 50–950; core text pairs meet AA in light and dark", () => {
  const css = readFileSync(
    new URL("../../../packages/ui/src/styles/colors.css", import.meta.url),
    "utf8",
  );
  const colors = Object.fromEntries(
    [...css.matchAll(/--color-([\w-]+):\s*(#[\da-f]{6})/gi)].map(
      ([, key, value]) => [key, value],
    ),
  );
  for (const color of [
    "primary",
    "neutral",
    "success",
    "warning",
    "danger",
    "info",
  ])
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950])
      assert.ok(colors[`${color}-${step}`]);
  const luminance = (hex) => {
    const rgb = [1, 3, 5]
      .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const pairs = [
    ["neutral-950", "neutral-50"],
    ["neutral-600", "neutral-50"],
    ["primary-600", "#ffffff"],
    ["neutral-50", "neutral-900"],
    ["neutral-400", "neutral-950"],
    ["primary-500", "neutral-950"],
  ];
  for (const status of ["success", "warning", "danger", "info"])
    pairs.push(
      [`${status}-900`, `${status}-50`],
      [`${status}-200`, `${status}-950`],
    );
  for (const [fg, bg] of pairs) {
    const a = luminance(colors[fg] ?? fg),
      b = luminance(colors[bg] ?? bg);
    assert.ok(
      (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5,
      `${fg}/${bg} must meet AA`,
    );
  }
});
