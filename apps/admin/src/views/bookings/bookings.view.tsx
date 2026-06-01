import { Download } from "lucide-react";
import { Button } from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { BookingsTable } from "@/src/views/bookings/components/bookings-table";

export function BookingsView() {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
        description="Reusable table, filter, empty-state, and form patterns for admin operations."
        eyebrow="Operations"
        title="Bookings"
      />
      <BookingsTable />
    </div>
  );
}
