import type { BookingStatusFilter } from "@/src/views/bookings/types/bookings.types";

type Translate = (key: string) => string;

export function getBookingStatusFilterLabel(
  status: BookingStatusFilter,
  t: Translate,
) {
  return t(`filters.${status}`);
}
