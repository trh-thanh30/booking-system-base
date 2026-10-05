import { HttpClientError } from "@repo/shared";

export function getOAuthErrorKey(code: string) {
  const keys: Record<string, string> = {
    GOOGLE_AUTH_CANCELLED: "google.cancelled",
    GOOGLE_IDENTITY_CONFLICT: "google.identityConflict",
    GOOGLE_EMAIL_NOT_VERIFIED: "google.emailNotVerified",
    GOOGLE_ACCOUNT_INACTIVE: "google.inactive",
    GOOGLE_OWNER_REQUIRED: "google.ownerRequired",
    GOOGLE_OAUTH_STATE_INVALID: "google.stateExpired",
    GOOGLE_NONCE_INVALID: "google.stateExpired",
    GOOGLE_ONBOARDING_SESSION_INVALID: "google.sessionExpired",
    GOOGLE_ONBOARDING_ALREADY_COMPLETED: "google.alreadyCompleted",
  };
  return Object.hasOwn(keys, code) ? keys[code]! : "google.unavailable";
}

export function stripOAuthError(href: string) {
  const url = new URL(href);
  url.searchParams.delete("oauthError");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function getGoogleOnboardingError(error: unknown) {
  if (
    error instanceof Error &&
    ["ADMIN_PROFILE_INVALID", "ADMIN_SESSION_CANCELLED"].includes(error.message)
  )
    return { key: "google.unavailable", terminal: true };
  if (error instanceof HttpClientError) {
    if (error.isNetworkError)
      return { key: "google.networkError", terminal: false };
    if (
      error.status === 401 ||
      error.code === "GOOGLE_ONBOARDING_SESSION_INVALID"
    )
      return { key: "google.sessionExpired", terminal: true };
    if (error.code === "GOOGLE_ONBOARDING_ALREADY_COMPLETED")
      return { key: "google.alreadyCompleted", terminal: true };
    if (error.code === "GOOGLE_IDENTITY_CONFLICT")
      return { key: "google.identityConflict", terminal: true };
    if (error.status === 409)
      return { key: "google.detailsConflict", terminal: false };
    if (error.status === 429)
      return { key: "google.rateLimited", terminal: false };
  }
  return { key: "google.unavailable", terminal: false };
}

export function createGoogleRedirect(navigate: (url: string) => void) {
  let pending = false;
  return {
    start(url: string) {
      if (pending) return false;
      pending = true;
      try {
        navigate(url);
      } catch (error) {
        pending = false;
        throw error;
      }
      return true;
    },
    reset() {
      pending = false;
    },
  };
}
