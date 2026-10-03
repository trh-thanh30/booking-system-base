import { getSafeAdminReturnTo, stripAuthLocale } from "@repo/shared";

export { stripAuthLocale } from "@repo/shared";

const publicAuthRoutes = new Set([
  "login",
  "verify-email",
  "forgot-password",
  "reset-password",
  "invitations",
  "onboarding",
]);
export function isPublicAuthRoute(pathname: string) {
  const segments = stripAuthLocale(pathname).split("/");
  return segments[1] === "admin" && publicAuthRoutes.has(segments[2] ?? "");
}

export function isAdminRoute(pathname: string) {
  const path = stripAuthLocale(pathname);
  return path === "/admin" || path.startsWith("/admin/");
}

export function getSafeReturnTo(value: string | null | undefined): string {
  return getSafeAdminReturnTo(value);
}

export function getLoginUrl(returnTo: string) {
  return `/admin/login?returnTo=${encodeURIComponent(getSafeReturnTo(returnTo))}`;
}

export function buildGoogleLoginUrl(
  baseUrl: string,
  locale: string,
  returnTo?: string,
) {
  const url = new URL(baseUrl);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Invalid API URL");
  url.pathname = `${url.pathname.replace(/\/$/, "")}/auth/admin/google`;
  url.search = new URLSearchParams({
    locale: locale === "en" ? "en" : "vi",
    returnTo: getSafeReturnTo(returnTo),
  }).toString();
  url.hash = "";
  return url.href;
}
