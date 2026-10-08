import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { BOOKING_TEMPLATES } from "@repo/shared";
import { WorkingHoursForm } from "../src/views/admin/business-setup/components/working-hours-form.tsx";
import { FirstServiceForm } from "../src/views/admin/business-setup/components/first-service-form.tsx";
import { BookingTemplatePicker } from "../src/views/admin/business-setup/components/booking-template-picker.tsx";
import { SetupProgress } from "../src/views/admin/business-setup/components/setup-progress.tsx";

for (const locale of ["vi", "en"]) {
  const messages = JSON.parse(
    readFileSync(
      new URL(`../src/messages/${locale}.json`, import.meta.url),
      "utf8",
    ),
  );
  const render = (component, props) =>
    renderToStaticMarkup(
      createElement(
        NextIntlClientProvider,
        { locale, messages, timeZone: "UTC" },
        createElement(component, props),
      ),
    );
  test(`${locale}: working hours exposes seven labeled days and the Business timezone`, () => {
    const html = render(WorkingHoursForm, {
      initialDays: null,
      timezone: "Asia/Singapore",
      busy: false,
      onSave: async () => {},
    });
    assert.equal((html.match(/role="switch"/g) ?? []).length, 7);
    assert.doesNotMatch(html, /type="time"/);
    assert.equal((html.match(/role="combobox"/g) ?? []).length, 20);
    assert.match(html, /Asia\/Singapore/);
    for (let day = 0; day < 7; day++)
      assert.match(html, new RegExp(`for="hours-day-${day}"`));
  });
  test(`${locale}: existing Service continues without a creation form`, () => {
    const html = render(FirstServiceForm, {
      existing: true,
      busy: false,
      onSave: async () => {},
    });
    assert.doesNotMatch(html, /name="name"|<form/);
    assert.ok(html.includes(messages.BusinessSetup.service.existingTitle));
    assert.ok(html.includes(messages.BusinessSetup.continue));
  });
  test(`${locale}: templates expose a keyboard radio group with the saved selection`, () => {
    const html = render(BookingTemplatePicker, {
      catalog: {
        templates: BOOKING_TEMPLATES,
        selected_template_id: "nail-salon-v2",
      },
      busy: false,
      onSave: async () => {},
    });
    assert.equal(
      (html.match(/type="radio"/g) ?? []).length,
      BOOKING_TEMPLATES.length,
    );
    assert.match(html, /id="template-nail-salon-v2"[^>]*checked=""/);
    assert.doesNotMatch(html, /id="template-(classic|modern|minimal)"/);
    for (const template of BOOKING_TEMPLATES)
      assert.ok(html.includes(template.name[locale]));
  });
  test(`${locale}: nail template has a saved radio selection and a separate demo link`, () => {
    const html = render(BookingTemplatePicker, {
      catalog: {
        templates: BOOKING_TEMPLATES,
        selected_template_id: "nail-salon-v2",
      },
      busy: false,
      onSave: async () => {},
    });
    assert.match(html, /id="template-nail-salon-v2"[^>]*checked=""/);
    assert.match(html, /href="\/[^" ]*nail-salon-v2"/);
    assert.match(html, /target="_blank"/);
    assert.ok(html.includes(messages.BusinessSetup.template.openDemo));
    assert.ok(
      html.includes(
        BOOKING_TEMPLATES.find((t) => t.id === "nail-salon-v2").description[
          locale
        ],
      ),
    );
  });
  test(`${locale}: a historical template is not displayed or submitted as an available choice`, () => {
    const html = render(BookingTemplatePicker, {
      catalog: { templates: BOOKING_TEMPLATES, selected_template_id: "modern" },
      busy: false,
      onSave: async () => {},
    });
    assert.doesNotMatch(html, /id="template-modern"|checked=""/);
    assert.match(html, /type="submit"[^>]*disabled=""/);
  });
  test(`${locale}: progress exposes exactly three steps and prevents jumping ahead`, () => {
    const html = render(SetupProgress, {
      summary: {
        next_step: "FIRST_SERVICE",
        steps: {
          working_hours: true,
          first_service: false,
          booking_template: false,
        },
      },
      current: "FIRST_SERVICE",
      busy: false,
      onSelect() {},
    });
    assert.equal(
      (html.match(/<li /g) ?? []).length + (html.match(/<li>/g) ?? []).length,
      3,
    );
    assert.equal((html.match(/aria-current="step"/g) ?? []).length, 1);
    assert.equal((html.match(/disabled=""/g) ?? []).length, 1);
  });
}
