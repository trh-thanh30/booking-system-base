/* Local integration smoke: real API + PostgreSQL, disposable Tenant/Owner/Staff.
 * Run with API running and Web on FRONTEND_SMOKE_URL (default http://localhost:3002).
 * Uses .env.development; removes only its generated records, including on failure.
 */
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { readFileSync, mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { createRequire } = require("node:module");
const apiRequire = createRequire(
  resolve(__dirname, "../apps/api/package.json"),
);
const dotenv = apiRequire("dotenv");
const { Pool } = apiRequire("pg");
const { PrismaPg } = apiRequire("@prisma/adapter-pg");
const { PrismaClient } = apiRequire("@prisma/client");
const bcrypt = apiRequire("bcryptjs");
const puppeteer = apiRequire("puppeteer-core");

async function main() {
  const origin = new URL(
    process.env.FRONTEND_SMOKE_URL || "http://localhost:3002",
  ).origin;
  assert.ok(
    ["localhost", "127.0.0.1"].includes(new URL(origin).hostname),
    "Local Web only",
  );
  const preflight = await fetch(
    "http://localhost:3000/api/v1/business-settings/setup-summary",
    {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers":
          "authorization,x-auth-context,x-business-id,x-tenant-id",
      },
    },
  );
  assert.equal(
    preflight.headers.get("access-control-allow-origin"),
    origin,
    "API allows this Web origin",
  );
  const allowedHeaders = preflight.headers
    .get("access-control-allow-headers")
    .toLowerCase();
  assert.ok(
    allowedHeaders.includes("x-tenant-id") &&
      allowedHeaders.includes("x-business-id"),
    "API allows Tenant and Business context headers",
  );
  const env = dotenv.parse(
    readFileSync(resolve(__dirname, "../.env.development")),
  );
  const pool = new Pool({
    ...(env.DATABASE_URL && !env.DATABASE_URL.includes("${")
      ? { connectionString: env.DATABASE_URL }
      : {
          host: env.DB_HOST || "localhost",
          port: Number(env.DB_PORT || 5432),
          user: env.DB_USER || "postgres",
          password: env.DB_PASSWORD || "postgres",
          database: env.DB_NAME || "app",
        }),
    connectionTimeoutMillis: 5000,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const tenantId = randomUUID(),
    businessId = randomUUID(),
    ownerId = randomUUID(),
    staffId = randomUUID();
  const password = randomUUID();
  const email = `setup-${ownerId}@example.test`,
    staffEmail = `setup-${staffId}@example.test`;
  let browser;
  try {
    await prisma.tenant.create({
      data: {
        id: tenantId,
        name: "Quick setup browser smoke",
        slug: `setup-${tenantId}`,
      },
    });
    await prisma.business.create({
      data: {
        id: businessId,
        tenant_id: tenantId,
        name: "Smoke Studio",
        slug: "smoke-studio",
        is_default: true,
        timezone: "Asia/Singapore",
      },
    });
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        id: ownerId,
        tenant_id: tenantId,
        email,
        username: `setup-${ownerId}`,
        password: hash,
        role: "OWNER",
        is_verified: true,
      },
    });
    await prisma.user.create({
      data: {
        id: staffId,
        tenant_id: tenantId,
        email: staffEmail,
        username: `setup-${staffId}`,
        password: hash,
        role: "STAFF",
        is_verified: true,
      },
    });
    await prisma.businessMembership.create({
      data: { tenant_id: tenantId, business_id: businessId, user_id: staffId },
    });
    browser = await puppeteer.launch({
      executablePath:
        process.env.CHROME_PATH ||
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
      headless: true,
      args: ["--no-sandbox"],
    });
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    const errors = [],
      calls = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("requestfailed", (request) => {
      if (request.url().includes("/api/v1/"))
        console.error(
          "Failed API request:",
          new URL(request.url()).pathname,
          request.failure()?.errorText,
        );
    });
    page.on("response", (response) => {
      if (response.url().includes("/api/v1/") && response.status() >= 400)
        console.error(
          "API response:",
          new URL(response.url()).pathname,
          response.status(),
        );
    });
    page.on("request", (request) => {
      if (request.url().includes("/api/v1/"))
        calls.push({
          path: new URL(request.url()).pathname,
          method: request.method(),
        });
    });
    page.setDefaultTimeout(30000);
    await page.setViewport({ width: 1440, height: 1000 });
    async function visit(path) {
      await page.goto(`${origin}${path}`, { waitUntil: "networkidle0" });
    }
    async function clickText(text) {
      const clicked = await page.evaluate((value) => {
        const button = [...document.querySelectorAll("button")].find(
          (element) => element.textContent.trim() === value,
        );
        if (button) button.click();
        return Boolean(button);
      }, text);
      assert.ok(clicked, `Button exists: ${text}`);
    }
    async function heading(text) {
      try {
        await page.waitForFunction(
          (value) =>
            [...document.querySelectorAll("h2")].some(
              (element) => element.textContent === value,
            ),
          {},
          text,
        );
      } catch (error) {
        console.error(
          "Expected heading:",
          text,
          "at",
          page.url(),
          "state:",
          await page.$eval("body", (element) => element.innerText.slice(-1200)),
          errors,
        );
        throw error;
      }
    }
    async function login(locale, identity) {
      await visit(`/${locale}/admin/login`);
      try {
        await page.waitForSelector('input[name="usernameOrEmail"]');
      } catch (error) {
        console.error(
          "Browser state:",
          await page.$eval("body", (element) =>
            element.textContent.slice(0, 1400),
          ),
          errors,
        );
        throw error;
      }
      await page.type('input[name="usernameOrEmail"]', identity);
      await page.type('input[name="password"]', password);
      await page.click('button[type="submit"]');
    }
    await login("en", email);
    await heading("Working hours");
    await page.waitForSelector('#hours-open-1[role="combobox"]');
    assert.equal(
      await page.$$eval('[role="switch"]', (elements) => elements.length),
      7,
    );
    assert.ok(
      (await page.$eval("main", (element) => element.textContent)).includes(
        "Asia/Singapore",
      ),
    );
    // The first form validates intervals before sending anything to the API.
    async function chooseTimePart(id, value) {
      await page.click(`#${id}`);
      await page.waitForSelector('[role="option"]');
      const options = await page.$$('[role="option"]');
      for (const option of options) {
        if (
          (await option.evaluate((element) => element.textContent.trim())) ===
          value
        ) {
          await option.click();
          return;
        }
      }
      throw new Error(`Time option not found: ${value}`);
    }
    await chooseTimePart("hours-close-1", "08");
    const savedHoursBefore = calls.filter(
      (call) =>
        call.path.endsWith("/business-settings/working-hours") &&
        call.method === "PUT",
    ).length;
    await clickText("Save and continue");
    await page.waitForSelector("#hours-error-1");
    assert.equal(
      calls.filter(
        (call) =>
          call.path.endsWith("/business-settings/working-hours") &&
          call.method === "PUT",
      ).length,
      savedHoursBefore,
    );
    // Restore a valid schedule before persisting.
    await chooseTimePart("hours-close-1", "18");
    await chooseTimePart("hours-open-1-minute", "07");
    // One failed HTTP save must show a toast and preserve the current form/progress.
    let rejectedSave = false;
    await page.setRequestInterception(true);
    page.on("request", async (request) => {
      if (
        !rejectedSave &&
        request.method() === "PUT" &&
        request.url().endsWith("/business-settings/working-hours")
      ) {
        rejectedSave = true;
        await request.respond({
          status: 503,
          headers: {
            "content-type": "application/json",
            "access-control-allow-origin": origin,
            "access-control-allow-credentials": "true",
          },
          body: JSON.stringify({
            success: false,
            error: { code: "SERVICE_UNAVAILABLE", message: "Unavailable" },
          }),
        });
      } else await request.continue();
    });
    await clickText("Save and continue");
    await page.waitForSelector('[data-sonner-toast][data-type="error"]');
    assert.equal(
      (await prisma.business.findUniqueOrThrow({ where: { id: businessId } }))
        .settings,
      null,
    );
    assert.ok(page.url().endsWith("/admin/business-setup"));
    await clickText("Save and continue");
    await heading("First service");
    await page.reload({ waitUntil: "networkidle0" });
    await heading("First service");
    let business = await prisma.business.findUniqueOrThrow({
      where: { id: businessId },
    });
    assert.equal(business.settings.working_hours.length, 7);
    assert.equal(
      business.settings.working_hours.find((day) => day.day_of_week === 1)
        .opens_at,
      "09:07",
    );
    await clickText("Skip setup");
    await page.waitForFunction(() =>
      location.pathname.endsWith("/admin/dashboard"),
    );
    await page.reload({ waitUntil: "networkidle0" });
    assert.ok(page.url().endsWith("/admin/dashboard"));
    business = await prisma.business.findUniqueOrThrow({
      where: { id: businessId },
    });
    assert.equal(business.settings.quick_setup_skipped, true);
    assert.equal(business.settings.working_hours.length, 7);
    await visit("/en/admin/business-setup/entry");
    await page.waitForFunction(() =>
      location.pathname.endsWith("/admin/dashboard"),
    );
    await clickText("Continue setup");
    await heading("First service");
    await page.type("#service-name", "Smoke haircut");
    await page.click("#service-price", { clickCount: 3 });
    await page.type("#service-price", "300000");
    assert.equal(
      await page.$eval("#service-price", (input) => input.value),
      "300,000",
    );
    await clickText("Save and continue");
    await heading("Booking template");
    await page.waitForSelector("#template-modern");
    await page.reload({ waitUntil: "networkidle0" });
    await heading("Booking template");
    assert.equal(
      await prisma.service.count({
        where: {
          tenant_id: tenantId,
          business_id: businessId,
          status: "ACTIVE",
        },
      }),
      1,
    );
    assert.equal(
      (
        await prisma.service.findFirstOrThrow({
          where: { business_id: businessId },
        })
      ).price_amount,
      300000,
    );
    // Returning to the Service step must reuse the existing active Service.
    await page.evaluate(() =>
      [...document.querySelectorAll("nav button")]
        .find((element) => element.textContent.includes("First service"))
        .click(),
    );
    await heading("First service");
    assert.equal(await page.$("#service-name"), null);
    await clickText("Continue");
    await heading("Booking template");
    await page.waitForSelector("#template-modern");
    await page.focus("#template-modern");
    await page.keyboard.press("Space");
    assert.equal(
      await page.$eval("#template-modern", (input) => input.checked),
      true,
    );
    const artifacts = resolve(__dirname, "../.next-setup-artifacts");
    mkdirSync(artifacts, { recursive: true });
    await page.screenshot({
      path: resolve(artifacts, "template-desktop.png"),
      fullPage: true,
    });
    await page.setViewport({ width: 390, height: 844 });
    await visit("/vi/admin/business-setup");
    await heading("Mẫu trang đặt lịch");
    await page.waitForSelector("#template-modern");
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "No mobile horizontal overflow",
    );
    await page.screenshot({
      path: resolve(artifacts, "template-mobile-vi.png"),
      fullPage: true,
    });
    await page.click('label[for="template-modern"]');
    await clickText("Hoàn tất thiết lập");
    await page.waitForFunction(() =>
      location.pathname.endsWith("/admin/dashboard"),
    );
    business = await prisma.business.findUniqueOrThrow({
      where: { id: businessId },
    });
    assert.equal(business.settings.booking_template_id, "modern");
    assert.equal(
      await prisma.service.count({ where: { business_id: businessId } }),
      1,
    );
    await visit("/en/admin/business-setup/entry");
    await page.waitForFunction(() =>
      location.pathname.endsWith("/admin/dashboard"),
    );
    assert.ok(
      !(await page.$eval("main", (element) => element.textContent)).includes(
        "Continue setup",
      ),
    );
    // Existing active Service: a new login starts at the first genuinely incomplete step.
    await prisma.business.update({
      where: { id: businessId },
      data: { settings: {} },
    });
    await visit("/en/admin/business-setup/entry");
    await heading("Working hours");
    await page.waitForSelector("#hours-open-1");
    await clickText("Save and continue");
    await heading("Booking template");
    assert.equal(
      await prisma.service.count({ where: { business_id: businessId } }),
      1,
    );
    // Staff never enters or loads the Owner tour, even via a direct setup URL.
    const staffContext = await browser.createBrowserContext();
    const staffPage = await staffContext.newPage();
    const staffSetupRequests = [];
    staffPage.on("request", (request) => {
      if (request.url().includes("/business-settings/"))
        staffSetupRequests.push(request.url());
    });
    await staffPage.goto(`${origin}/en/admin/login`, {
      waitUntil: "networkidle0",
    });
    await staffPage.type('input[name="usernameOrEmail"]', staffEmail);
    await staffPage.type('input[name="password"]', password);
    await staffPage.click('button[type="submit"]');
    await staffPage.waitForFunction(() =>
      location.pathname.endsWith("/admin/dashboard"),
    );
    await staffPage.goto(`${origin}/en/admin/business-setup`, {
      waitUntil: "networkidle0",
    });
    await staffPage.waitForFunction(() =>
      location.pathname.endsWith("/admin/dashboard"),
    );
    assert.deepEqual(staffSetupRequests, []);
    assert.deepEqual(errors, []);
    console.log(
      "PASS: real API save/reload, skip/resume, existing Service reuse, completion, Staff bypass, error toast, keyboard picker, vi/en and mobile layout",
    );
    console.log(`Artifacts: ${artifacts}`);
  } finally {
    if (browser) await browser.close();
    await prisma.user.deleteMany({
      where: { id: { in: [ownerId, staffId] }, tenant_id: tenantId },
    });
    await prisma.tenant.deleteMany({ where: { id: tenantId } });
    assert.equal(await prisma.tenant.count({ where: { id: tenantId } }), 0);
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
