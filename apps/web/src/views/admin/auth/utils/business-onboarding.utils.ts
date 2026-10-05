const MAX_BUSINESS_SLUG_LENGTH = 80;

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
