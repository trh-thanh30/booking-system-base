import type { BookingStatusFilter } from "@/src/views/bookings/bookings.types";

export function getBookingStatusFilterLabel(status: BookingStatusFilter) {
  return status === "all"
    ? "All"
    : `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}
