import type { AppLocale } from "@/src/i18n/routing";

export const LANDING_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
] as const;

export function getLocaleSwitchTarget(
  pathname: string,
  search: string,
  hash: string,
) {
  const path =
    pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/";
  return `${path}${search.startsWith("?") ? search : ""}${hash.startsWith("#") ? hash : ""}`;
}

export function isLandingLocale(locale: string): locale is AppLocale {
  return LANDING_LANGUAGES.some((language) => language.code === locale);
}
