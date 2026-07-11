import {
  Globe,
  Clock,
  Users,
  CreditCard,
  Bell,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import type { FeatureMeta, BookingItem, StaffSlotMeta } from "./features.types";

export const FEATURE_ITEMS: FeatureMeta[] = [
  {
    id: "bookings",
    title: "Live Bookings",
    desc: "Today's calendar with real-time updates, stats and staff availability.",
    icon: CalendarDays,
    pills: ["Real-time", "Calendar"],
  },
  {
    id: "page",
    title: "Branded Booking Page",
    desc: "Launch a mobile booking page with your logo, brand colors, and custom domain.",
    icon: Globe,
    pills: ["Mobile Ready", "Custom Domain"],
  },
  {
    id: "availability",
    title: "Smart Availability",
    desc: "Instantly display open slots based on staff shifts, buffer times, and holidays.",
    icon: Clock,
    pills: ["Live Slots", "Buffer Time"],
  },
  {
    id: "staff",
    title: "Staff Scheduling",
    desc: "Manage hours, shifts, time-offs, and custom permissions for each team member.",
    icon: Users,
    pills: ["Staff Shifts", "Custom Roles"],
  },
  {
    id: "deposits",
    title: "Deposits & Payments",
    desc: "Collect payments or upfront deposits at checkout to secure bookings and stop no-shows.",
    icon: CreditCard,
    pills: ["Upfront Deposits", "Instant Checkout"],
  },
  {
    id: "reminders",
    title: "Automated Reminders",
    desc: "Trigger SMS and email confirmations, pre-appointment reminders, and follow-ups.",
    icon: Bell,
    pills: ["SMS & Email", "Reminders Queue"],
  },
  {
    id: "reports",
    title: "Reports & Insights",
    desc: "Track revenue, booking history, cancellation rates, and staff productivity.",
    icon: BarChart3,
    pills: ["Revenue Tracking", "Staff Performance"],
  },
];

// PanelAvailability constants
export const AVAILABILITY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const AVAILABILITY_HOURS = [
  "09",
  "10",
  "11",
  "13",
  "14",
  "15",
  "16",
  "17",
];
export const AVAILABILITY_SLOTS = [
  "available",
  "available",
  "buffer",
  "available",
  "available",
  "available",
  "blocked",
  "available",
  "buffer",
  "available",
  "available",
  "available",
  "blocked",
  "available",
  "available",
  "buffer",
  "available",
  "available",
  "available",
  "blocked",
  "available",
  "available",
  "buffer",
  "available",
  "available",
  "available",
  "blocked",
  "available",
  "available",
  "buffer",
  "available",
  "available",
  "available",
  "blocked",
  "available",
  "available",
  "buffer",
  "available",
  "available",
  "available",
];
export const AVAILABILITY_LEGENDS = [
  { label: "Available", color: "bg-emerald-500/20 border-emerald-500/35" },
  { label: "Buffer", color: "bg-amber-500/10 border-amber-500/30" },
  { label: "Blocked", color: "bg-rose-500/10 border-rose-500/20" },
];
export const AVAILABILITY_RULES = [
  { label: "Buffer time", val: "15 min" },
  { label: "Min notice", val: "2 hours" },
  { label: "Max advance", val: "60 days" },
  { label: "Open hours", val: "9:00 — 19:00" },
];

// PanelBookings constants
export const BOOKINGS_INITIAL_DATA: BookingItem[] = [
  {
    id: "1",
    time: "09:00",
    title: "Haircut",
    staff: "Anna",
    meta: "$25 Deposit Paid",
    status: "green",
    statusText: "Confirmed",
  },
  {
    id: "2",
    time: "10:30",
    title: "Dental check",
    staff: "Sarah",
    meta: "Pending Confirm",
    status: "orange",
    statusText: "Pending",
  },
  {
    id: "3",
    time: "14:00",
    title: "Yoga class",
    staff: "Mia",
    meta: "Fully Booked",
    status: "gray",
    statusText: "Booked",
  },
];
export const BOOKINGS_SERVICES = [
  { name: "Massage", price: 60 },
  { name: "Beard trim", price: 15 },
  { name: "Hair color", price: 85 },
  { name: "Facial", price: 70 },
  { name: "Manicure", price: 30 },
  { name: "Styling", price: 45 },
];
export const BOOKINGS_STAFF_NAMES = ["Anna", "Mia", "John"];
export const BOOKINGS_INITIAL_STAFF_SLOTS: StaffSlotMeta[] = [
  { name: "Anna", slots: 6, status: "open" },
  { name: "Mia", slots: 4, status: "open" },
  { name: "John", slots: 5, status: "open" },
];

// PanelBrandedPage constants
export const BRANDED_MOCK_SLOTS = [
  "09:00 — Anna",
  "10:30 — Mia",
  "14:00 — John",
];

// PanelDeposits constants
export const DEPOSIT_TRANSACTIONS = [
  {
    type: "plus",
    title: "Sarah Chen",
    meta: "Haircut · $25 deposit",
    amount: "+$25",
  },
  {
    type: "plus",
    title: "Mike Rivera",
    meta: "Beard trim · $15",
    amount: "+$15",
  },
  {
    type: "minus",
    title: "Anna Park",
    meta: "Refund · cancelled slot",
    amount: "−$20",
  },
];
export const DEPOSIT_DAILY_REVENUE = [40, 65, 55, 80, 70, 95, 50];

// PanelReminders constants
export const REMINDER_STATS = [
  { val: "14", label: "Sent today" },
  { val: "92%", label: "Delivered" },
  { val: "68%", label: "Opened" },
];
export const REMINDERS_QUEUE = [
  {
    type: "Email",
    name: "Lily Tran",
    msg: "Booking confirmation · Haircut · Tomorrow 09:00",
    time: "in 2 min",
  },
  {
    type: "SMS",
    name: "James Lee",
    msg: "Reminder · Massage · Today 16:00",
    time: "in 5 min",
  },
  {
    type: "Email",
    name: "Nina Patel",
    msg: "Follow-up review · Hair color · Yesterday",
    time: "in 12 min",
  },
  {
    type: "SMS",
    name: "Carlos Ruiz",
    msg: "Reminder · Facial · Tomorrow 14:30",
    time: "in 18 min",
  },
];

// PanelReports constants
export const REPORT_KPIS = [
  { label: "Revenue", val: "$4,820", trend: "↑ 18%", trendType: "up" },
  { label: "Bookings", val: "87", trend: "↑ 12%", trendType: "up" },
  { label: "No-show rate", val: "3.2%", trend: "↓ 4.1%", trendType: "down" },
  { label: "Avg booking", val: "$55", trend: "↑ 5%", trendType: "up" },
];
export const REPORT_SERVICES = [
  { name: "Haircut", count: 24, percent: 85 },
  { name: "Hair color", count: 17, percent: 62 },
  { name: "Massage", count: 13, percent: 48 },
  { name: "Beard trim", count: 9, percent: 32 },
];

// PanelStaff constants
export const STAFF_MEMBERS = [
  {
    name: "Anna",
    role: "Senior Stylist",
    initial: "A",
    shift: "09:00 — 17:00",
    timeline: [
      { type: "work", flex: 3 },
      { type: "lunch", flex: 1 },
      { type: "work", flex: 4 },
    ],
  },
  {
    name: "Mia",
    role: "Stylist",
    initial: "M",
    shift: "10:00 — 18:00",
    timeline: [
      { type: "work", flex: 2 },
      { type: "lunch", flex: 1 },
      { type: "work", flex: 5 },
    ],
  },
  {
    name: "John",
    role: "Junior Stylist",
    initial: "J",
    shift: "09:00 — 14:00",
    ptoMsg: "On PTO tomorrow",
    timeline: [
      { type: "work", flex: 3 },
      { type: "lunch", flex: 1 },
      { type: "pto", flex: 2 },
    ],
  },
];
