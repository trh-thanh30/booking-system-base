import type { LucideIcon } from "lucide-react";

export type FeatureTab =
  | "bookings"
  | "page"
  | "availability"
  | "staff"
  | "deposits"
  | "reminders"
  | "reports";

export interface FeatureMeta {
  id: FeatureTab;
  title: string;
  desc: string;
  icon: LucideIcon;
  pills: string[];
}

export interface BookingItem {
  id: string;
  time: string;
  title: string;
  staff: string;
  meta: string;
  status: "green" | "orange" | "gray";
  statusText: string;
  isNew?: boolean;
}

export interface StaffSlotMeta {
  name: string;
  slots: number;
  status: "open" | "full" | "few";
}
