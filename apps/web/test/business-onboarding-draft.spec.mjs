import assert from "node:assert/strict";
import test from "node:test";
import {
  clearBusinessOnboardingDraft,
  createBusinessOnboardingDraft,
  loadBusinessOnboardingDraft,
  parseBusinessOnboardingDraft,
  saveBusinessOnboardingDraft,
} from "../src/views/admin/auth/utils/business-onboarding-draft.utils.ts";

const incompleteValues = {
  business_category_id: "",
  name: "Lotus Spa",
  slug: "lotus-spa",
  owner: { username: "owner", phone: "" },
  timezone: "Asia/Ho_Chi_Minh",
  locale: "vi",
  business_profile: {
    address: {
      countryCode: "VN",
      addressLine1: "",
      addressLine2: "",
      locality: "",
      administrativeAreaLevel1: "",
      administrativeAreaLevel2: "",
      postalCode: "",
      formattedAddress: "",
      location: null,
    },
  },
};

test("restores an incomplete onboarding draft after reload", () => {
  const now = Date.UTC(2026, 9, 7);
  const draft = createBusinessOnboardingDraft({
    profileEmail: "owner@example.com",
    step: 1,
    values: incompleteValues,
    now,
  });

  const restored = parseBusinessOnboardingDraft(
    JSON.stringify(draft),
    "owner@example.com",
    now,
  );

  assert.equal(restored?.step, 1);
  assert.equal(restored?.values.name, "Lotus Spa");
  assert.equal(restored?.values.business_profile.address.addressLine1, "");
});

test("keeps a valid draft when the form is reopened and removes expired drafts", () => {
  const items = new Map();
  const storage = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, value),
    removeItem: (key) => items.delete(key),
  };
  const now = Date.UTC(2026, 9, 7);
  const draft = createBusinessOnboardingDraft({
    profileEmail: "owner@example.com",
    step: 1,
    values: incompleteValues,
    now,
  });
  const legacyThreeStepDraft = { ...draft, step: 2 };

  assert.equal(
    saveBusinessOnboardingDraft(storage, legacyThreeStepDraft),
    true,
  );
  assert.equal(
    loadBusinessOnboardingDraft(storage, "owner@example.com", now)?.step,
    1,
  );
  assert.equal(
    loadBusinessOnboardingDraft(storage, "another@example.com", now),
    null,
  );
  assert.equal(
    loadBusinessOnboardingDraft(storage, "owner@example.com", draft.expiresAt),
    null,
  );
  assert.equal(items.size, 0);

  clearBusinessOnboardingDraft(storage);
  assert.equal(items.size, 0);
});

test("rejects corrupt drafts and reports unavailable browser storage", () => {
  const items = new Map([
    ["booking:owner-business-onboarding-draft:v1", "not-json"],
  ]);
  const storage = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, value),
    removeItem: (key) => items.delete(key),
  };

  assert.equal(loadBusinessOnboardingDraft(storage, "owner@example.com"), null);
  assert.equal(items.size, 0);
  assert.equal(
    saveBusinessOnboardingDraft(
      {
        ...storage,
        setItem() {
          throw new Error("quota exceeded");
        },
      },
      createBusinessOnboardingDraft({
        profileEmail: "owner@example.com",
        step: 0,
        values: incompleteValues,
      }),
    ),
    false,
  );
});
