import {
  CreditCard,
  Video,
  Star,
  HelpCircle,
  Palette,
  Globe,
  FileCheck,
  Package,
  Layout,
  FileText,
  Languages,
  ShieldCheck,
  MessageSquare,
  CalendarDays,
  Clock,
  CalendarSync,
  Repeat,
  WalletCards,
  Users,
  MapPin,
  ChartNoAxesCombined,
  CalendarClock,
  Bell,
  UserRound,
} from "lucide-react";

export const FEATURE_GROUPS = [
  { id: "core", label: "Core Features" },
  { id: "business", label: "Business Essentials" },
  { id: "client", label: "Client Experience" },
] as const;

export const FEATURE_PREVIEW_LIMIT = 8;
export const FEATURE_MOBILE_PREVIEW_LIMIT = 4;

export const SQUIRCLE_FEATURES = [
  {
    icon: CreditCard,
    title: "Accept payments",
    group: "core",
    description:
      "You can monetize your bookings through our Stripe integration.",
  },
  {
    icon: Video,
    title: "Video Introductions",
    group: "client",
    description:
      "Welcome clients with a personal 30s greeting or salon tour before booking.",
  },
  {
    icon: Star,
    title: "Live Social Proof",
    group: "client",
    description:
      "Display verified 5-star reviews and client quotes directly on your booking page.",
  },
  {
    icon: HelpCircle,
    title: "FAQ Widgets",
    group: "client",
    description:
      "Answer questions about deposits, parking, and prep upfront to eliminate support calls.",
  },
  {
    icon: Palette,
    title: "Brand Themes & Colors",
    group: "business",
    description:
      "Tailor color palettes, dark mode, and typography to match your salon aesthetic.",
  },
  {
    icon: Globe,
    title: "Custom Domain",
    group: "business",
    description:
      "Use your own branded URL (book.yoursalon.com) with automatic SSL included.",
  },
  {
    icon: FileCheck,
    title: "Intake & Waivers",
    group: "business",
    description:
      "Collect consultation questionnaires and skin patch test waivers before arrival.",
  },
  {
    icon: Package,
    title: "Packages & Passes",
    group: "core",
    description:
      "Sell multi-session bundles, prepaid passes, and recurring membership tiers.",
  },
  {
    icon: Layout,
    title: "Flexible Embeds",
    group: "core",
    description:
      "Embed as an inline calendar, sticky floating book button, or button popup modal.",
  },
  {
    icon: FileText,
    title: "Document Sharing",
    group: "client",
    description:
      "Automatically share aftercare guides, color lookbooks, and prep instructions.",
  },
  {
    icon: Languages,
    title: "Multi-Language",
    group: "client",
    description:
      "Localized booking flows in Vietnamese and English out of the box.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    group: "business",
    description:
      "GDPR-conscious client data handling with PCI-compliant card authorizations.",
  },
  {
    icon: MessageSquare,
    title: "Custom Notifications",
    group: "business",
    description:
      "Craft personalized SMS and Zalo reminder messages in your unique brand voice.",
  },
  {
    icon: CalendarDays,
    title: "Online Booking",
    group: "core",
    description:
      "Let clients choose a service, provider, and available appointment time from your booking page.",
  },
  {
    icon: Clock,
    title: "Smart Availability",
    group: "core",
    description:
      "Set working hours, minimum notice, and buffer times to keep your schedule under control.",
  },
  {
    icon: CalendarSync,
    title: "Calendar Sync",
    group: "core",
    description:
      "Keep connected calendars aligned with your bookings and avoid overlapping appointments.",
  },
  {
    icon: Repeat,
    title: "Recurring Appointments",
    group: "core",
    description:
      "Schedule repeat visits and treatment series without creating every appointment separately.",
  },
  {
    icon: WalletCards,
    title: "Booking Deposits",
    group: "core",
    description:
      "Collect an upfront deposit when clients book to protect valuable appointment slots.",
  },
  {
    icon: Users,
    title: "Team Management",
    group: "business",
    description:
      "Organize staff schedules, service assignments, and access permissions in one place.",
  },
  {
    icon: MapPin,
    title: "Multiple Locations",
    group: "business",
    description:
      "Manage appointments and team availability across your business locations.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Business Reports",
    group: "business",
    description:
      "Review revenue, booking trends, and staff performance to understand how your business is doing.",
  },
  {
    icon: CalendarClock,
    title: "Self-Service Rescheduling",
    group: "client",
    description:
      "Let clients move their appointments to another available slot within your booking rules.",
  },
  {
    icon: Bell,
    title: "Appointment Reminders",
    group: "client",
    description:
      "Keep clients informed with booking confirmations and reminders before their visit.",
  },
  {
    icon: UserRound,
    title: "Client Profiles",
    group: "client",
    description:
      "Keep appointment history, preferences, and service notes together for a more personal experience.",
  },
];
