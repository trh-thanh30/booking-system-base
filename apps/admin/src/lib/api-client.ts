import { createApiClient } from "@repo/shared";
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

let refreshPromise: Promise<string | false> | undefined;

async function refreshAccessToken(): Promise<string | false> {
  if (!hasAdminRefreshCookie()) {
    clearAdminSession();
    return false;
  }

  refreshPromise ??= fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1"}/auth/admin/refresh`,
    {
      body: JSON.stringify({}),
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  )
    .then(async (response) => {
      if (!response.ok) {
        clearAdminSession();
        return false as const;
      }

      const payload = (await response.json()) as {
        data?: { access_token?: string };
      };
      const accessToken = payload.data?.access_token;

      if (!accessToken) {
        clearAdminSession();
        return false as const;
      }

      setAccessToken(accessToken);
      return accessToken;
    })
    .catch(() => {
      clearAdminSession();
      return false as const;
    })
    .finally(() => {
      refreshPromise = undefined;
    });

  return refreshPromise;
}

export const apiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1",
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
  withCredentials: true,
});
