import { createApiClient, createSessionRefresh } from "@repo/shared";
import { useAdminUiStore } from "@/src/app/stores/ui.store";
import {
  clearAccessToken,
  getAccessToken,
  getTenantId,
  setAccessToken,
} from "./auth-token";

export const ADMIN_SESSION_EXPIRED_EVENT = "booking:admin-session-expired";

export function hasAdminRefreshCookie() {
  return (
    typeof document !== "undefined" &&
    document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith("admin_has_rt="))
  );
}

function clearAdminSession() {
  clearAccessToken();
  useAdminUiStore.getState().setActiveBusinessId(null);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
  }
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
const adminSessionPaths = [
  "/auth/admin/login",
  "/auth/admin/refresh",
  "/auth/admin/logout",
];
const refreshApiClient = createApiClient({
  baseURL: apiBaseUrl,
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

const refreshAccessToken = createSessionRefresh({
  hasRefreshMarker: hasAdminRefreshCookie,
  onAccessToken: setAccessToken,
  onSessionExpired: clearAdminSession,
  requestAccessToken: requestAdminAccessToken,
});

export const apiClient = createApiClient({
  baseURL: apiBaseUrl,
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
  onUnauthorized: refreshAccessToken,
  shouldHandleUnauthorized: (config) => !isAdminSessionRequest(config.url),
  withCredentials: true,
});
