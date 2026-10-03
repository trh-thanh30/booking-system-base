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

export const siteConfig = {
  name: "BookingBase",
  webUrl: publicOrigin(
    process.env.NEXT_PUBLIC_WEB_URL,
    "http://localhost:3001",
  ),
} as const;
