import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import {
  AdminPage,
  AdminPageHeader,
} from "@/src/components/common/admin/admin-page";
import { BookingsTable } from "@/src/views/admin/bookings/components/bookings-table";

export function BookingsView() {
  const t = useTranslations("Bookings");

  return (
    <AdminPage>
      <AdminPageHeader
        actions={
          <Button variant="secondary">
            <Download className="size-4" />
            {t("export")}
          </Button>
        }
        description={t("description")}
        eyebrow={t("eyebrow")}
        title={t("title")}
      />
      <BookingsTable />
    </AdminPage>
  );
}
