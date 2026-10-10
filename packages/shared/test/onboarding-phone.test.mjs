import assert from "node:assert/strict";
import test from "node:test";
import {
  completeOwnerBusinessSchema,
  completeGoogleOwnerOnboardingSchema,
} from "../dist/index.js";

for (const [name, schema] of [
  ["email", completeOwnerBusinessSchema],
  ["Google", completeGoogleOwnerOnboardingSchema],
]) {
  const phone = schema.shape.owner.shape.phone;
  test(`${name}: accepts international numbers across countries and optional blank phones`, () => {
    for (const value of [
      "+84912345678",
      "+12133734253",
      "+442079460018",
      "+33142345678",
    ])
      assert.equal(phone.safeParse(value).success, true, value);
    for (const value of [undefined, "", "   "])
      assert.equal(phone.parse(value), undefined);
  });
  test(`${name}: rejects excessive digits, unknown calling codes and invalid local patterns`, () => {
    for (const value of [
      "+8412212121211212121212",
      "+8491",
      "+999123456789",
      "+84123456789",
      "0912345678",
      "abc",
    ])
      assert.equal(phone.safeParse(value).success, false, value);
  });
  test(`${name}: canonicalizes formatted phone input for uniqueness and persistence`, () => {
    assert.equal(phone.parse(" +1 213 373 4253 "), "+12133734253");
  });
}
