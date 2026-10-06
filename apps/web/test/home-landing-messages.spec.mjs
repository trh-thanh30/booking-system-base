import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { TemplateCard } from "../src/views/home/sections/hero/components/TemplateCard.tsx";
import { TEMPLATES_SHOWCASE } from "../src/views/home/sections/hero/data/hero.data.ts";
import { PillarsSection } from "../src/views/home/sections/pillars/PillarsSection.tsx";
import { CustomizationSection } from "../src/views/home/sections/customization/CustomizationSection.tsx";
import { BentoFeaturesSection } from "../src/views/home/sections/features/BentoFeaturesSection.tsx";
import { Pricing } from "../src/views/home/sections/pricing.tsx";
import {
  formatDemoPrice,
  getDemoAmount,
  getLocaleCurrency,
} from "../src/views/home/utils/demo-currency.utils.ts";

const messageRoot = new URL(
  "../src/messages/landing-page-home/",
  import.meta.url,
);

function collectLeaves(value, prefix = "") {
  if (typeof value === "string") {
    assert.notEqual(value.trim(), "", `${prefix} must not be empty`);
    assert.doesNotMatch(
      value,
      /\uFFFD|\?(?!\s*$)|\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]/u,
      `${prefix} contains corrupted text encoding`,
    );
    if (prefix.includes(".names.") || prefix.endsWith(".author")) {
      assert.doesNotMatch(value, /\?/, `${prefix} contains a damaged name`);
    }
    return [prefix];
  }

  assert.ok(value && typeof value === "object", `${prefix} must be an object`);
  return Object.entries(value).flatMap(([key, child]) =>
    collectLeaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

test("Home landing locales expose the same non-empty message keys", async () => {
  const [english, vietnamese] = await Promise.all(
    ["en", "vi"].map(async (locale) =>
      JSON.parse(
        await readFile(new URL(`${locale}.json`, messageRoot), "utf8"),
      ),
    ),
  );

  assert.deepEqual(
    collectLeaves(vietnamese).sort(),
    collectLeaves(english).sort(),
  );
});

test("Home demo cards render localized business names and copy without missing messages", async () => {
  for (const locale of ["en", "vi"]) {
    const messages = JSON.parse(
      await readFile(new URL(`${locale}.json`, messageRoot), "utf8"),
    );
    const errors = [];
    for (const tmpl of TEMPLATES_SHOWCASE) {
      const html = renderToStaticMarkup(
        createElement(
          NextIntlClientProvider,
          {
            locale,
            timeZone: "Asia/Ho_Chi_Minh",
            messages: { landing_page_home: messages },
            onError: (error) => errors.push(error),
          },
          createElement(TemplateCard, { tmpl }),
        ),
      );
      const name = messages.hero.templates[tmpl.id].name.replaceAll(
        "&",
        "&amp;",
      );
      assert.ok(
        html.includes(name),
        `${locale}/${tmpl.id} uses its localized name`,
      );
      assert.ok(html.includes(messages.hero.instantBooking));
      assert.ok(html.includes(formatDemoPrice(tmpl.services[0].price, locale)));
      if (locale === "vi" && tmpl.id === "creative") {
        assert.doesNotMatch(html, /Kroma Visual Studio/);
      }
    }
    assert.deepEqual(
      errors,
      [],
      `${locale} cards must resolve all translation keys`,
    );
  }
});

test("Demo currency follows locale and the order total includes 8% tax", () => {
  assert.equal(getLocaleCurrency("vi"), "VND");
  assert.equal(getLocaleCurrency("en"), "USD");
  assert.equal(formatDemoPrice(45, "en"), "$45.00");
  assert.match(formatDemoPrice(45, "vi"), /1\.125\.000.*₫/);
  const subtotal = 65 + 32;
  const tax = subtotal * 0.08;
  assert.equal(getDemoAmount(subtotal + tax, "vi"), 2_619_000);
  assert.equal(formatDemoPrice(subtotal + tax, "en"), "$104.76");
});

test("Landing mockups and pricing use localized people, currency and plan labels", async () => {
  for (const locale of ["vi", "en"]) {
    const messages = JSON.parse(
      await readFile(new URL(`${locale}.json`, messageRoot), "utf8"),
    );
    const errors = [];
    const render = (component) =>
      renderToStaticMarkup(
        createElement(
          NextIntlClientProvider,
          {
            locale,
            timeZone: "Asia/Ho_Chi_Minh",
            messages: { landing_page_home: messages },
            onError: (error) => errors.push(error),
          },
          createElement(component),
        ),
      );
    const pillars = render(PillarsSection);
    assert.ok(pillars.includes(formatDemoPrice(104.76, locale)));
    assert.ok(pillars.includes(messages.pillars.demo.names.christina));
    const customization = render(CustomizationSection);
    if (locale === "vi") {
      assert.ok(customization.includes("Nguyễn Minh Anh"));
      assert.ok(customization.includes("Nguyễn Thanh Mai"));
      assert.ok(customization.includes("Trần Ngọc Linh"));
    }
    assert.ok(
      customization.includes(messages.customization.testimonials.author),
    );
    assert.ok(customization.includes(messages.customization.videos.author));
    assert.ok(customization.includes(formatDemoPrice(5, locale)));
    const features = render(BentoFeaturesSection);
    assert.ok(features.includes(messages.features.benefits.link.author));
    const pricing = render(Pricing);
    assert.ok(pricing.includes(messages.pricing.plans.starter.name));
    assert.ok(pricing.includes(locale === "vi" ? "480.000" : ">19<"));
    if (locale === "vi") {
      for (const html of [pillars, customization, features, pricing]) {
        assert.doesNotMatch(
          html,
          /\$\d|Alex Martinez|Jessica Martinez|James Oliver|Elena Rostova/,
        );
      }
    }
    assert.deepEqual(
      errors,
      [],
      `${locale} demo sections must resolve all message keys`,
    );
  }
});
