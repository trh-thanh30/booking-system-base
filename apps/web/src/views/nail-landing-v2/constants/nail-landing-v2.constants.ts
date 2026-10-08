import { NAIL_TEMPLATE_PALETTES } from "@repo/ui";

export const SHOP_V2 = {
  name: "Glossora",
  phone: "+44 20 7946 0929",
  email: "hello@glossora.com",
  address: "12 Golden Square, Soho, London W1F 9JE",
};

export const STATS_V2 = [
  { value: "24+", label: "Nail Styles" },
  { value: "1,500+", label: "Happy Clients" },
  { value: "99%", label: "Satisfaction Rate" },
];

export const SERVICES_V2 = [
  {
    id: "manicure",
    name: "Manicure",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.",
    price: "£28",
  },
  {
    id: "pedicure",
    name: "Pedicure",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.",
    price: "£38",
  },
  {
    id: "gel-polish",
    name: "Gel Polish",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.",
    price: "£42",
  },
  {
    id: "nail-art",
    name: "Nail Art",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.",
    price: "£55",
  },
];

export const SPECIAL_OFFERS_V2 = {
  title: "Shine More, Spend Less",
  subtitle:
    "Get 40% off on all nail extensions, manicures, and spa treatments. It's your moment to sparkle — beauty begins at your fingertips!",
  countdown: {
    days: "146",
    hours: "23",
    minutes: "01",
    seconds: "40",
  },
};

export const TEAM_V2 = [
  {
    name: "Sophia Turner",
    role: "Senior Nail Artist",
    image: "/nail-salon/ver3.webp",
    bg: "beige",
  },
  {
    name: "Lara Fernandez",
    role: "Nail Art Specialist",
    image: "/nail-salon/ver2.webp",
    bg: "purple",
  },
  {
    name: "Maya Patel",
    role: "Salon Stylist",
    image: "/nail-salon/ver1.webp",
    bg: "beige",
  },
  {
    name: "Emma Grace",
    role: "Spa & Wellness Expert",
    image: "/nail-salon/ver3.webp",
    bg: "beige",
  },
];

export const GALLERY_V2 = [
  { id: 1, url: "/nail-salon/ver1.webp" },
  { id: 2, url: "/nail-salon/ver2.webp" },
  { id: 3, url: "/nail-salon/ver3.webp" },
  { id: 4, url: "/nail-salon/ver2.webp" },
  { id: 5, url: "/nail-salon/ver1.webp" },
  { id: 6, url: "/nail-salon/ver3.webp" },
];

export const TESTIMONIALS_V2 = [
  {
    name: "Alex Morgan",
    role: "Client",
    avatar: "/nail-salon/ver3.webp",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus, ultrices mauris. Maecenas vitae mattis tellus.",
  },
  {
    name: "Sarah Mitchell",
    role: "Client",
    avatar: "/nail-salon/ver1.webp",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus, ultrices mauris. Maecenas vitae mattis tellus.",
  },
];

export const BLOGS_V2 = [
  {
    title: "5 Nail Care Mistakes You Should Avoid",
    excerpt:
      "Scelerisque sapien magna etiam potenti. Vivamus blandit laoreet a enim nisl vitae tellus. Nam non egestas sed bibendum turpis...",
    image: "/nail-salon/ver1.webp",
    bg: "beige",
  },
  {
    title: "The Ultimate Guide To Gel Vs. Acrylic Nails",
    excerpt:
      "Scelerisque sapien magna etiam potenti. Vivamus blandit laoreet a enim nisl vitae tellus. Nam non egestas sed bibendum turpis...",
    image: "/nail-salon/ver2.webp",
    bg: "beige",
  },
  {
    title: "How To Choose The Perfect Nail Shape",
    excerpt:
      "Scelerisque sapien magna etiam potenti. Vivamus blandit laoreet a enim nisl vitae tellus. Nam non egestas sed bibendum turpis...",
    image: "/nail-salon/ver3.webp",
    bg: "purple",
  },
];

export const FAQS_V2 = [
  {
    id: 1,
    q: "How long does a Glossora Gel Manicure last?",
    a: "Our gel manicures are designed for longevity and typically last 2 to 3 weeks without chipping, depending on nail growth and daily activities.",
  },
  {
    id: 2,
    q: "Do you offer extensions or enhancements?",
    a: "Yes, we offer premium soft-gel extensions (Aprés Gel-X) and builder-gel (BIAB) overlays to add strength and length naturally.",
  },
  {
    id: 3,
    q: "What is your cancellation policy?",
    a: "We require at least 24 hours notice to reschedule or cancel appointments. Cancellations with less than 24 hours notice may incur a fee.",
  },
];

export const THEME_TEMPLATES_V2 = [
  {
    id: "glossora-luxury",
    name: "Glossora Luxury",
    description: "Elegant mauve and soft cream tones (Default)",
    colors: NAIL_TEMPLATE_PALETTES[0]!,
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    description: "Classic feminine pink tones, romantic and sweet",
    colors: NAIL_TEMPLATE_PALETTES[1]!,
  },
  {
    id: "emerald-luxury",
    name: "Emerald Luxury",
    description: "Elegant sage and emerald tones for high-end boutique look",
    colors: NAIL_TEMPLATE_PALETTES[2]!,
  },
  {
    id: "midnight-navy",
    name: "Midnight Navy",
    description: "Deep, mysterious royal blue tones, modern and professional",
    colors: NAIL_TEMPLATE_PALETTES[3]!,
  },
  {
    id: "sunset-lilac",
    name: "Sunset Lilac",
    description: "Premium lavender tones, artistic and creative",
    colors: NAIL_TEMPLATE_PALETTES[4]!,
  },
];
