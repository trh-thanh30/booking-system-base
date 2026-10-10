import { createApiClient, createSessionRefresh } from "@repo/shared";
import { useAdminUiStore } from "@/src/app/stores/admin/ui.store";
import { apiConfig } from "@/src/config/api.config";
import {
  clearAccessToken,
  getAccessToken,
  getTenantId,
  setAccessToken,
  getSessionRevision,
} from "./auth-token";
import { isAdminWorkspaceHostname } from "./admin-workspace-url";
import { siteConfig } from "@/src/config/site.config";

export const ADMIN_SESSION_EXPIRED_EVENT = "booking:admin-session-expired";

export function hasAdminRefreshCookie(
  adminWorkspaceUrl = siteConfig.adminWorkspaceUrl,
) {
  if (typeof document === "undefined") return false;
  const hasMarker = document.cookie
    .split(";")
    .some((cookie) => cookie.trim() === "admin_has_rt=1");
  if (hasMarker) return true;

  // The marker is only a refresh hint and may be host-scoped to the API. On a
  // configured production workspace base/Tenant host, try the real HttpOnly
  // refresh cookie and let the API decide whether the session is valid.
  return isAdminWorkspaceHostname(window.location.hostname, adminWorkspaceUrl);
}

function clearAdminSession() {
  clearAccessToken();
  useAdminUiStore.getState().setActiveBusinessId(null);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
  }
}

const apiBaseUrl = apiConfig.baseUrl;
// Public account lifecycle requests must not inherit a stale Admin token or refresh an expired OTP session.
export const publicAuthClient = createApiClient({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  headers: { "x-auth-context": "admin" },
  withCredentials: true,
});
const adminSessionPaths = [
  "/auth/admin/login",
  "/auth/admin/refresh",
  "/auth/admin/logout",
];
const refreshApiClient = createApiClient({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  withCredentials: true,
});

function isAdminSessionRequest(url?: string) {
  const path = url?.split("?")[0];
  return path
    ? adminSessionPaths.some((sessionPath) => path.endsWith(sessionPath))
    : false;
}

async function requestAdminAccessToken(): Promise<string | undefined> {
  const response = await refreshApiClient.post<{ access_token?: string }>(
    "/auth/admin/refresh",
    {},
  );
  return response.data?.access_token;
}

export const refreshAdminAccessToken = createSessionRefresh({
  getSessionVersion: getSessionRevision,
  hasRefreshMarker: hasAdminRefreshCookie,
  onAccessToken: setAccessToken,
  onSessionExpired: clearAdminSession,
  requestAccessToken: requestAdminAccessToken,
});

function createAdminClient(resolveBusinessId: () => string | null) {
  return createApiClient({
    baseURL: apiBaseUrl,
    timeout: 15_000,
    getHeaders: () => {
      const tenantId = getTenantId();
      const businessId = resolveBusinessId();

      return {
        "x-business-id": businessId ?? undefined,
        "x-tenant-id": tenantId,
      };
    },
    headers: {
      "x-auth-context": "admin",
    },
    getAccessToken,
    onUnauthorized: refreshAdminAccessToken,
    onUnauthorizedRetryFailed: clearAdminSession,
    shouldHandleUnauthorized: (config) =>
      !isAdminSessionRequest(config.url) && Boolean(getAccessToken()),
    withCredentials: true,
  });
}

export const apiClient = createAdminClient(
  () => useAdminUiStore.getState().activeBusinessId,
);

/** Pin feature requests to their Business even if the user switches the active Business. */
export function createBusinessApiClient(businessId: string) {
  return createAdminClient(() => businessId);
}
