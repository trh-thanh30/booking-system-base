/* global document, getComputedStyle */
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(
  new URL("../apps/api/package.json", import.meta.url),
);
const puppeteer = require("puppeteer-core");
const origin = new URL(
  process.env.FRONTEND_SMOKE_URL || "http://localhost:3123",
).origin;
assert.ok(["localhost", "127.0.0.1"].includes(new URL(origin).hostname));
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome-stable",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  const page = await browser.newPage();
  const calls = [],
    errors = [];
  let expired = false;
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on("request", async (request) => {
    const url = new URL(request.url());
    if (url.hostname === "tile.openstreetmap.org") {
      await request.respond({
        status: 200,
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jhL0AAAAASUVORK5CYII=",
          "base64",
        ),
      });
      return;
    }
    if (!url.pathname.includes("/api/v1/")) {
      await request.continue();
      return;
    }
    const path = url.pathname.split("/api/v1")[1];
    const headers = {
      "access-control-allow-origin": origin,
      "access-control-allow-credentials": "true",
      "access-control-allow-headers":
        "content-type,authorization,x-auth-context,x-tenant-id,x-business-id",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "content-type": "application/json",
    };
    if (request.method() === "OPTIONS") {
      await request.respond({ status: 204, headers });
      return;
    }
    const data = request.postData() ? JSON.parse(request.postData()) : null;
    calls.push({ path, method: request.method(), data });
    let result = {};
    let status = 200;
    if (path.endsWith("/register")) result = { sessionId: "test-verification" };
    else if (path.endsWith("/verify")) result = { onboarding_required: true };
    else if (path.endsWith("/onboarding") && request.method() === "GET") {
      if (expired) {
        status = 401;
        result = {
          code: "OWNER_ONBOARDING_SESSION_INVALID",
          message: "Expired",
        };
      } else
        result = {
          email: "owner@example.com",
          full_name: "Owner Test",
          avatar_url: null,
        };
    }
    await request.respond({
      status,
      headers,
      body: JSON.stringify(
        status === 200
          ? { success: true, data: result }
          : { success: false, ...result },
      ),
    });
  });
  async function input(name, value) {
    const selector = `[name="${name}"]`;
    await page.waitForSelector(selector);
    await page.click(selector, { clickCount: 3 });
    await page.type(selector, value);
  }
  async function click(label) {
    await page.waitForFunction(
      (text) =>
        [...document.querySelectorAll("button")].some(
          (button) => button.textContent.trim() === text && !button.disabled,
        ),
      {},
      label,
    );
    await page.evaluate(
      (text) =>
        [...document.querySelectorAll("button")]
          .find((button) => button.textContent.trim() === text)
          .click(),
      label,
    );
  }
  await page.goto(`${origin}/en/signup-business`, {
    waitUntil: "networkidle0",
  });
  assert.equal(await page.$("header nav"), null);
  assert.ok(await page.$('header [aria-label="BookingBase"]'));
  assert.ok(await page.$(".lucide-lock"));
  for (const name of ["email", "password", "confirmPassword"]) {
    assert.ok(
      await page.$eval(`[name="${name}"]`, (element) => element.placeholder),
    );
  }
  assert.ok(
    await page.$eval(
      'img[src="/icons/google.svg"]',
      (element) => element.complete && element.naturalWidth > 0,
    ),
  );
  const eye = 'button[aria-label="Show password"]';
  const eyeBackground = await page.$eval(
    eye,
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page.hover(eye);
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal(
    await page.$eval(
      eye,
      (element) => getComputedStyle(element).backgroundColor,
    ),
    eyeBackground,
  );
  await page.click(eye);
  assert.equal(
    await page.$eval('[name="password"]', (element) => element.type),
    "text",
  );
  await page.click('button[aria-label="Hide password"]');
  await input("email", "owner@example.com");
  await input("password", "password123");
  await input("confirmPassword", "password123");
  await click("Continue with email");
  await page.waitForSelector('[name="code"]');
  assert.ok(page.url().includes("sessionId=test-verification"));
  const registration = calls.find((call) => call.path.endsWith("/register"));
  assert.deepEqual(Object.keys(registration.data).sort(), [
    "confirmPassword",
    "email",
    "password",
  ]);
  await input("code", "123456");
  await page.click('button[type="submit"]');
  await page.waitForSelector('[name="owner.username"]');
  assert.ok(page.url().includes("provider=email"));
  assert.equal(
    await page.$eval("#google-email", (element) => element.readOnly),
    true,
  );
  await input("name", "Demo Business");
  await input("slug", "demo-business");
  await input("owner.username", "demo-owner");
  await click("Continue");
  await input("business_profile.address.city", "Hanoi");
  await input("business_profile.address.street", "1 Example Street");
  await page.waitForSelector(".leaflet-container");
  assert.ok(
    (
      await page.$eval(
        ".leaflet-control-attribution",
        (element) => element.textContent,
      )
    ).includes("OpenStreetMap"),
  );
  await page.click(".leaflet-container", { offset: { x: 160, y: 120 } });
  await page.waitForSelector(".business-map-pin");
  await click("Continue");
  await page.waitForSelector('[name="business_profile.opening_hours.1.opens"]');
  await click("Back");
  assert.equal(
    await page.$eval(
      '[name="business_profile.address.street"]',
      (element) => element.value,
    ),
    "1 Example Street",
  );
  await click("Continue");
  await click("Create my business");
  await page.waitForSelector('[name="usernameOrEmail"]');
  const completed = calls.find(
    (call) => call.path === "/auth/admin/onboarding" && call.method === "POST",
  );
  assert.equal(completed.data.business_profile.opening_hours.length, 7);
  assert.equal(
    typeof completed.data.business_profile.address.location.latitude,
    "number",
  );
  assert.ok(
    !calls.some((call) =>
      ["/auth/admin/login", "/auth/me"].includes(call.path),
    ),
    "No automatic Admin login before/after manual onboarding",
  );
  for (const width of [375, 768, 1440]) {
    await page.setViewport({ width, height: 900 });
    await page.goto(`${origin}/vi/admin/login`, { waitUntil: "networkidle0" });
    const signupLink = await page.$('a[href="/vi/signup-business"]');
    assert.ok(signupLink, "Login exposes localized registration CTA");
    assert.equal(
      await signupLink.evaluate((element) => element.textContent),
      "Đăng ký ngay",
    );
    assert.ok(await page.$(".lucide-mail"));
    assert.equal(
      await page.$eval(
        '[name="usernameOrEmail"]',
        (element) => getComputedStyle(element).backgroundColor,
      ),
      await page.$eval(
        "form",
        (element) =>
          getComputedStyle(element.closest(".bg-card")).backgroundColor,
      ),
      "Email input matches the card background",
    );
    assert.ok(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
      `No horizontal overflow at ${width}`,
    );
    await page.screenshot({
      path: `/tmp/owner-login-${width}.png`,
      fullPage: true,
    });
  }
  expired = true;
  await page.goto(`${origin}/en/admin/onboarding/business?provider=email`, {
    waitUntil: "networkidle0",
  });
  await page.waitForFunction(() =>
    document.body.textContent.includes("setup session expired"),
  );
  assert.equal(await page.$('[name="owner.username"]'), null);
  expired = false;
  await page.goto(`${origin}/en/admin/onboarding/business`, {
    waitUntil: "networkidle0",
  });
  await page.waitForSelector('[name="owner.username"]');
  assert.equal(await page.$('input[type="password"]'), null);
  assert.equal(
    await page.$eval("#google-email", (element) => element.readOnly),
    true,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS account → OTP → business → OSM pin → hours → login; resume-expiry and mobile/tablet/desktop layout (API/tiles mocked).",
  );
} finally {
  await browser.close();
}
