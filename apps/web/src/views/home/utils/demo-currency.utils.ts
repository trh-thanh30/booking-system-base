/** Fixed illustrative prices for landing demos, not a live exchange rate. */
export function getDemoAmount(usdAmount: number, locale: string) {
  return locale === "vi" ? Math.round(usdAmount * 25_000) : usdAmount;
}

export function getLocaleCurrency(locale: string) {
  return locale === "vi" ? "VND" : "USD";
}

export function formatDemoPrice(usdAmount: number, locale: string) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: getLocaleCurrency(locale),
  }).format(getDemoAmount(usdAmount, locale));
}
