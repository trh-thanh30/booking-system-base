"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { CalendarPlus, Filter, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { StatePanel } from "@/src/components/common/state-panel";
import { bookingColumns } from "@/src/views/bookings/bookings.columns";
import {
  bookings,
  bookingStatusFilters,
} from "@/src/views/bookings/bookings.constants";
import type { BookingStatusFilter } from "@/src/views/bookings/bookings.types";
import { getBookingStatusFilterLabel } from "@/src/views/bookings/bookings.utils";

export function BookingsTable() {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
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

  const table = useReactTable({
    columns: bookingColumns,
    data: filteredBookings,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Booking queue</CardTitle>
              <CardDescription>
                Search, filter, and triage booking records before wiring real
                API data.
              </CardDescription>
            </div>
            <Button>
              <CalendarPlus className="h-4 w-4" />
              New booking
            </Button>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                aria-label="Search bookings"
                className="pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by booking, customer, location, or owner"
                value={query}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {bookingStatusFilters.map((item) => (
                <Button
                  aria-pressed={status === item}
                  key={item}
                  onClick={() => setStatus(item)}
                  size="sm"
                  variant={status === item ? "primary" : "secondary"}
                >
                  {getBookingStatusFilterLabel(item)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {table.getRowModel().rows.length > 0 ? (
            <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow
                        data-state={
                          row.getIsSelected() ? "selected" : undefined
                        }
                        key={row.id}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
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
                  Clear filters
                </Button>
              }
              description="Try another keyword or reset status filters to see all booking records."
              icon={Filter}
              title="No bookings match these filters"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick create pattern</CardTitle>
          <CardDescription>
            A compact form pattern for later booking, user, and system
            workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <FormField
            description="Use visible labels instead of placeholder-only fields."
            htmlFor="booking-customer"
            label="Customer"
          >
            <Input id="booking-customer" placeholder="Workspace name" />
          </FormField>
          <FormField htmlFor="booking-date" label="Booking date">
            <Input id="booking-date" type="date" />
          </FormField>
          <FormField
            description="Operators can update this after assignment."
            htmlFor="booking-owner"
            label="Owner"
          >
            <Input id="booking-owner" placeholder="Team member" />
          </FormField>
          <div className="flex items-end md:justify-end">
            <Button className="w-full md:w-auto" variant="secondary">
              <SlidersHorizontal className="h-4 w-4" />
              Save draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
