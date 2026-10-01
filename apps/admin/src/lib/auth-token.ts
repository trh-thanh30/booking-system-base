let memoryAccessToken: string | undefined;
let memoryTenantId: string | undefined;
let sessionRevision = 0;

export function getSessionRevision() {
  return sessionRevision;
}

export function getAccessToken() {
  return memoryAccessToken;
}

export function setAccessToken(token: string) {
  sessionRevision++;
  memoryAccessToken = token;
}

export function clearAccessToken() {
  sessionRevision++;
  memoryAccessToken = undefined;
  memoryTenantId = undefined;

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("booking_admin_access_token");
      localStorage.removeItem("booking_admin_tenant_id");
    } catch {
      // Storage may be disabled; the active session is memory-only.
    }
  }
}

export function getTenantId() {
  return memoryTenantId;
}

export function setTenantId(tenantId: string | null | undefined) {
  memoryTenantId = tenantId ?? undefined;
}
