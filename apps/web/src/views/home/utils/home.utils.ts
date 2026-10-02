/**
 * Returns Tailwind utility class sets for a given brand color name.
 * Used by the Template Customization section to dynamically style the live preview.
 */
export const getColorClasses = (colorName: string) => {
  switch (colorName) {
    case "emerald":
      return {
        bg: "bg-success-600 hover:bg-success-700",
        text: "text-success-surface-foreground",
        border: "border-success-600",
        accentBg: "bg-success-surface",
        ring: "ring-success-500/15",
      };
    case "violet":
      return {
        bg: "bg-info-600 hover:bg-info-700",
        text: "text-info-surface-foreground",
        border: "border-info-600",
        accentBg: "bg-info-surface",
        ring: "ring-info-500/15",
      };
    case "rose":
      return {
        bg: "bg-danger-500 hover:bg-danger-600",
        text: "text-danger-500",
        border: "border-danger-500",
        accentBg: "bg-danger-surface",
        ring: "ring-danger-500/15",
      };
    case "amber":
      return {
        bg: "bg-warning-500 hover:bg-warning-600",
        text: "text-warning-500",
        border: "border-warning-500",
        accentBg: "bg-warning-surface",
        ring: "ring-warning-500/15",
      };
    case "brand-blue":
    default:
      return {
        bg: "bg-primary hover:bg-primary-hover",
        text: "text-primary",
        border: "border-primary",
        accentBg: "bg-accent/40",
        ring: "ring-primary/15",
      };
  }
};

export const formatSlug = (name: string, fallback: string = "your-brand") => {
  if (!name) return fallback;
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return slug || fallback;
};

export const downloadQrCodeSvg = (businessName: string) => {
  const slug = formatSlug(businessName);
  const qrContent = `https://bookingbase.com/${slug}`;

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="300" height="300">
    <rect width="100" height="100" fill="var(--color-surface)"/>
    <rect x="5" y="5" width="90" height="90" fill="none" stroke="var(--color-primary)" stroke-width="2"/>
    
    <rect x="15" y="15" width="25" height="25" fill="var(--color-foreground)"/>
    <rect x="20" y="20" width="15" height="15" fill="var(--color-surface)"/>
    <rect x="24" y="24" width="7" height="7" fill="var(--color-foreground)"/>
    
    <rect x="60" y="15" width="25" height="25" fill="var(--color-foreground)"/>
    <rect x="65" y="20" width="15" height="15" fill="var(--color-surface)"/>
    <rect x="69" y="24" width="7" height="7" fill="var(--color-foreground)"/>
    
    <rect x="15" y="60" width="25" height="25" fill="var(--color-foreground)"/>
    <rect x="20" y="65" width="15" height="15" fill="var(--color-surface)"/>
    <rect x="24" y="69" width="7" height="7" fill="var(--color-foreground)"/>
    
    <rect x="45" y="15" width="10" height="10" fill="var(--color-foreground)"/>
    <rect x="45" y="35" width="5" height="5" fill="var(--color-foreground)"/>
    <rect x="50" y="40" width="5" height="5" fill="var(--color-foreground)"/>
    
    <rect x="15" y="45" width="10" height="5" fill="var(--color-foreground)"/>
    <rect x="30" y="45" width="10" height="10" fill="var(--color-foreground)"/>
    
    <rect x="45" y="60" width="10" height="10" fill="var(--color-foreground)"/>
    <rect x="45" y="75" width="5" height="5" fill="var(--color-foreground)"/>
    <rect x="50" y="80" width="10" height="5" fill="var(--color-foreground)"/>
    
    <rect x="60" y="45" width="10" height="10" fill="var(--color-foreground)"/>
    <rect x="75" y="45" width="10" height="5" fill="var(--color-foreground)"/>
    <rect x="70" y="55" width="15" height="15" fill="var(--color-foreground)"/>
    
    <rect x="60" y="75" width="15" height="10" fill="var(--color-foreground)"/>
    <rect x="80" y="75" width="5" height="10" fill="var(--color-foreground)"/>
    
    <text x="50" y="53" font-family="sans-serif" font-size="5" font-weight="bold" fill="var(--color-primary)" text-anchor="middle">SCAN TO BOOK</text>
    <text x="50" y="91" font-family="sans-serif" font-size="4" font-weight="bold" fill="var(--color-muted-foreground)" text-anchor="middle">${qrContent}</text>
  </svg>`;

  try {
    // Downloaded SVG has no app stylesheet: resolve tokens before exporting.
    const tokens = getComputedStyle(document.documentElement);
    const portableSvg = svgContent.replace(
      /var\((--color-[\w-]+)\)/g,
      (_match, token: string) =>
        tokens.getPropertyValue(token).trim() || "currentColor",
    );
    const blob = new Blob([portableSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `booking-qr-${slug}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Failed to download QR code SVG", e);
  }
};

export const isHexColor = (color: string) => /^#[\da-f]{6}$/i.test(color);

export function withColorAlpha(color: string, alphaHex: string) {
  const opacity = parseInt(alphaHex, 16);
  const percent = Number.isFinite(opacity)
    ? (Math.max(0, Math.min(255, opacity)) / 255) * 100
    : 100;
  return `color-mix(in srgb, ${color} ${percent.toFixed(2)}%, transparent)`;
}

export const getHexColorValue = (color: string) => {
  if (isHexColor(color)) return color;
  switch (color) {
    case "emerald":
      return "var(--color-success)";
    case "violet":
      return "var(--color-info)";
    case "rose":
      return "var(--color-danger)";
    case "amber":
      return "var(--color-warning)";
    case "brand-blue":
    default:
      return "var(--color-primary)";
  }
};
