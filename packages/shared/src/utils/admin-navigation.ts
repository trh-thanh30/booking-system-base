const dashboardRoutes = new Set([
  "dashboard",
  "businesses",
  "users",
  "bookings",
  "system",
  "settings",
  "business-setup",
]);

export function stripAuthLocale(pathname: string) {
  return pathname.replace(/^\/(vi|en)(?=\/|$)/, "") || "/";
}

/** Frontend navigation only: never accept API, marketing, auth or external URLs. */
export function getSafeAdminReturnTo(value: string | null | undefined): string {
  const fallback = "/admin/dashboard";
  if (
    !value ||
    !value.startsWith("/") ||
    /[\\\s%]/.test(value.split("?")[0] ?? "")
  )
    return fallback;
  try {
    const url = new URL(value, "https://admin.local");
    const pathname = stripAuthLocale(url.pathname);
    if (
      url.origin !== "https://admin.local" ||
      !pathname.startsWith("/admin/") ||
      !dashboardRoutes.has(pathname.split("/")[2] ?? "")
    )
      return fallback;
    return `${pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
