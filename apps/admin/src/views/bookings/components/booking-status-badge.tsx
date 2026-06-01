import { Badge } from "@repo/ui";
import type { BookingStatus } from "@repo/shared";

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    variant: "secondary" | "success" | "warning" | "destructive";
  }
> = {
  cancelled: { label: "Cancelled", variant: "destructive" },
  completed: { label: "Completed", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
