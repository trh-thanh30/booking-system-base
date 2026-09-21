export type StepId = "1" | "2" | "3" | "4";

export interface StepMeta {
  id: StepId;
  number: string; // "01"
  title: string; // "Create services"
  desc: string; // "Add service names..."
  icon: "list" | "calendar" | "link" | "grid";
}

export interface StaffChip {
  id: string;
  name: string;
}

export interface BookingSeed {
  id: string;
  time: string;
  name: string;
  svc: string;
  status: string;
  amount: number;
  _new?: boolean;
}
