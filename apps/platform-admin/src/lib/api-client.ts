import { createApiClient, createSessionRefresh } from "@repo/shared";
import { clearAccessToken, getAccessToken, setAccessToken } from "./auth-token";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export const PLATFORM_SESSION_EXPIRED_EVENT =
  "booking:platform-session-expired";

export function hasPlatformRefreshCookie() {
  return (
    typeof document !== "undefined" &&
    document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith("platform_has_rt="))
  );
}

function clearPlatformSession() {
  clearAccessToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PLATFORM_SESSION_EXPIRED_EVENT));
  }
}

const platformSessionPaths = [
  "/auth/platform/login",
  "/auth/platform/refresh",
  "/auth/platform/logout",
];
const refreshApiClient = createApiClient({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

function isPlatformSessionRequest(url?: string) {
  const path = url?.split("?")[0];
  return path
    ? platformSessionPaths.some((sessionPath) => path.endsWith(sessionPath))
    : false;
}

async function requestPlatformAccessToken(): Promise<string | undefined> {
  const response = await refreshApiClient.post<{ access_token?: string }>(
    "/auth/platform/refresh",
    {},
  );
  return response.data?.access_token;
}

const refreshAccessToken = createSessionRefresh({
  hasRefreshMarker: hasPlatformRefreshCookie,
  onAccessToken: setAccessToken,
  onSessionExpired: clearPlatformSession,
  requestAccessToken: requestPlatformAccessToken,
});

export const apiClient = createApiClient({
  baseURL: apiBaseUrl,
  headers: {
    "x-auth-context": "platform",
  },
  getAccessToken,
  onUnauthorized: refreshAccessToken,
  shouldHandleUnauthorized: (config) => !isPlatformSessionRequest(config.url),
  withCredentials: true,
});
