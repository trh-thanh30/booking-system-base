"use client";

import { CalendarPlus, Filter, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { StatePanel } from "@/src/components/common/state-panel";
import { AdminFilterToolbar } from "@/src/components/common/admin/admin-filter-toolbar";
import { AdminDataTable } from "@/src/components/common/admin/admin-data-table";
import { getBookingColumns } from "@/src/views/admin/bookings/columns/bookings.columns";
import {
  bookings,
  bookingStatusFilters,
} from "@/src/views/admin/bookings/constants/bookings.constants";
import type { BookingStatusFilter } from "@/src/views/admin/bookings/types/bookings.types";
import { getBookingStatusFilterLabel } from "@/src/views/admin/bookings/utils/bookings.utils";

export function BookingsTable() {
  const t = useTranslations("Bookings");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingStatusFilter>("all");

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = status === "all" || booking.status === status;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [booking.id, booking.customer, booking.location, booking.owner].some(
          (value) => value.toLowerCase().includes(normalizedQuery),
        );

      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const columns = getBookingColumns(t);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>{t("queueTitle")}</CardTitle>
              <CardDescription>{t("queueDescription")}</CardDescription>
            </div>
            <Button>
              <CalendarPlus className="h-4 w-4" />
              {t("newBooking")}
            </Button>
          </div>
          <AdminFilterToolbar className="border-0 bg-transparent p-0 shadow-none">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label={t("searchLabel")}
                className="pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                value={query}
              />
            </div>
            <div className="flex max-w-full flex-wrap gap-2">
              {bookingStatusFilters.map((item) => (
                <Button
                  aria-pressed={status === item}
                  key={item}
                  onClick={() => setStatus(item)}
                  size="sm"
                  variant={status === item ? "primary" : "secondary"}
                >
                  {getBookingStatusFilterLabel(item, t)}
                </Button>
              ))}
            </div>
          </AdminFilterToolbar>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <AdminDataTable
              ariaLabel={t("queueTitle")}
              columns={columns}
              data={filteredBookings}
              getRowId={(booking) => booking.id}
            />
          ) : (
            <StatePanel
              action={
                <Button
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                  }}
                  variant="secondary"
                >
                  {t("clearFilters")}
                </Button>
              }
              description={t("emptyDescription")}
              icon={Filter}
              title={t("emptyTitle")}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("quickCreateTitle")}</CardTitle>
          <CardDescription>{t("quickCreateDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              description={t("visibleLabelsDescription")}
              htmlFor="booking-customer"
              label={t("customer")}
            >
              <Input id="booking-customer" placeholder={t("workspaceName")} />
            </FormField>
            <FormField htmlFor="booking-date" label={t("bookingDate")}>
              <Input id="booking-date" type="date" />
            </FormField>
            <FormField
              description={t("ownerDescription")}
              htmlFor="booking-owner"
              label={t("owner")}
            >
              <Input id="booking-owner" placeholder={t("teamMember")} />
            </FormField>
          </div>
          <div className="flex justify-end border-t border-border pt-4">
            <Button className="w-full md:w-auto" variant="secondary">
              <SlidersHorizontal className="h-4 w-4" />
              {t("saveDraft")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
