"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BookingItem, StaffSlotMeta } from "../features.types";
import {
  BOOKINGS_INITIAL_DATA,
  BOOKINGS_SERVICES,
  BOOKINGS_STAFF_NAMES,
  BOOKINGS_INITIAL_STAFF_SLOTS,
} from "../features.constants";

export function PanelBookings({ isActive }: { isActive: boolean }) {
  const [bookings, setBookings] = useState<BookingItem[]>(
    BOOKINGS_INITIAL_DATA,
  );
  const [stats, setStats] = useState({
    bookingsCount: 12,
    deposits: 1240,
    reminders: 14,
  });
  const [flashKey, setFlashKey] = useState({
    bookingsCount: 0,
    deposits: 0,
    reminders: 0,
  });
  const [staffSlots, setStaffSlots] = useState<StaffSlotMeta[]>(
    BOOKINGS_INITIAL_STAFF_SLOTS,
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      // Pick random service and staff
      const svc =
        BOOKINGS_SERVICES[
          Math.floor(Math.random() * BOOKINGS_SERVICES.length)
        ] || BOOKINGS_SERVICES[0]!;
      const staff =
        BOOKINGS_STAFF_NAMES[
          Math.floor(Math.random() * BOOKINGS_STAFF_NAMES.length)
        ] || BOOKINGS_STAFF_NAMES[0]!;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newBooking: BookingItem = {
        id: Math.random().toString(),
        time: timeStr,
        title: svc.name,
        staff: staff,
        meta: `$${svc.price} Deposit Paid`,
        status: "green",
        statusText: "Confirmed",
        isNew: true,
      };

      setBookings((prev) => {
        const updated = [newBooking, ...prev];
        if (updated.length > 3) updated.pop();
        return updated;
      });

      setStats((prev) => ({
        bookingsCount: prev.bookingsCount + 1,
        deposits: prev.deposits + svc.price,
        reminders: prev.reminders + Math.floor(Math.random() * 2) + 1,
      }));

      // Flash stats
      setFlashKey((prev) => ({
        bookingsCount: prev.bookingsCount + 1,
        deposits: prev.deposits + 1,
        reminders: prev.reminders + 1,
      }));

      // Update staff slots
      setStaffSlots((prevSlots) =>
        prevSlots.map((s) => {
          if (s.name === staff) {
            const nextSlots = Math.max(0, s.slots - 1);
            return {
              ...s,
              slots: nextSlots,
              status: nextSlots === 0 ? "full" : nextSlots < 2 ? "few" : "open",
            };
          }
          return s;
        }),
      );
    }, 5500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  return (
    <div className="flex flex-col gap-4.5 font-sans h-full">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          {
            label: "Bookings",
            val: `${stats.bookingsCount} Today`,
            key: flashKey.bookingsCount,
          },
          {
            label: "Deposits",
            val: `$${stats.deposits.toLocaleString()}`,
            key: flashKey.deposits,
          },
          {
            label: "Reminders",
            val: `${stats.reminders} Sent`,
            key: flashKey.reminders,
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-bg-secondary/40 p-3.5 border border-border-light/40"
          >
            <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
              {stat.label}
            </p>
            <motion.p
              key={stat.key}
              initial={{ scale: 1.1, color: "#3b82f6" }}
              animate={{ scale: 1, color: "#111827" }}
              transition={{ duration: 0.6 }}
              className="mt-1 text-sm font-extrabold leading-none"
            >
              {stat.val}
            </motion.p>
          </div>
        ))}
      </div>

      {/* Calendar List with Locked Height to prevent layout shift */}
      <div className="rounded-2xl bg-bg-secondary/40 p-4 border border-border-light/40">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
            Today&apos;s calendar
          </p>
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-blue">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
            <span>Live</span>
          </span>
        </div>

        <div className="mt-3 space-y-2 relative overflow-hidden h-[170px]">
          <AnimatePresence initial={false}>
            {bookings.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`flex items-center justify-between bg-bg-primary px-3.5 py-2.5 rounded-xl border border-border-light/50 shadow-[0_1px_3px_rgba(0,0,0,0.01)] ${
                  item.isNew
                    ? "border-l-3 border-l-emerald-500 bg-emerald-50/10"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold text-brand-blue bg-[#E5F0FF] px-2 py-0.5 rounded">
                    {item.time}
                  </span>
                  <div>
                    <p className="font-bold text-text-primary text-xs leading-tight">
                      {item.title} · {item.staff}
                    </p>
                    <p className="text-[9px] text-text-muted mt-0.5">
                      {item.meta}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.status === "green"
                        ? "bg-emerald-500"
                        : item.status === "orange"
                          ? "bg-amber-500"
                          : "bg-zinc-400"
                    }`}
                  />
                  <span className="text-[9.5px] font-bold text-text-muted">
                    {item.statusText}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Staff Availability */}
      <div className="rounded-2xl bg-bg-secondary/40 p-4 border border-border-light/40">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted leading-none">
          Staff availability
        </p>

        <div className="mt-3.5 space-y-2">
          {staffSlots.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-1.5 px-1 border-b border-border-light/30 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-white text-[9px] font-bold">
                  {item.name[0]}
                </div>
                <span className="font-bold text-text-secondary">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    item.status === "open"
                      ? "bg-emerald-500"
                      : item.status === "few"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                />
                <span className="text-[10px] font-bold text-text-muted">
                  {item.status === "full"
                    ? "Fully booked"
                    : `${item.slots} slots open`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
