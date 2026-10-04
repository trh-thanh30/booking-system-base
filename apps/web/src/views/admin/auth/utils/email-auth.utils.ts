import { HttpClientError } from "@repo/shared";
import { getSafeReturnTo } from "@/src/lib/admin/auth-routing";

export function getEmailAuthError(error: unknown, phase: "request" | "otp") {
  const result = { key: "emailFlow.failed", expired: false, retryAfter: 0 };
  if (!(error instanceof HttpClientError)) return result;
  if (error.isNetworkError) return { ...result, key: "emailFlow.networkError" };
  if (error.status === 429) {
    const details = error.details;
    const seconds =
      typeof details === "object" && details !== null && "retryAfter" in details
        ? Number(details.retryAfter)
        : 60;
    return {
      ...result,
      key: "emailFlow.rateLimited",
      retryAfter:
        Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 60,
    };
  }
  // Only interpret OTP errors here. Public request errors must never disclose account existence.
  if (phase === "otp") {
    if (error.status === 401 || error.code === "SESSION_EXPIRED")
      return { ...result, key: "emailFlow.sessionExpired", expired: true };
    if (error.status === 400)
      return { ...result, key: "emailFlow.invalidCode" };
  }
  return result;
}

export function getSessionUrl(
  route: "verify-email" | "reset-password",
  sessionId: string,
  returnTo?: string,
) {
  const params = new URLSearchParams({ sessionId });
  if (returnTo) params.set("returnTo", getSafeReturnTo(returnTo));
  return `/admin/${route}?${params}`;
}

export function getUnverifiedEmailUrl(error: unknown, returnTo?: string) {
  if (
    !(error instanceof HttpClientError) ||
    error.code !== "EMAIL_NOT_VERIFIED"
  )
    return null;
  const details = error.details;
  const sessionId =
    typeof details === "object" &&
    details !== null &&
    "sessionId" in details &&
    typeof details.sessionId === "string"
      ? details.sessionId
      : "";
  const url = getSessionUrl("verify-email", sessionId, returnTo);
  return typeof details === "object" &&
    details !== null &&
    "requiresOnboarding" in details &&
    details.requiresOnboarding === true
    ? `${url}&onboarding=1`
    : url;
}
