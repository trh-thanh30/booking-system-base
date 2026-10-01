import { HttpClientError } from "@repo/shared";

export function getLoginErrorKey(error: unknown) {
  if (error instanceof Error && error.message === "ADMIN_PROFILE_INVALID")
    return "login.invalidWorkspace";
  if (!(error instanceof HttpClientError)) return "login.failed";
  if (error.isNetworkError) return "login.networkError";
  if (error.status === 429) return "login.rateLimited";
  if (error.code === "ACCOUNT_INACTIVE" || error.message.includes("inactive"))
    return "login.inactive";
  if (error.status === 401 || error.message.includes("Invalid email"))
    return "login.invalidCredentials";
  if (error.status === 403) return "login.invalidWorkspace";
  return "login.failed";
}
