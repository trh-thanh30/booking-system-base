import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BOOKING_TEMPLATES,
  BOOKING_TEMPLATE_IDS,
  updateBusinessWorkingHoursSchema,
  selectBookingTemplateSchema,
} from "../dist/index.js";

const days = Array.from({ length: 7 }, (_, day_of_week) => ({
  day_of_week,
  is_closed: false,
  opens_at: "09:00",
  closes_at: "17:00",
}));

test("working hours support seven days including closed days", () => {
  const input = {
    days: days.map((day) =>
      day.day_of_week === 0
        ? { ...day, is_closed: true, opens_at: null, closes_at: null }
        : day,
    ),
  };
  assert.deepEqual(updateBusinessWorkingHoursSchema.parse(input), input);
});

test("rejects missing/duplicate days and invalid local intervals", () => {
  for (const invalid of [
    days.slice(1),
    [...days.slice(1), days[1]],
    days.map((day) => ({ ...day, closes_at: "09:00" })),
    days.map((day) => ({ ...day, closes_at: "08:00" })),
    days.map((day) => ({ ...day, opens_at: "24:00" })),
    days.map((day) => ({
      ...day,
      is_closed: true,
      opens_at: null,
      closes_at: null,
    })),
  ]) {
    assert.equal(
      updateBusinessWorkingHoursSchema.safeParse({ days: invalid }).success,
      false,
    );
  }
});

test("does not accept request-supplied scope or timezone", () => {
  for (const field of ["tenant_id", "business_id", "timezone"]) {
    assert.equal(
      updateBusinessWorkingHoursSchema.safeParse({ days, [field]: "override" })
        .success,
      false,
    );
  }
});

test("every catalog template is selectable and has vi/en labels", () => {
  assert.deepEqual(
    BOOKING_TEMPLATES.map((template) => template.id),
    ["nail-salon-v2"],
  );
  assert.ok(BOOKING_TEMPLATE_IDS.includes("nail-salon-v2"));
  for (const template of BOOKING_TEMPLATES) {
    assert.equal(
      selectBookingTemplateSchema.safeParse({ template_id: template.id })
        .success,
      true,
    );
    assert.ok(template.name.vi && template.name.en);
    assert.ok(template.description.vi && template.description.en);
  }
  assert.equal(
    selectBookingTemplateSchema.safeParse({ template_id: "unknown" }).success,
    false,
  );
});
