import type { PhoneCountry } from "@repo/ui";
import { getCountryForTimezone } from "countries-and-timezones";

const MAX_BUSINESS_SLUG_LENGTH = 80;

const DEFAULT_REGION_BY_LANGUAGE: Record<string, PhoneCountry> = {
  en: "US",
  vi: "VN",
};

export function createBusinessSlug(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("vi")
    .replaceAll("đ", "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_BUSINESS_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

export function createBookingHost(slug: string, bookingDomain: string) {
  return `${slug}.${bookingDomain}`;
}

export function getBrowserTimezone() {
  if (typeof Intl === "undefined") return "Asia/Ho_Chi_Minh";
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const supportedValuesOf = (
      Intl as typeof Intl & {
        supportedValuesOf?: (key: "timeZone") => string[];
      }
    ).supportedValuesOf;
    if (
      timezone &&
      (!supportedValuesOf || supportedValuesOf("timeZone").includes(timezone))
    ) {
      return timezone;
    }
    return "Asia/Ho_Chi_Minh";
  } catch {
    return "Asia/Ho_Chi_Minh";
  }
}

export function getBrowserPhoneCountry(): PhoneCountry {
  if (typeof navigator === "undefined") return "VN";
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const language of languages) {
    const region = language?.match(/[-_]([A-Z]{2})$/i)?.[1]?.toUpperCase();
    if (region) return region as PhoneCountry;
    const languageCode = language?.split(/[-_]/)[0]?.toLowerCase();
    const fallback = languageCode
      ? DEFAULT_REGION_BY_LANGUAGE[languageCode]
      : undefined;
    if (fallback) return fallback;
  }
  return "VN";
}

/**
 * Resolve the most relevant country for an IANA timezone.
 * Timezones can be shared by multiple countries, so the package's first
 * country is used as the best browser-side default; users can still edit it.
 */
export function getCountryFromTimezone(
  timezone: string,
): PhoneCountry | undefined {
  return getCountryForTimezone(timezone)?.id as PhoneCountry | undefined;
}
