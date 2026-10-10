import type { BusinessSetupSummary, CreateServiceInput } from "@repo/shared";
import type { SetupServiceInput } from "../types/business-setup.types";

export async function createSetupServices(
  api: {
    createService: (input: CreateServiceInput) => Promise<unknown>;
    getSummary: () => Promise<BusinessSetupSummary>;
  },
  items: SetupServiceInput[],
  onCreated: (key: number) => void,
) {
  for (const item of items) {
    await api.createService({ ...item.input, status: "ACTIVE" });
    onCreated(item.key);
  }
  return api.getSummary();
}
