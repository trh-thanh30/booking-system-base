/** Only templates with an implemented preview belong in the selectable catalog. */
export const BOOKING_TEMPLATES = [
  {
    id: "nail-salon-v2",
    name: { vi: "Tiệm nail", en: "Nail salon" },
    description: {
      vi: "Mẫu tiệm nail với bộ sưu tập ảnh và phần giới thiệu dịch vụ. Bản demo chưa kết nối đặt lịch thật.",
      en: "A nail salon layout with a gallery and service showcase. This demo does not create real bookings.",
    },
  },
] as const;

// Keep historical IDs valid for existing saved settings and older API clients.
export const BOOKING_TEMPLATE_IDS = [
  "classic",
  "modern",
  "minimal",
  "nail-salon-v2",
] as const;
