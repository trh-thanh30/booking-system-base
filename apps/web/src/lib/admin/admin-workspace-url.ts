import { siteConfig } from "@/src/config/site.config";
import { getSafeReturnTo, isAdminRoute, stripAuthLocale } from "./auth-routing";

const TENANT_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const INTERNAL_ORIGIN = "http://admin.internal";

type AdminUrlOptions = {
  baseUrl?: string;
  locale: string;
};

type TenantAdminUrlOptions = AdminUrlOptions & {
  returnTo?: string | null;
  tenantSlug: string;
};

function getBaseUrl(value: string) {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new TypeError("Invalid Admin workspace URL");
  }
  return url;
}

function getLocale(value: string) {
  return value === "en" ? "en" : "vi";
}

function usesTenantSubdomain(url: URL) {
  return url.hostname !== "localhost";
}

function applyLocalizedAdminPath(url: URL, locale: string, value: string) {
  const destination = new URL(value, INTERNAL_ORIGIN);
  const pathname = stripAuthLocale(destination.pathname);
  if (destination.origin !== INTERNAL_ORIGIN || !isAdminRoute(pathname)) {
    throw new TypeError("Invalid Admin path");
  }
  url.pathname = `/${getLocale(locale)}${pathname}`;
  url.search = destination.search;
  url.hash = "";
  return url.toString();
}

export function buildTenantAdminUrl({
  baseUrl = siteConfig.adminWorkspaceUrl,
  locale,
  returnTo,
  tenantSlug,
}: TenantAdminUrlOptions) {
  if (!TENANT_SLUG_PATTERN.test(tenantSlug)) {
    throw new TypeError("Invalid Tenant slug");
  }
  const url = getBaseUrl(baseUrl);
  if (usesTenantSubdomain(url)) {
    url.hostname = `${tenantSlug}.${url.hostname}`;
  }
  return applyLocalizedAdminPath(url, locale, getSafeReturnTo(returnTo));
}

export function buildAdminBaseUrl({
  baseUrl = siteConfig.adminWorkspaceUrl,
  locale,
  pathname,
}: AdminUrlOptions & { pathname: string }) {
  return applyLocalizedAdminPath(getBaseUrl(baseUrl), locale, pathname);
}

export function isTenantWorkspaceHostname(hostname: string, baseUrl: string) {
  const normalizedHostname = hostname.trim().toLowerCase().replace(/\.$/, "");
  const baseHostname = getBaseUrl(baseUrl).hostname;
  if (baseHostname === "localhost") return false;
  const suffix = `.${baseHostname}`;
  if (!normalizedHostname.endsWith(suffix)) return false;
  const tenantSlug = normalizedHostname.slice(0, -suffix.length);
  return TENANT_SLUG_PATTERN.test(tenantSlug);
}

export function isAdminWorkspaceHostname(hostname: string, baseUrl: string) {
  const normalizedHostname = hostname.trim().toLowerCase().replace(/\.$/, "");
  const baseHostname = getBaseUrl(baseUrl).hostname;
  if (baseHostname === "localhost") return false;
  return (
    normalizedHostname === baseHostname ||
    isTenantWorkspaceHostname(normalizedHostname, baseUrl)
  );
}
