import assert from "node:assert/strict";
import test from "node:test";
import {
  registerOwnerAccountSchema,
  completeOwnerBusinessSchema,
} from "@repo/shared";

const input = {
  name: "Demo",
  slug: "demo",
  timezone: "Asia/Ho_Chi_Minh",
  locale: "vi",
  owner: { username: "owner" },
  business_profile: {
    address: {
      country: "Vietnam",
      city: "Hanoi",
      street: "1 Example",
      location: null,
    },
    opening_hours: Array.from({ length: 7 }, (_, day) => ({
      day,
      enabled: day === 1,
      opens: "09:00",
      closes: "18:00",
    })),
  },
};
test("account-first registration normalizes email and rejects mismatched/short passwords", () => {
  const account = {
    email: " Owner@Example.com ",
    password: "password",
    confirmPassword: "password",
  };
  assert.equal(
    registerOwnerAccountSchema.parse(account).email,
    "owner@example.com",
  );
  assert.equal(
    registerOwnerAccountSchema.safeParse({ ...account, password: "short" })
      .success,
    false,
  );
  assert.equal(
    registerOwnerAccountSchema.safeParse({
      ...account,
      confirmPassword: "different",
    }).success,
    false,
  );
});
test("business completion validates geographic bounds, timezone and unique daily intervals", () => {
  assert.equal(completeOwnerBusinessSchema.safeParse(input).success, true);
  assert.equal(
    completeOwnerBusinessSchema.parse({
      ...input,
      owner: { username: "owner", phone: " " },
    }).owner.phone,
    undefined,
  );
  assert.equal(
    completeOwnerBusinessSchema.safeParse({
      ...input,
      timezone: "invalid-zone",
    }).success,
    false,
  );
  assert.equal(
    completeOwnerBusinessSchema.safeParse({ ...input, slug: "unsafe/path" })
      .success,
    false,
  );
  const profile = input.business_profile;
  assert.equal(
    completeOwnerBusinessSchema.safeParse({
      ...input,
      business_profile: {
        ...profile,
        address: {
          ...profile.address,
          location: { latitude: 91, longitude: 0 },
        },
      },
    }).success,
    false,
  );
  for (const hours of [
    profile.opening_hours.map(() => profile.opening_hours[1]),
    profile.opening_hours.map((day) => ({ ...day, enabled: false })),
    profile.opening_hours.map((day) => ({
      ...day,
      opens: "18:00",
      closes: "09:00",
    })),
  ]) {
    assert.equal(
      completeOwnerBusinessSchema.safeParse({
        ...input,
        business_profile: { ...profile, opening_hours: hours },
      }).success,
      false,
    );
  }
});
