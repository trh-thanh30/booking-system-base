import type { StepData, OutcomeData } from "./NoShowSection.types";

export const STEPS_WITH: StepData[] = [
  {
    stepNumber: 1,
    time: "09:00",
    type: "Booking created",
    badge: "Deposit paid",
    badgeVariant: "success",
    title: "Haircut booked · Alex",
    meta: "$15 deposit collected at checkout",
  },
  {
    stepNumber: 2,
    time: "11:00",
    type: "Reminder scheduled",
    badge: "Reminder sent",
    badgeVariant: "info",
    title: "SMS & email reminder prepared",
    meta: "Sent 2 hours before appointment automatically",
  },
  {
    stepNumber: 3,
    time: "12:30",
    type: "Customer confirmed",
    badge: "Confirmed",
    badgeVariant: "success",
    title: "Alex confirmed they are coming",
    meta: "One-tap confirmation via SMS · no manual follow-up",
  },
  {
    stepNumber: 4,
    time: "13:00",
    type: "Appointment done",
    badge: "Completed",
    badgeVariant: "success",
    title: "Customer arrived on time",
    meta: "Booking marked complete · review request sent",
  },
];

export const STEPS_WITHOUT: StepData[] = [
  {
    stepNumber: 1,
    time: "09:00",
    type: "Booking created",
    badge: "No deposit",
    badgeVariant: "warning",
    title: "Haircut booked · Alex",
    meta: "No payment collected · slot not secured",
  },
  {
    stepNumber: 2,
    time: "11:00",
    type: "No reminder",
    badge: "Manual only",
    badgeVariant: "warning",
    title: "Staff forgot to send",
    meta: "No automated follow-up · relied on memory",
  },
  {
    stepNumber: 3,
    time: "12:30",
    type: "Customer silent",
    badge: "No response",
    badgeVariant: "danger",
    title: "2 missed calls · no reply",
    meta: "Could not confirm attendance",
  },
  {
    stepNumber: 4,
    time: "13:00",
    type: "No-show",
    badge: "Slot wasted",
    badgeVariant: "danger",
    title: "⚠ Customer did not arrive",
    meta: "Lost revenue · team idle for 45 minutes",
  },
];

export const OUTCOME_WITH: OutcomeData = {
  variant: "success",
  icon: "check",
  title: "No-show avoided",
  sub: "87% reduction in no-shows · ~$640 saved per month",
};

export const OUTCOME_WITHOUT: OutcomeData = {
  variant: "danger",
  icon: "x",
  title: "No-show happened",
  sub: "Up to 23% no-show rate · ~$480 lost per month",
};
