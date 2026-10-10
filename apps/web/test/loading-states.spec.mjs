import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Store } from "lucide-react";
import { StatsCard } from "../src/components/common/stats-card.tsx";
import { SetupLoadingSkeleton } from "../src/views/admin/business-setup/components/setup-loading-skeleton.tsx";
import { OnboardingLoadingSkeleton } from "../src/views/admin/auth/components/onboarding-loading-skeleton.tsx";
import { NextIntlClientProvider } from "next-intl";
import { LocationPickerMap } from "../src/components/common/location-picker/location-picker-map.tsx";

test("loading stats do not announce a fabricated zero before the API responds", () => {
  const html = renderToStaticMarkup(
    createElement(StatsCard, {
      title: "Businesses",
      value: "0",
      description: "Live data",
      trend: "0/0",
      icon: Store,
      loading: true,
    }),
  );
  assert.match(html, /aria-busy="true"/);
  assert.doesNotMatch(html, />0<|0\/0/);
});
test("template loading shows the available nail template instead of placeholder layouts", () => {
  const html = renderToStaticMarkup(
    createElement(SetupLoadingSkeleton, {
      label: "Loading",
      formOnly: true,
      step: "BOOKING_TEMPLATE",
    }),
  );
  assert.equal((html.match(/data-template-placeholder/g) ?? []).length, 1);
  assert.doesNotMatch(html, /sm:grid-cols-\[1fr_2fr\]/);
  assert.match(html, /aria-busy="true"/);
});

test("onboarding skeleton announces loading without mounting an interactive form", () => {
  const html = renderToStaticMarkup(
    createElement(OnboardingLoadingSkeleton, { label: "Loading account" }),
  );
  assert.match(html, /role="status"/);
  assert.match(html, /Loading account/);
  assert.match(html, /motion-reduce:animate-none/);
  assert.doesNotMatch(html, /<input|<button|<form/);
});

test("map reserves its height and exposes a loading state before Leaflet initializes", () => {
  const html = renderToStaticMarkup(
    createElement(
      NextIntlClientProvider,
      {
        locale: "en",
        timeZone: "UTC",
        messages: { Map: { loading: "Loading map" } },
      },
      createElement(LocationPickerMap, {
        value: null,
        onChange() {},
        ariaLabel: "Business location",
      }),
    ),
  );
  assert.match(html, /role="region"[^>]*aria-busy="true"/);
  assert.match(html, /h-64/);
  assert.match(html, /role="status"/);
  assert.match(html, /Loading map/);
});
