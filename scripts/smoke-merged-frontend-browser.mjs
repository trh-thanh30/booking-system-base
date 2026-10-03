/* global document, innerWidth, location */
import { createRequire } from "node:module";
import { URL } from "node:url";
import console from "node:console";
import assert from "node:assert/strict";
import process from "node:process";
const require = createRequire(
  new URL("../apps/api/package.json", import.meta.url),
);
const puppeteer = require("puppeteer-core");
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome-stable",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const origin = new URL(
  process.env.FRONTEND_SMOKE_URL || "http://localhost:3121",
).origin;
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(origin).hostname),
  "Browser smoke is local-only and mocks all API requests",
);
const profile = {
  id: "owner",
  username: "owner",
  email: "owner@example.com",
  full_name: "Owner Test",
  role: "OWNER",
  status: "ACTIVE",
  is_verified: true,
  tenant_id: "tenant",
  tenant: {
    id: "tenant",
    name: "Test Workspace",
    slug: "test",
    status: "ACTIVE",
  },
  permissions: [],
  businesses: [
    {
      id: "business",
      tenant_id: "tenant",
      name: "Default Business",
      slug: "default",
      is_default: true,
    },
    {
      id: "branch",
      tenant_id: "tenant",
      name: "Second Branch",
      slug: "branch",
      is_default: false,
    },
  ],
};
try {
  const page = await browser.newPage();
  const requests = [],
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setRequestInterception(true);
  page.on("request", async (req) => {
    if (!req.url().includes("/api/v1/")) {
      await req.continue();
      return;
    }
    const path = new URL(req.url()).pathname.split("/api/v1")[1];
    const headers = {
      "access-control-allow-origin": origin,
      "access-control-allow-credentials": "true",
      "access-control-allow-headers":
        "content-type,authorization,x-auth-context,x-tenant-id,x-business-id",
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "content-type": "application/json",
    };
    if (req.method() === "OPTIONS") {
      await req.respond({ status: 204, headers });
      return;
    }
    requests.push({ path, headers: req.headers() });
    let data = [];
    if (
      [
        "/auth/admin/login",
        "/auth/admin/refresh",
        "/auth/admin/google/onboarding",
      ].includes(path)
    ) {
      if (req.method() !== "GET")
        await page.setCookie({
          name: "admin_has_rt",
          value: "1",
          url: origin,
          path: "/",
        });
      data =
        path === "/auth/admin/google/onboarding"
          ? req.method() === "GET"
            ? {
                email: "owner@example.com",
                full_name: "Owner Google",
                avatar_url: null,
              }
            : {
                access_token: "mock-token",
                user: profile,
                locale: "en",
                return_to: "/admin/dashboard",
              }
          : { access_token: "mock-token", user: profile };
    } else if (path === "/auth/me") data = profile;
    else if (path === "/businesses") data = profile.businesses;
    else if (path === "/auth/admin/logout") {
      await page.deleteCookie({ name: "admin_has_rt", url: origin, path: "/" });
      data = null;
    }
    await req.respond({
      status: 200,
      headers,
      body: JSON.stringify({ success: true, data }),
    });
  });
  await page.setCookie({
    name: "admin_has_rt",
    value: "1",
    url: origin,
    path: "/",
  });
  for (const locale of ["vi", "en"]) {
    requests.length = 0;
    await page.goto(`${origin}/${locale}`, { waitUntil: "networkidle0" });
    assert.equal(
      requests.length,
      0,
      "Landing must not bootstrap Admin even with marker",
    );
    assert.equal(await page.$eval("html", (e) => e.lang), locale);
    assert.equal(
      (await page.$('meta[name="robots"]')) === null
        ? true
        : (await page.$eval('meta[name="robots"]', (e) => e.content)).includes(
            "index",
          ),
      true,
    );
  }
  await page.select("select", "vi");
  await page.waitForFunction(() => location.pathname === "/vi");
  await page.deleteCookie({ name: "admin_has_rt", url: origin, path: "/" });
  await page.goto(`${origin}/en/admin/bookings?status=pending`, {
    waitUntil: "networkidle0",
  });
  assert.equal(new URL(page.url()).pathname, "/en/admin/login");
  assert.match(
    await page.$eval('meta[name="robots"]', (e) => e.content),
    /noindex/,
  );
  assert.equal(await page.$('link[rel="canonical"]'), null);
  await page.type('input[name="usernameOrEmail"]', "owner@example.com");
  await page.type('input[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await page
    .waitForFunction(() => location.pathname === "/en/admin/bookings", {
      timeout: 10000,
    })
    .catch(async (e) => {
      console.log(
        "LOGIN FAIL",
        page.url(),
        await page.$eval("body", (x) => x.innerText),
        requests.map((x) => x.path),
        errors,
      );
      throw e;
    });
  await page.waitForSelector("aside");
  assert.equal(
    requests.filter((x) => x.path === "/auth/admin/login").length,
    1,
  );
  assert.ok(requests.some((x) => x.path === "/auth/me"));
  await page.goto(`${origin}/en/admin/dashboard`, {
    waitUntil: "networkidle0",
  });
  assert.ok(requests.some((x) => x.path === "/auth/admin/refresh"));
  await page.screenshot({ path: "/tmp/arch001-admin-desktop.png" });
  await page.setViewport({ width: 375, height: 812 });
  await page.waitForFunction(
    () => document.documentElement.scrollWidth <= innerWidth,
    { timeout: 5000 },
  );
  await page.screenshot({ path: "/tmp/arch001-admin-mobile.png" });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Admin mobile overflow",
  );
  requests.length = 0;
  await page.goto(`${origin}/en`, { waitUntil: "networkidle0" });
  assert.equal(requests.length, 0);
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Landing mobile overflow",
  );
  await page.deleteCookie({ name: "admin_has_rt", url: origin, path: "/" });
  await page.goto(`${origin}/en/admin/onboarding/business`, {
    waitUntil: "networkidle0",
  });
  assert.equal(
    await page.$eval('input[type="email"]', (e) => e.readOnly),
    true,
  );
  assert.equal(await page.$('input[type="password"]'), null);
  assert.ok(requests.some((x) => x.path === "/auth/admin/google/onboarding"));
  for (const [name, value] of [
    ["owner.username", "googleowner"],
    ["name", "Google Workspace"],
    ["slug", "google-workspace"],
    ["default_business_name", "First Business"],
    ["default_business_slug", "first-business"],
  ]) {
    await page.type(`input[name="${name}"]`, value);
  }
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname === "/en/admin/dashboard");
  await page.waitForSelector("aside");
  assert.deepEqual(errors, []);
  console.log(
    "PASS browser: vi/en Landing without Admin bootstrap, locale switch, guest redirect, Admin noindex/no canonical, password login, profile/bootstrap, reload refresh, mobile layouts, verified Google onboarding identity",
  );
} finally {
  await browser.close();
}
