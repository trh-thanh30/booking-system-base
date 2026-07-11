const ACCESS_TOKEN_KEY = "booking_admin_access_token";

let memoryAccessToken: string | undefined;

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

  if (canUseStorage()) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}
