import { createApiClient } from "@repo/shared";
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

let refreshPromise: Promise<string | false> | undefined;

async function refreshAccessToken(): Promise<string | false> {
  if (!hasPlatformRefreshCookie()) {
    clearPlatformSession();
    return false;
  }

  refreshPromise ??= fetch(`${apiBaseUrl}/auth/platform/refresh`, {
    body: JSON.stringify({}),
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then(async (response) => {
      if (!response.ok) {
        clearPlatformSession();
        return false as const;
      }

      const payload = (await response.json()) as {
        data?: { access_token?: string };
      };
      const accessToken = payload.data?.access_token;

      if (!accessToken) {
        clearPlatformSession();
        return false as const;
      }

      setAccessToken(accessToken);
      return accessToken;
    })
    .catch(() => {
      clearPlatformSession();
      return false as const;
    })
    .finally(() => {
      refreshPromise = undefined;
    });

  return refreshPromise;
}

export const apiClient = createApiClient({
  baseURL: apiBaseUrl,
  headers: {
    "x-auth-context": "platform",
  },
  getAccessToken,
  onUnauthorized: refreshAccessToken,
  withCredentials: true,
});
