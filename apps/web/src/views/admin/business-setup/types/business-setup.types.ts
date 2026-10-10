import type {
  BookingTemplateId,
  CreateServiceInput,
  UpdateBusinessWorkingHoursInput,
} from "@repo/shared";

export type SetupAction =
  | { type: "hours"; input: UpdateBusinessWorkingHoursInput }
  | { type: "service"; input: CreateServiceInput | null }
  | {
      type: "services";
      items: SetupServiceInput[];
      onCreated: (key: number) => void;
    }
  | { type: "template"; id: BookingTemplateId }
  | { type: "skip" };

export type SetupServiceInput = { key: number; input: CreateServiceInput };
export type ServiceDraft = {
  key: number;
  name: string;
  duration: string;
  price: string;
  currency: string;
  saved: boolean;
};
