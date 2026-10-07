import assert from "node:assert/strict";
import test from "node:test";
import axios, { AxiosError } from "axios";
import {
  setAccessToken,
  setTenantId,
  clearAccessToken,
} from "../src/lib/admin/auth-token.ts";
import { useAdminUiStore } from "../src/app/stores/admin/ui.store.ts";
import { createBusinessSettingsService } from "../src/services/admin/business-settings.service.ts";
import { createServicesService } from "../src/services/admin/services.service.ts";

test("setup and Service requests retain their Business scope when active Business changes", async (t) => {
  const calls = [];
  const previous = axios.defaults.adapter;
  axios.defaults.adapter = async (config) => {
    calls.push({
      path: config.url,
      method: config.method,
      data: config.data ? JSON.parse(config.data) : undefined,
      business: config.headers.get("x-business-id"),
      tenant: config.headers.get("x-tenant-id"),
    });
    return {
      config,
      data: { success: true, data: { saved: true } },
      headers: {},
      status: 200,
      statusText: "OK",
    };
  };
  const settings = createBusinessSettingsService("business-a");
  const services = createServicesService("business-a");
  axios.defaults.adapter = previous;
  t.after(() => {
    clearAccessToken();
    useAdminUiStore.getState().setActiveBusinessId(null);
  });
  setAccessToken("test-token");
  setTenantId("tenant-a");
  useAdminUiStore.getState().setActiveBusinessId("business-b");
  assert.deepEqual(await settings.getSummary(), { saved: true });
  await settings.getHours();
  await settings.getTemplates();
  await settings.saveHours({ days: [] });
  await settings.selectTemplate({ template_id: "modern" });
  await settings.skip();
  await settings.resume();
  await services.createService({
    name: "Haircut",
    duration_minutes: 30,
    price_amount: 0,
  });
  assert.deepEqual(
    calls.map(({ method, path }) => [method, path]),
    [
      ["get", "/business-settings/setup-summary"],
      ["get", "/business-settings/working-hours"],
      ["get", "/business-settings/booking-templates"],
      ["put", "/business-settings/working-hours"],
      ["put", "/business-settings/booking-template"],
      ["post", "/business-settings/skip"],
      ["post", "/business-settings/resume"],
      ["post", "/services"],
    ],
  );
  for (const call of calls) {
    assert.equal(call.business, "business-a");
    assert.equal(call.tenant, "tenant-a");
    assert.equal(call.data?.tenant_id, undefined);
    assert.equal(call.data?.business_id, undefined);
  }
  assert.deepEqual(calls[4].data, { template_id: "modern" });
});

test("setup API failure rejects instead of reporting saved progress", async () => {
  const previous = axios.defaults.adapter;
  axios.defaults.adapter = async (config) => {
    throw new AxiosError("Unavailable", "ERR_BAD_RESPONSE", config, undefined, {
      config,
      status: 503,
      statusText: "Unavailable",
      headers: {},
      data: {},
    });
  };
  const settings = createBusinessSettingsService("business-a");
  axios.defaults.adapter = previous;
  await assert.rejects(settings.skip());
});
