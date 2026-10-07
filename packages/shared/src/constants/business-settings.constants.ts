export const BOOKING_TEMPLATES = [
  {
    id: "classic",
    name: { vi: "Cơ bản", en: "Classic" },
    description: {
      vi: "Danh sách dịch vụ rõ ràng, dễ chọn và đặt lịch.",
      en: "A clear service list for simple appointment booking.",
    },
  },
  {
    id: "modern",
    name: { vi: "Hiện đại", en: "Modern" },
    description: {
      vi: "Giới thiệu dịch vụ bằng các thẻ nội dung nổi bật.",
      en: "Highlight services with a contemporary card layout.",
    },
  },
  {
    id: "minimal",
    name: { vi: "Tối giản", en: "Minimal" },
    description: {
      vi: "Giao diện gọn gàng, tập trung vào thao tác đặt lịch.",
      en: "A compact layout focused on booking an appointment.",
    },
  },
] as const;

export const BOOKING_TEMPLATE_IDS = ["classic", "modern", "minimal"] as const;
