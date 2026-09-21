/**
 * Returns Tailwind utility class sets for a given brand color name.
 * Used by the Template Customization section to dynamically style the live preview.
 */
export const getColorClasses = (colorName: string) => {
  switch (colorName) {
    case "emerald":
      return {
        bg: "bg-emerald-600 hover:bg-emerald-700",
        text: "text-emerald-600",
        border: "border-emerald-600",
        accentBg: "bg-emerald-50",
        ring: "ring-emerald-500/15",
      };
    case "violet":
      return {
        bg: "bg-violet-600 hover:bg-violet-700",
        text: "text-violet-600",
        border: "border-violet-600",
        accentBg: "bg-violet-50",
        ring: "ring-violet-500/15",
      };
    case "rose":
      return {
        bg: "bg-rose-500 hover:bg-rose-600",
        text: "text-rose-500",
        border: "border-rose-500",
        accentBg: "bg-rose-50",
        ring: "ring-rose-500/15",
      };
    case "amber":
      return {
        bg: "bg-amber-500 hover:bg-amber-600",
        text: "text-amber-500",
        border: "border-amber-500",
        accentBg: "bg-amber-50",
        ring: "ring-amber-500/15",
      };
    case "brand-blue":
    default:
      return {
        bg: "bg-brand-blue hover:bg-brand-blue-hover",
        text: "text-brand-blue",
        border: "border-brand-blue",
        accentBg: "bg-[#E5F0FF]/40",
        ring: "ring-brand-blue/15",
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
    <rect width="100" height="100" fill="#ffffff"/>
    <rect x="5" y="5" width="90" height="90" fill="none" stroke="#2563eb" stroke-width="2"/>
    
    <rect x="15" y="15" width="25" height="25" fill="#0f172a"/>
    <rect x="20" y="20" width="15" height="15" fill="#ffffff"/>
    <rect x="24" y="24" width="7" height="7" fill="#0f172a"/>
    
    <rect x="60" y="15" width="25" height="25" fill="#0f172a"/>
    <rect x="65" y="20" width="15" height="15" fill="#ffffff"/>
    <rect x="69" y="24" width="7" height="7" fill="#0f172a"/>
    
    <rect x="15" y="60" width="25" height="25" fill="#0f172a"/>
    <rect x="20" y="65" width="15" height="15" fill="#ffffff"/>
    <rect x="24" y="69" width="7" height="7" fill="#0f172a"/>
    
    <rect x="45" y="15" width="10" height="10" fill="#0f172a"/>
    <rect x="45" y="35" width="5" height="5" fill="#0f172a"/>
    <rect x="50" y="40" width="5" height="5" fill="#0f172a"/>
    
    <rect x="15" y="45" width="10" height="5" fill="#0f172a"/>
    <rect x="30" y="45" width="10" height="10" fill="#0f172a"/>
    
    <rect x="45" y="60" width="10" height="10" fill="#0f172a"/>
    <rect x="45" y="75" width="5" height="5" fill="#0f172a"/>
    <rect x="50" y="80" width="10" height="5" fill="#0f172a"/>
    
    <rect x="60" y="45" width="10" height="10" fill="#0f172a"/>
    <rect x="75" y="45" width="10" height="5" fill="#0f172a"/>
    <rect x="70" y="55" width="15" height="15" fill="#0f172a"/>
    
    <rect x="60" y="75" width="15" height="10" fill="#0f172a"/>
    <rect x="80" y="75" width="5" height="10" fill="#0f172a"/>
    
    <text x="50" y="53" font-family="sans-serif" font-size="5" font-weight="bold" fill="#2563eb" text-anchor="middle">SCAN TO BOOK</text>
    <text x="50" y="91" font-family="sans-serif" font-size="4" font-weight="bold" fill="#64748b" text-anchor="middle">${qrContent}</text>
  </svg>`;

  try {
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
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

export const isHexColor = (color: string) => color.startsWith("#");

export const getHexColorValue = (color: string) => {
  if (isHexColor(color)) return color;
  switch (color) {
    case "emerald":
      return "#10b981";
    case "violet":
      return "#7c3aed";
    case "rose":
      return "#ec4899";
    case "amber":
      return "#f59e0b";
    case "brand-blue":
    default:
      return "#2563eb";
  }
};
