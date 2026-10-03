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

export const ADMIN_SESSION_EXPIRED_EVENT = "booking:admin-session-expired";

export function hasAdminRefreshCookie() {
  return (
    typeof document !== "undefined" &&
    document.cookie
      .split(";")
      .some((cookie) => cookie.trim() === "admin_has_rt=1")
  );
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

export const apiClient = createApiClient({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  getHeaders: () => {
    const tenantId = getTenantId();
    const businessId = useAdminUiStore.getState().activeBusinessId;

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
