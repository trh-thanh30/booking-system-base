export type Mode = "with" | "without";
export type BadgeVariant = "success" | "warning" | "danger" | "info";

export interface StepData {
  stepNumber: number;
  time: string; // "09:00"
  type: string; // "Booking created"
  badge: string; // "Deposit paid"
  badgeVariant: BadgeVariant;
  title: string; // "Haircut booked · Alex"
  meta: string; // "$15 deposit collected at checkout"
}

export interface OutcomeData {
  variant: "success" | "danger";
  icon: "check" | "x";
  title: string;
  sub: string;
}
