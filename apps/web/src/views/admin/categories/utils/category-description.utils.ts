const MEDIA_ELEMENT_PATTERN = /<(?:img|video)\b/i;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const HTML_SPACE_PATTERN = /&nbsp;/gi;

export function normalizeCategoryDescription(value: string): string | null {
  const html = value.trim();

  if (!html) return null;
  if (MEDIA_ELEMENT_PATTERN.test(html)) return html;

  const text = html
    .replace(HTML_TAG_PATTERN, "")
    .replace(HTML_SPACE_PATTERN, " ")
    .trim();

  return text ? html : null;
}
