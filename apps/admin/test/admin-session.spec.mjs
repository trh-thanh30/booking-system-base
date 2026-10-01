import assert from "node:assert/strict";
import test from "node:test";
import { createAdminSession, canAccess } from "../src/lib/admin-session.ts";

const owner = {
  id: "owner-a",
  role: "OWNER",
  status: "ACTIVE",
  is_verified: true,
  tenant_id: "tenant-a",
  tenant: { id: "tenant-a", status: "ACTIVE" },
  businesses: [{ id: "business-a", tenant_id: "tenant-a", is_default: true }],
  permissions: [],
};
function setup(overrides = {}) {
  let token;
  let active;
  let profile;
  let clears = 0;
  let refreshes = 0;
  const session = createAdminSession({
    hasRefreshMarker: () => true,
    getAccessToken: () => token,
    refresh: async () => {
      refreshes++;
      token = "restored";
      return token;
    },
    getMe: async () => owner,
    login: async () => ({ access_token: "login-token", user: owner }),
    logout: async () => {},
    setAccessToken: (value) => {
      token = value;
    },
    clearCredentials: () => {
      token = undefined;
    },
    getActiveBusinessId: () => active,
    setContext: (user, businessId) => {
      profile = user;
      active = businessId;
    },
    clearCache: () => {
      clears++;
    },
    ...overrides,
  });
  return {
    session,
    get token() {
      return token;
    },
    get active() {
      return active;
    },
    get profile() {
      return profile;
    },
    get clears() {
      return clears;
    },
    get refreshes() {
      return refreshes;
    },
  };
}

test("reload restores one session with verified profile and default Business", async () => {
  const context = setup();
  const [first, second] = await Promise.all([
    context.session.bootstrap(),
    context.session.bootstrap(),
  ]);
  assert.deepEqual(first, owner);
  assert.deepEqual(second, owner);
  assert.equal(context.refreshes, 1);
  assert.equal(context.active, "business-a");
});

test("manual login loads /auth/me instead of trusting the login response profile", async () => {
  const context = setup({
    login: async () => ({
      access_token: "manual",
      user: { ...owner, id: "stale" },
    }),
  });
  assert.deepEqual(
    await context.session.login({
      usernameOrEmail: "owner",
      password: "password",
    }),
    owner,
  );
  assert.equal(context.token, "manual");
});

test("logout clears profile and cache even when the API fails", async () => {
  const context = setup({
    logout: async () => {
      throw new Error("offline");
    },
  });
  await context.session.bootstrap();
  await assert.rejects(context.session.logout(), /offline/);
  assert.equal(context.token, undefined);
  assert.equal(context.profile, null);
  assert.equal(context.active, null);
  assert.ok(context.clears > 0);
});

test("late login profile cannot restore a logged-out session", async () => {
  let release;
  const context = setup({
    getMe: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  const login = context.session.login({
    usernameOrEmail: "owner",
    password: "password",
  });
  await Promise.resolve();
  await context.session.logout();
  release(owner);
  await assert.rejects(login, /ADMIN_SESSION_CANCELLED/);
  assert.equal(context.profile, null);
});

test("no marker does not call refresh or load profile", async () => {
  const context = setup({
    hasRefreshMarker: () => false,
    getMe: async () => {
      throw new Error("must not call");
    },
  });
  assert.equal(await context.session.bootstrap(), null);
  assert.equal(context.refreshes, 0);
});

test("failed restoration clears tenant, Business, profile and cache", async () => {
  const context = setup({
    getMe: async () => {
      throw new Error("expired");
    },
  });
  assert.equal(await context.session.bootstrap(), null);
  assert.equal(context.token, undefined);
  assert.equal(context.active, null);
  assert.equal(context.profile, null);
});

test("Admin never hydrates a Platform profile or a mismatched/inactive tenant", async () => {
  for (const user of [
    { ...owner, role: "SUPER_ADMIN" },
    { ...owner, tenant: { id: "other", status: "ACTIVE" } },
    { ...owner, tenant: { id: "tenant-a", status: "INACTIVE" } },
  ]) {
    const context = setup({ getMe: async () => user });
    assert.equal(await context.session.bootstrap(), null);
    assert.equal(context.token, undefined);
  }
});

test("profile refresh retains allowed Business and removes memberships outside Tenant", async () => {
  let user = {
    ...owner,
    businesses: [
      ...owner.businesses,
      { id: "business-b", tenant_id: "tenant-a" },
      { id: "foreign", tenant_id: "other" },
    ],
  };
  const context = setup({
    getMe: async () => user,
    getActiveBusinessId: () => "business-b",
  });
  await context.session.bootstrap();
  assert.equal(context.active, "business-b");
  assert.equal(context.profile.businesses.length, 2);
  user = owner;
  await context.session.refreshCurrentUser();
  assert.equal(context.active, "business-a");
});

test("Owner bypass, Staff manage permission, and Platform isolation", () => {
  assert.equal(canAccess(owner, "booking:read"), true);
  const staff = { ...owner, role: "STAFF", permissions: ["booking:manage"] };
  assert.equal(canAccess(staff, "booking:read"), true);
  assert.equal(canAccess(staff, "user:read"), false);
  assert.equal(
    canAccess(
      { ...owner, role: "SUPER_ADMIN", permissions: ["*"] },
      "booking:read",
    ),
    false,
  );
});
