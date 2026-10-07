import assert from "node:assert/strict";
import test from "node:test";
import { createServiceSchema } from "@repo/shared";
import {
  formatServicePriceInput,
  parseServicePriceInput,
} from "../src/views/admin/business-setup/utils/service-price.utils.ts";

test("price grouping follows vi/en without changing the amount", () => {
  assert.equal(formatServicePriceInput("300000", "vi"), "300.000");
  assert.equal(formatServicePriceInput("300000", "en"), "300,000");
  assert.equal(parseServicePriceInput("300.000", "vi"), "300000");
  assert.equal(parseServicePriceInput("300,000", "en"), "300000");
  assert.equal(formatServicePriceInput("1234567", "vi"), "1.234.567");
  assert.equal(formatServicePriceInput("1234567", "en"), "1,234,567");
});

test("editing keeps empty, zero and pasted amounts distinct", () => {
  assert.equal(parseServicePriceInput("", "vi"), "");
  assert.equal(formatServicePriceInput("", "en"), "");
  assert.equal(formatServicePriceInput("0", "vi"), "0");
  assert.equal(parseServicePriceInput("000300000", "vi"), "300000");
  assert.equal(parseServicePriceInput(" 300,000 ", "en"), "300000");
  assert.equal(parseServicePriceInput("-300", "vi"), null);
  assert.equal(parseServicePriceInput("1.50", "en"), null);
  assert.equal(parseServicePriceInput("abc", "vi"), null);
});

test("API receives an integer amount and large values are never rounded by the display", () => {
  for (const locale of ["vi", "en"]) {
    const raw = parseServicePriceInput(
      formatServicePriceInput("300000", locale),
      locale,
    );
    const parsed = createServiceSchema.parse({
      name: "Haircut",
      duration_minutes: 30,
      price_amount: Number(raw),
      currency: "USD",
    });
    assert.equal(parsed.price_amount, 300000);
    assert.equal(parsed.currency, "USD");
  }
  assert.equal(
    formatServicePriceInput("9007199254740993", "en"),
    "9,007,199,254,740,993",
  );
  assert.equal(
    createServiceSchema.safeParse({
      name: "Haircut",
      duration_minutes: 30,
      price_amount: Number("9007199254740993"),
    }).success,
    false,
  );
});
