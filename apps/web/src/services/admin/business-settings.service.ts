import { createBusinessApiClient } from "@/src/lib/admin/api-client";
import { unwrapApiData } from "@repo/shared";
import type {
  BusinessSetupSummary,
  BusinessWorkingHours,
  BookingTemplateCatalog,
  BookingTemplateSelection,
  UpdateBusinessWorkingHoursInput,
  SelectBookingTemplateInput,
} from "@repo/shared";

export function createBusinessSettingsService(businessId: string) {
  const client = createBusinessApiClient(businessId);
  return {
    async getSummary() {
      return unwrapApiData(
        await client.get<BusinessSetupSummary>(
          "/business-settings/setup-summary",
        ),
      );
    },
    async getHours() {
      return unwrapApiData(
        await client.get<BusinessWorkingHours>(
          "/business-settings/working-hours",
        ),
      );
    },
    async getTemplates() {
      return unwrapApiData(
        await client.get<BookingTemplateCatalog>(
          "/business-settings/booking-templates",
        ),
      );
    },
    async saveHours(input: UpdateBusinessWorkingHoursInput) {
      return unwrapApiData(
        await client.put<BusinessWorkingHours>(
          "/business-settings/working-hours",
          input,
        ),
      );
    },
    async selectTemplate(input: SelectBookingTemplateInput) {
      return unwrapApiData(
        await client.put<BookingTemplateSelection>(
          "/business-settings/booking-template",
          input,
        ),
      );
    },
    async skip() {
      return unwrapApiData(
        await client.post<BusinessSetupSummary>("/business-settings/skip"),
      );
    },
    async resume() {
      return unwrapApiData(
        await client.post<BusinessSetupSummary>("/business-settings/resume"),
      );
    },
  };
}
