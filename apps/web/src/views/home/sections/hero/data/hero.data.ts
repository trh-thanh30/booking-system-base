export const TEMPLATES_SHOWCASE = [
  {
    id: "coaching",
    rating: 4.9,
    reviewsCount: 185,
    services: [
      { id: "leadership", durationMinutes: 60, price: 150 },
      { id: "scaling", durationMinutes: 45, price: 90 },
    ],
    slots: ["09:30 AM", "11:00 AM", "02:30 PM", "04:00 PM"],
  },
  {
    id: "beauty",
    rating: 4.9,
    reviewsCount: 284,
    services: [
      { id: "massage", durationMinutes: 60, price: 65 },
      { id: "facial", durationMinutes: 75, price: 85 },
    ],
    slots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"],
  },
  {
    id: "health",
    rating: 5,
    reviewsCount: 420,
    services: [
      { id: "checkup", durationMinutes: 30, price: 45 },
      { id: "whitening", durationMinutes: 45, price: 120 },
    ],
    slots: ["08:30 AM", "10:00 AM", "01:30 PM", "03:00 PM"],
  },
  {
    id: "fitness",
    rating: 4.9,
    reviewsCount: 312,
    services: [
      { id: "vinyasa", durationMinutes: 60, price: 25 },
      { id: "pilates", durationMinutes: 50, price: 70 },
    ],
    slots: ["07:00 AM", "08:30 AM", "05:30 PM", "07:00 PM"],
  },
  {
    id: "consulting",
    rating: 5,
    reviewsCount: 96,
    services: [
      { id: "architecture", durationMinutes: 60, price: 180 },
      { id: "interview", durationMinutes: 45, price: 120 },
    ],
    slots: ["10:00 AM", "01:00 PM", "03:30 PM", "05:00 PM"],
  },
  {
    id: "creative",
    rating: 4.8,
    reviewsCount: 160,
    services: [
      { id: "portrait", durationMinutes: 60, price: 110 },
      { id: "lookbook", durationMinutes: 90, price: 180 },
    ],
    slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:30 PM"],
  },
] as const;
