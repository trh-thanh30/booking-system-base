import { createApiClient } from "@repo/shared";
import { clearAccessToken, getAccessToken, setAccessToken } from "./auth-token";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

let refreshPromise: Promise<string | false> | undefined;

async function refreshAccessToken(): Promise<string | false> {
  refreshPromise ??= fetch(`${apiBaseUrl}/auth/refresh`, {
    body: JSON.stringify({}),
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-auth-context": "platform",
    },
    method: "POST",
  })
    .then(async (response) => {
      if (!response.ok) {
        clearAccessToken();
        return false as const;
      }

      const payload = (await response.json()) as {
        data?: { access_token?: string };
      };
      const accessToken = payload.data?.access_token;

      if (!accessToken) {
        clearAccessToken();
        return false as const;
      }

      setAccessToken(accessToken);
      return accessToken;
    })
    .catch(() => {
      clearAccessToken();
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
