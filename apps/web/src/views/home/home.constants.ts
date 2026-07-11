import { WebsiteTemplate } from "./home.types";
import {
  Users,
  CreditCard,
  Bell,
  Globe,
  Clock,
  CalendarCheck,
  CalendarDays,
  BarChart3,
  HeartPulse,
  Dumbbell,
  Scissors,
  GraduationCap,
  Wrench,
  HelpCircle,
  BookOpen,
  MessageCircle,
  CalendarX,
  UserX,
  MessagesSquare,
  CalendarClock,
} from "lucide-react";

export const PAIN_POINTS = [
  {
    title: "Double-booked slots",
    desc: "Two customers can end up choosing the same time because availability is not updated in one place.",
    icon: CalendarX,
    tone: "red" as const,
  },
  {
    title: "No-shows without deposits",
    desc: "Customers forget appointments more often when there is no deposit, confirmation or automatic reminder.",
    icon: UserX,
    tone: "amber" as const,
  },
  {
    title: "Too many manual messages",
    desc: "You spend hours asking for preferred times, confirming details and updating schedules manually.",
    icon: MessagesSquare,
    tone: "blue" as const,
  },
  {
    title: "Staff schedule conflicts",
    desc: "Without staff availability synced, customers may book times that your team cannot actually serve.",
    icon: CalendarClock,
    tone: "violet" as const,
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Create services",
    desc: "Add service names, prices, durations and assign the right staff.",
    icon: "ListChecks",
    mockupType: "services",
  },
  {
    step: "02",
    title: "Set availability & rules",
    desc: "Define working hours, booking rules, deposit policy and available time slots.",
    icon: "CalendarClock",
    mockupType: "availability",
  },
  {
    step: "03",
    title: "Share booking page",
    desc: "Publish your booking link on your website, social bio, QR code or marketplace listing.",
    icon: "Link",
    mockupType: "share",
  },
  {
    step: "04",
    title: "Accept & manage bookings",
    desc: "Customers book online while appointments, payments and reminders sync to your dashboard.",
    icon: "LayoutDashboard",
    mockupType: "manage",
  },
];

export const CORE_FEATURES = [
  {
    title: "Branded Booking Page",
    desc: "Launch a mobile booking page with your logo, brand colors, and custom domain.",
    icon: Globe,
    pills: ["Mobile Ready", "Custom Domain"],
  },
  {
    title: "Smart Availability",
    desc: "Instantly display open slots based on staff shifts, buffer times, and holidays.",
    icon: Clock,
    pills: ["Live Slots", "Buffer Time"],
  },
  {
    title: "Staff Scheduling",
    desc: "Manage hours, shifts, time-offs, and custom permissions for each team member.",
    icon: Users,
    pills: ["Staff Shifts", "Custom Roles"],
  },
  {
    title: "Deposits & Payments",
    desc: "Collect payments or upfront deposits at checkout to secure bookings and stop no-shows.",
    icon: CreditCard,
    pills: ["Upfront Deposits", "Instant Checkout"],
  },
  {
    title: "Automated Reminders",
    desc: "Trigger SMS and email confirmations, pre-appointment reminders, and follow-ups.",
    icon: Bell,
    pills: ["SMS & Email", "Reminders Queue"],
  },
  {
    title: "Reports & Insights",
    desc: "Track revenue, booking history, cancellation rates, and staff productivity.",
    icon: BarChart3,
    pills: ["Revenue Tracking", "Staff Performance"],
  },
];

