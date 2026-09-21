const ACCESS_TOKEN_KEY = "booking_admin_access_token";
const TENANT_ID_KEY = "booking_admin_tenant_id";

let memoryAccessToken: string | undefined;
let memoryTenantId: string | undefined;

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getAccessToken() {
  if (memoryAccessToken) {
    return memoryAccessToken;
  }

  if (!canUseStorage()) {
    return undefined;
  }

  memoryAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
  return memoryAccessToken;
}

export function setAccessToken(token: string) {
  memoryAccessToken = token;

  if (canUseStorage()) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

export function clearAccessToken() {
  memoryAccessToken = undefined;
  memoryTenantId = undefined;

  if (canUseStorage()) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TENANT_ID_KEY);
  }
}

export function getTenantId() {
  if (memoryTenantId) {
    return memoryTenantId;
  }

  if (!canUseStorage()) {
    return undefined;
  }

  memoryTenantId = localStorage.getItem(TENANT_ID_KEY) ?? undefined;
  return memoryTenantId;
}

export function setTenantId(tenantId: string | null | undefined) {
  memoryTenantId = tenantId ?? undefined;

  if (!canUseStorage()) {
    return;
  }

  if (tenantId) {
    localStorage.setItem(TENANT_ID_KEY, tenantId);
  } else {
    localStorage.removeItem(TENANT_ID_KEY);
  }
}
