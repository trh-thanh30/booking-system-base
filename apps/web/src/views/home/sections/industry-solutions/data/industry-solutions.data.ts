import type { IndustryItem } from "../types/industry-solutions.types";

export const INDUSTRIES_DATA: IndustryItem[] = [
  {
    id: "hair",
    label: "Hair Salons",
    badge: "HAIR SALON & COLOR STUDIOS",
    title:
      "Automate chair rotations, processing buffer times & commission splits.",
    description:
      "Designed specifically for high-volume salons and independent colorists. Let clients book complex multi-step treatments with built-in gap times to take walk-ins while color sets.",
    image: "/images/landing/industry-solutions/hair-salon.webp",
    highlights: [
      {
        title: "Processing Buffer Times",
        description:
          "Automatically open slots for blowout or quick trims while a client's balayage color processes.",
      },
      {
        title: "Station & Chair Management",
        description:
          "Prevent double-booking washing stations and hot styling chairs with resource allocation rules.",
      },
      {
        title: "Tiered Stylist Pricing & Commissions",
        description:
          "Set independent pricing and commission splits automatically based on junior vs. senior stylist levels.",
      },
    ],
    mockup: {
      businessName: "Lumière Hair Studio",
      businessType: "Modern Salon & Color Lab",
      avatarInitials: "LH",
      serviceName: "Full Balayage & Glaze",
      servicePrice: "$185.00",
      duration: "150 mins (incl. 45m processing)",
      providerName: "Sarah Jenkins",
      providerRole: "Senior Master Colorist",
      specialDetailLabel: "Chair & Basin Assigned",
      specialDetailValue: "Station 3 • Wash Basin B",
      addonName: "Bond Repair Treatment",
      addonPrice: "+$35.00",
      depositRequired: "$50.00 deposit required",
    },
  },
  {
    id: "nails",
    label: "Nails & Lashes",
    badge: "NAILS, LASH & BROW ATELIERS",
    title: "Visual menu add-ons, shape tiers and fast station turnaround.",
    description:
      "Give clients visual lookbooks to pick nail length, shaping, gel art tiers, and lash extensions before they sit in the chair—eliminating checkout surprise and timing delays.",
    image: "/images/landing/industry-solutions/nails-lash.webp",
    highlights: [
      {
        title: "Visual Lookbook & Art Tier Selection",
        description:
          "Clients pick nail art complexity (Chrome, 3D Charms, French) upfront with exact time estimates.",
      },
      {
        title: "Combo Service Booking",
        description:
          "Let clients book simultaneous mani-pedi or lash + brow appointments across two technicians.",
      },
      {
        title: "Automated Fill-in Reminders",
        description:
          "Prompt clients automatically at 2 and 3 weeks for lash fills or gel maintenance before nails grow out.",
      },
    ],
    mockup: {
      businessName: "Velvet Nail & Lash Bar",
      businessType: "Boutique Beauty Bar",
      avatarInitials: "VN",
      serviceName: "Apres Gel-X Full Set",
      servicePrice: "$85.00",
      duration: "75 mins",
      providerName: "Chloe Nguyen",
      providerRole: "Lead Nail Artist",
      specialDetailLabel: "Shape & Art Level",
      specialDetailValue: "Medium Almond • Tier 2 Chrome",
      addonName: "Cuticle Care & Scrub",
      addonPrice: "+$18.00",
      depositRequired: "$25.00 deposit required",
    },
  },
  {
    id: "spa",
    label: "Spas & Wellness",
    badge: "DAY SPAS, MASSAGE & RETREATS",
    title: "Room assignment, therapist preferences and intake health forms.",
    description:
      "Manage private treatment suites, sauna rotations, and massage rooms automatically. Collect intake questionnaires and health allergy disclosures prior to arrival.",
    image: "/images/landing/industry-solutions/spa-wellness.webp",
    highlights: [
      {
        title: "Private Room & Suite Allocation",
        description:
          "Link appointments to specialized private rooms (Aromatherapy Suite, Vichy Shower, Sauna Cabins).",
      },
      {
        title: "Digital Health Intake Forms",
        description:
          "Clients complete allergy, pressure preference, and injury disclosures digitally before check-in.",
      },
      {
        title: "Custom Membership & Package Credits",
        description:
          "Sell 5-pack massage packages and monthly wellness subscriptions that redeem automatically at checkout.",
      },
    ],
    mockup: {
      businessName: "Aura Wellness & Spa",
      businessType: "Holistic Sanctuary",
      avatarInitials: "AW",
      serviceName: "Hot Stone Therapeutic Massage",
      servicePrice: "$145.00",
      duration: "90 mins",
      providerName: "David Vance, LMT",
      providerRole: "Licensed Massage Therapist",
      specialDetailLabel: "Suite & Aroma",
      specialDetailValue: "Tranquility Suite 4 • Eucalyptus",
      addonName: "Deep Heat Herbal Compress",
      addonPrice: "+$25.00",
      depositRequired: "100% card guarantee on file",
    },
  },
  {
    id: "clinics",
    label: "Clinics & Aesthetics",
    badge: "MEDICAL AESTHETICS & DERMATOLOGY",
    title:
      "Practitioner scheduling, consent signing and clinical treatment logs.",
    description:
      "Enterprise-grade reliability for medical aesthetics, skin clinics, and cosmetic injectors. Secure patient notes, repeat appointment sequences, and strict deposit protection.",
    image: "/images/landing/industry-solutions/clinics.webp",
    highlights: [
      {
        title: "Multi-Session Treatment Plans",
        description:
          "Schedule recurring series (e.g. 4-session Laser or Microneedling spaced 4 weeks apart) in one click.",
      },
      {
        title: "Digital Consent & Before/After Vault",
        description:
          "Store signed procedure consents and private clinical progress photos directly in the client file.",
      },
      {
        title: "Deposit Protection for High-Value Slots",
        description:
          "Secure non-refundable consult deposits with automated card pre-authorization to eliminate empty doctor hours.",
      },
    ],
    mockup: {
      businessName: "Apex Medical Aesthetics",
      businessType: "Skin & Laser Clinic",
      avatarInitials: "AM",
      serviceName: "Skin Renewal Laser & Consult",
      servicePrice: "$280.00",
      duration: "60 mins",
      providerName: "Dr. Elena Vance, MD",
      providerRole: "Cosmetic Dermatologist",
      specialDetailLabel: "Clinical Equipment",
      specialDetailValue: "Laser Room 2 • Device B",
      addonName: "Hydrating Recovery Mask",
      addonPrice: "+$45.00",
      depositRequired: "$100.00 consult deposit",
    },
  },
  {
    id: "barber",
    label: "Barbershops & Studios",
    badge: "BARBERSHOPS & INDEPENDENT PROS",
    title: "Live walk-in waitlists, 15-minute fades and chair rental payouts.",
    description:
      "Keep barber chairs full all day with combined appointment bookings and live online walk-in queueing. Allow independent barbers to track their own payouts and tips seamlessly.",
    image: "/images/landing/industry-solutions/barbershop.webp",
    highlights: [
      {
        title: "Hybrid Booking & Live Waitlist",
        description:
          "Blend online reservations with real-time digital walk-in queueing so chairs never sit empty.",
      },
      {
        title: "Fast 15/30-Minute Time Slots",
        description:
          "Tight slot scheduling optimized for rapid fades, beard trims, and hot towel line-ups.",
      },
      {
        title: "Individual Barber Accounts & Cashout",
        description:
          "Each barber has their own login, calendar, tip tracker, and daily booth rental ledger.",
      },
    ],
    mockup: {
      businessName: "Iron & Blade Barbers",
      businessType: "Classic Grooming Club",
      avatarInitials: "IB",
      serviceName: "Executive Cut & Hot Towel Shave",
      servicePrice: "$60.00",
      duration: "45 mins",
      providerName: "Marcus Sterling",
      providerRole: "Master Barber",
      specialDetailLabel: "Queue Position",
      specialDetailValue: "Chair 2 • On Time",
      addonName: "Charcoal Face Mask",
      addonPrice: "+$15.00",
      depositRequired: "Card on file (no upfront fee)",
    },
  },
];