export const PRICING_PLANS = [
  {
    name: "Starter",
    price: "19",
    desc: "For solo providers and small teams launching their first booking site.",
    features: [
      "1 location",
      "Up to 3 staff members",
      "Unlimited services",
      "Branded booking page",
      "Email notifications",
      "Basic analytics",
    ],
    cta: "Start 14-day trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "49",
    desc: "For growing service teams that need deposits, reminders and customer history.",
    features: [
      "2 locations / branches",
      "Up to 15 staff members",
      "Custom domain support",
      "Online payments & deposits",
      "SMS & email reminders",
      "Customer CRM & booking history",
      "Advanced revenue reports",
    ],
    cta: "Start 14-day trial",
    popular: true,
  },
  {
    name: "Business",
    price: "99",
    desc: "For multi-location teams that need advanced control, integrations and support.",
    features: [
      "Unlimited locations",
      "Unlimited staff members",
      "Advanced localization options",
      "API & webhooks access",
      "Custom styling options",
      "Priority support",
      "Custom support agreement",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

export const FAQ_GROUPS = [
  {
    title: "Product & booking",
    items: [
      {
        id: "coding-skills",
        question: "Do I need coding skills to create my booking page?",
        answer:
          "No. You can start from a website template, customize your services, branding and booking rules, then publish your booking page without coding.",
      },
      {
        id: "reduce-no-shows",
        question: "How does BookingBase help reduce no-shows?",
        answer:
          "BookingBase can help reduce no-shows with online deposits, booking confirmations and automated SMS or email reminders before appointments.",
      },
      {
        id: "download-app",
        question: "Do customers need to download an app to book?",
        answer:
          "No. Customers can book from your public booking page using a browser on mobile, tablet or desktop.",
      },
      {
        id: "multi-location",
        question: "Can I manage multiple locations and staff shifts?",
        answer:
          "Yes. Depending on your plan, you can manage locations, staff availability, service assignments and shift schedules from your dashboard.",
      },
      {
        id: "custom-domain",
        question: "Can I use my own custom domain?",
        answer:
          "Yes. Custom domain support is available on selected plans so you can publish your booking page under your own brand.",
      },
    ],
  },
  {
    title: "Trial & Early Access",
    items: [
      {
        id: "trial-card",
        question: "Do I need a credit card for the 14-day trial?",
        answer:
          "No. You can start the 14-day trial without entering a credit card, and trial accounts will not be auto-charged.",
      },
      {
        id: "after-trial",
        question: "What happens after the 14-day trial?",
        answer:
          "After the trial, you can choose a paid plan, contact us for the right setup, or let the trial end without being auto-charged.",
      },
      {
        id: "feedback-rewards",
        question: "What feedback may qualify for Early Access rewards?",
        answer:
          "Helpful feedback may include workflow improvement ideas, bug reports, integration requests or detailed notes about how your service business handles bookings.",
      },
      {
        id: "rewards-guaranteed",
        question: "Are Early Access rewards guaranteed?",
        answer:
          "No. Rewards are reviewed case by case and are not guaranteed. Helpful feedback may qualify for early user perks such as extra trial time or future plan discounts.",
      },
      {
        id: "submit-feedback",
        question: "Where can I submit feedback?",
        answer:
          "You can send feedback by email at feedback@bookingbase.com or use the feedback link inside the Early Access section.",
      },
    ],
  },
];

export const NAV_ITEMS = [
  {
    label: "Features",
    href: "#features",
    type: "dropdown",
    items: [
      {
        label: "Online booking",
        description: "Let customers book services online 24/7.",
        href: "#features",
        icon: CalendarCheck,
      },
      {
        label: "Staff scheduling",
        description: "Manage staff availability and working hours.",
        href: "#features",
        icon: Users,
      },
      {
        label: "Calendar management",
        description: "Avoid double bookings with smart availability.",
        href: "#features",
        icon: CalendarDays,
      },
      {
        label: "Payments & deposits",
        description: "Accept deposits or full payments during booking.",
        href: "#deposits-reminders", // links to no-show protection deposits section
        icon: CreditCard,
      },
      {
        label: "Automated reminders",
        description: "Send reminders to reduce no-shows.",
        href: "#deposits-reminders", // links to no-show protection reminders section
        icon: Bell,
      },
      {
        label: "Reports & analytics",
        description: "Track bookings, revenue and business performance.",
        href: "#features",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Industries",
    href: "#industries", // links to the supported industries section
    type: "dropdown",
    items: [
      {
        label: "Beauty & Wellness",
        href: "#industries",
        icon: Scissors,
      },
      {
        label: "Healthcare",
        href: "#industries",
        icon: HeartPulse,
      },
      {
        label: "Fitness & Yoga",
        href: "#industries",
        icon: Dumbbell,
      },
      {
        label: "Education",
        href: "#industries",
        icon: GraduationCap,
      },
      {
        label: "Repair Services",
        href: "#industries",
        icon: Wrench,
      },
      {
        label: "All industries",
        href: "#industries",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Pricing",
    href: "#pricing",
    type: "link",
  },
  {
    label: "Resources",
    href: "#faq",
    type: "dropdown",
    items: [
      {
        label: "Help Center",
        href: "#faq",
        icon: HelpCircle,
      },
      {
        label: "Blog",
        href: "#faq",
        icon: BookOpen,
      },
      {
        label: "How it works",
        href: "#how-it-works",
        icon: CalendarCheck,
      },
      {
        label: "FAQ",
        href: "#faq",
        icon: MessageCircle,
      },
    ],
  },
];

export const INDUSTRIES = [
  {
    id: "beauty",
    name: "Beauty & Wellness",
    desc: "Manage staff availability, deposits and appointment reminders for salons, spas and personal care services.",
    icon: Scissors,
    image: "/images/landing/industries/beauty-wellness.jpg",
    chips: ["Staff selection", "Deposits", "Reminders"],
    cta: "See workflow",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    desc: "Let patients choose specialists, submit intake details and receive appointment confirmations.",
    icon: HeartPulse,
    image: "/images/landing/industries/healthcare.jpg",
    chips: ["Patient intake", "Specialist booking", "Confirmations"],
    cta: "See workflow",
  },
  {
    id: "fitness",
    name: "Fitness & Yoga",
    desc: "Handle class schedules, trainer assignments, capacity limits and recurring sessions.",
    icon: Dumbbell,
    image: "/images/landing/industries/fitness-yoga.jpg",
    chips: ["Class capacity", "Trainer selection", "Recurring sessions"],
    cta: "See workflow",
  },
  {
    id: "consulting",
    name: "Consultants",
    desc: "Offer paid sessions, meeting links and pre-call questions for advisory services.",
    icon: Users,
    image: "/images/landing/industries/consultants.jpg",
    chips: ["Meeting links", "Paid sessions", "Pre-call questions"],
    cta: "See workflow",
  },
  {
    id: "education",
    name: "Education",
    desc: "Schedule lessons with teacher selection, student forms and course-based sessions.",
    icon: GraduationCap,
    image: "/images/landing/industries/education.jpg",
    chips: ["Teacher selector", "Course sessions", "Student forms"],
    cta: "See workflow",
  },
  {
    id: "repair",
    name: "Repair Services",
    desc: "Collect service requests, customer addresses and preferred time slots for local repair teams.",
    icon: Wrench,
    image: "/images/landing/industries/repair-services.jpg",
    chips: ["Address fields", "Service requests", "Technician assignment"],
    cta: "See workflow",
  },
];

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    id: "beauty",
    templateName: "Beauty Salon Website",
    description: "For salons, spas, barbers, nails and personal care services.",
    icon: Scissors,
    chips: ["Hero + services", "Staff section", "Booking CTA"],
    businessName: "Lumière Spa & Beauty",
    heroTagline: "Premium spa treatments for busy professionals",
    heroSubtitle: "Book massages, facials and beauty care online in minutes.",
    customerCta: "Book appointment",
    avatar: "L",
    category: "Spa & Beauty",
    services: [
      { name: "Hot Stone Massage", price: "$65.00", duration: "60 mins" },
      { name: "Deep Cleansing Facial", price: "$85.00", duration: "75 mins" },
      { name: "Manicure Care", price: "$35.00", duration: "45 mins" },
    ],
    trustPoints: [
      "Verified specialists",
      "Deposit available",
      "Reminders queued",
    ],
    review: "Easy to book and the reminder was helpful.",
  },
  {
    id: "healthcare",
    templateName: "Clinic Appointment Website",
    description:
      "For clinics, dental offices, therapists and private healthcare providers.",
    icon: HeartPulse,
    chips: ["Provider profiles", "Intake form", "Appointment CTA"],
    businessName: "BrightCare Clinic",
    heroTagline: "Book trusted care with verified specialists",
    heroSubtitle: "Schedule dental, physio, and therapy appointments online.",
    customerCta: "Schedule visit",
    avatar: "B",
    category: "Healthcare",
    services: [
      { name: "General Dental Checkup", price: "$80.00", duration: "30 mins" },
      { name: "Therapy Session", price: "$120.00", duration: "50 mins" },
      { name: "Physio Consultation", price: "$90.00", duration: "45 mins" },
    ],
    trustPoints: [
      "Intake form ready",
      "Specialist selector",
      "Appointment reminders",
    ],
    review: "Very professional website and simple booking flow.",
  },
  {
    id: "fitness",
    templateName: "Fitness Class Website",
    description: "For yoga studios, gyms, personal trainers and group classes.",
    icon: Dumbbell,
    chips: ["Class schedule", "Trainer section", "Capacity booking"],
    businessName: "Pulse Yoga Studio",
    heroTagline: "Reserve classes and private training sessions online",
    heroSubtitle: "Join yoga flow, strength training, and mobility sessions.",
    customerCta: "Book a class",
    avatar: "P",
    category: "Fitness & Yoga",
    services: [
      { name: "Vinyasa Flow Class", price: "$25.00", duration: "60 mins" },
      { name: "Personal Training", price: "$75.00", duration: "60 mins" },
      { name: "Mobility Session", price: "$30.00", duration: "45 mins" },
    ],
    trustPoints: [
      "Class capacity limit",
      "Trainer selection",
      "Recurring options",
    ],
    review: "Love the online schedule, booking a spot takes 10 seconds.",
  },
  {
    id: "consulting",
    templateName: "Consulting Booking Website",
    description:
      "For consultants, coaches, advisors and professional services.",
    icon: Users,
    chips: ["Service packages", "Meeting CTA", "Client form"],
    businessName: "Northstar Advisory",
    heroTagline: "Book strategy sessions with professional consultants",
    heroSubtitle: "Get legal, financial, and business growth advisory.",
    customerCta: "Book consultation",
    avatar: "N",
    category: "Consulting",
    services: [
      { name: "1-on-1 Strategy Call", price: "$150.00", duration: "45 mins" },
      { name: "Legal Advisory Session", price: "$200.00", duration: "60 mins" },
      { name: "Financial Planning", price: "$120.00", duration: "45 mins" },
    ],
    trustPoints: [
      "Pre-session questions",
      "Meeting link sync",
      "Deposit option",
    ],
    review: "Clean site. The automated calendar sync is perfect.",
  },
  {
    id: "education",
    templateName: "Tutoring Website",
    description:
      "For tutors, language schools, music classes and online lessons.",
    icon: GraduationCap,
    chips: ["Course blocks", "Teacher profiles", "Student form"],
    businessName: "BrightPath Tutoring",
    heroTagline: "Schedule lessons with the right teacher",
    heroSubtitle: "Private math tutoring, language classes, and music lessons.",
    customerCta: "Book a lesson",
    avatar: "T",
    category: "Education",
    services: [
      { name: "1-on-1 Math Tutoring", price: "$45.00", duration: "60 mins" },
      { name: "Language Class", price: "$35.00", duration: "45 mins" },
      { name: "Music Lesson", price: "$50.00", duration: "60 mins" },
    ],
    trustPoints: [
      "Student details form",
      "Teacher selector",
      "Course session blocks",
    ],
    review: "Highly recommend. Booking lessons for my kids is so easy.",
  },
  {
    id: "repair",
    templateName: "Home Service Website",
    description:
      "For repair, cleaning, handyman, locksmith and local service teams.",
    icon: Wrench,
    chips: ["Service request", "Address form", "Technician CTA"],
    businessName: "FixPro Home Services",
    heroTagline: "Book local repair and home services online",
    heroSubtitle: "Get plumbing, AC maintenance, and home cleaning fast.",
    customerCta: "Request service",
    avatar: "F",
    category: "Home Services",
    services: [
      { name: "AC Maintenance Service", price: "$90.00", duration: "60 mins" },
      { name: "General Plumbing Repair", price: "$70.00", duration: "45 mins" },
      { name: "Deep Home Cleaning", price: "$120.00", duration: "120 mins" },
    ],
    trustPoints: [
      "Service details upload",
      "Address inputs",
      "Technician assignment",
    ],
    review: "Professional booking. The tech showed up exactly on time.",
  },
];

export const BOOKING_CHANNELS = [
  {
    title: "Direct Booking Link",
    description:
      "Your own dedicated, white-labeled page address to send to customers or link in emails.",
    badge: "bookingbase.com/your-brand",
  },
  {
    title: "Instant QR Code",
    description:
      "Print and display QR codes on storefront windows, counters, brochures, or business cards.",
    badge: "Scan to Self-Book",
  },
  {
    title: "Website Embed Widget",
    description:
      "Integrate a beautiful booking calendar widget or overlay button on your existing site.",
    badge: "HTML/React Snippet",
  },
  {
    title: "Social Media Bios",
    description:
      "Add your booking link directly to Instagram, Facebook, TikTok, or Google Business.",
    badge: "Bio Integration",
  },
];

export const MARKETPLACE_PROVIDERS = [
  {
    name: "Glow & Co. Salon",
    initials: "GC",
    category: "Beauty",
    status: "Verified",
    desc: "Premium hair styling, manicures and facial therapies.",
    location: "London, UK",
    price: "Services from $25",
    availability: "Available today",
  },
  {
    name: "Dr. Sarah's Dental",
    initials: "DS",
    category: "Healthcare",
    status: "Verified",
    desc: "General dentistry, cleanings and emergency oral care.",
    location: "Seattle, US",
    price: "Services from $80",
    availability: "Next opening today",
  },
  {
    name: "Apex Fitness Studio",
    initials: "AF",
    category: "Fitness",
    status: "New",
    desc: "1-on-1 personal training, strength coaching and yoga.",
    location: "Sydney, AU",
    price: "Services from $45",
    availability: "Classes this week",
  },
  {
    name: "Zenith Coaching",
    initials: "ZC",
    category: "Consulting",
    status: "Verified",
    desc: "Business strategy, legal advisory and growth coaching.",
    location: "New York, US",
    price: "Services from $120",
    availability: "Online sessions",
  },
  {
    name: "Apex Code Academy",
    initials: "AC",
    category: "Education",
    status: "Early Access",
    desc: "Learn React, Next.js and Node.js with 1-on-1 tutoring.",
    location: "Online / Remote",
    price: "Services from $35",
    availability: "Remote lessons",
  },
  {
    name: "Pro Fixit Handyman",
    initials: "PF",
    category: "Repair",
    status: "Verified",
    desc: "Fast home repair, plumbing fixes and door installations.",
    location: "Boston, US",
    price: "Services from $50",
    availability: "Home visits",
  },
];

export const COLOR_SWATCHES = [
  { name: "brand-blue", class: "bg-brand-blue", label: "Blue" },
  { name: "emerald", class: "bg-[#10b981]", label: "Emerald" },
  { name: "violet", class: "bg-[#7c3aed]", label: "Violet" },
  { name: "rose", class: "bg-[#ec4899]", label: "Pink" },
  { name: "amber", class: "bg-[#f59e0b]", label: "Amber" },
];

export const TYPOGRAPHY_PRESETS = [
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Manrope", value: "'Manrope', sans-serif" },
  { name: "Plus Jakarta", value: "'Plus Jakarta Sans', sans-serif" },
];
