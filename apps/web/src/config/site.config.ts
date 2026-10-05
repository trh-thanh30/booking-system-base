function publicOrigin(value: string | undefined, fallback: string) {
  try {
    const url = new URL(value ?? fallback);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password)
      return fallback;
    return url.origin;
  } catch {
    return fallback;
  }
}

function publicHost(value: string | undefined, fallback: string) {
  try {
    const url = new URL(`https://${value?.trim() || fallback}`);
    if (
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      return fallback;
    return url.host.toLowerCase();
  } catch {
    return fallback;
  }
}

export const siteConfig = {
  name: "BookingBase",
  webUrl: publicOrigin(
    process.env.NEXT_PUBLIC_WEB_URL,
    "http://localhost:3001",
  ),
  bookingDomain: publicHost(
    process.env.NEXT_PUBLIC_BOOKING_DOMAIN,
    "bookingbase.com",
  ),
} as const;
