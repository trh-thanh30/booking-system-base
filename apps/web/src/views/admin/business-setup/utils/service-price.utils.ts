export function formatServicePriceInput(digits: string, locale: string) {
  if (!digits) return "";
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 0,
  }).format(BigInt(digits));
}

export function parseServicePriceInput(input: string, locale: string) {
  const group = locale === "vi" ? "." : ",";
  const digits = input.trim().split(group).join("");
  if (!/^\d*$/.test(digits)) return null;
  return digits.replace(/^0+(?=\d)/, "");
}
