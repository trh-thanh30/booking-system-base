"use client";

import { useEffect, useState } from "react";
import type { BookingSeed } from "../HowItWorksSection.types";

const SEED: BookingSeed[] = [
  {
    id: "s1",
    time: "09:00",
    name: "Sarah Chen",
    svc: "Haircut",
    status: "Confirmed",
    amount: 25,
  },
  {
    id: "s2",
    time: "10:30",
    name: "Mike Rivera",
    svc: "Beard trim",
    status: "Confirmed",
    amount: 15,
  },
  {
    id: "s3",
    time: "11:00",
    name: "Anna Park",
    svc: "Haircut + color",
    status: "Deposit paid",
    amount: 85,
  },
  {
    id: "s4",
    time: "14:00",
    name: "Tom Wilson",
    svc: "Haircut",
    status: "Confirmed",
    amount: 25,
  },
];

const CUSTOMERS = [
  "Lily Tran",
  "James Lee",
  "Nina Patel",
  "Carlos Ruiz",
  "Emma Stone",
  "David Kim",
];
const SERVICES = [
  { name: "Haircut", price: 25 },
  { name: "Beard trim", price: 15 },
  { name: "Hair color", price: 85 },
  { name: "Styling", price: 45 },
  { name: "Treatment", price: 60 },
];

export function useLiveBookings() {
  const [bookings, setBookings] = useState<BookingSeed[]>(SEED);

  useEffect(() => {
    const id = setInterval(() => {
      const svc =
        SERVICES[Math.floor(Math.random() * SERVICES.length)] || SERVICES[0]!;
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      setBookings((prev) => {
        const next: BookingSeed = {
          id:
            typeof window !== "undefined" &&
            typeof window.crypto?.randomUUID === "function"
              ? window.crypto.randomUUID()
              : Math.random().toString(36).substring(2),
          time,
          name:
            CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)] || "Guest",
          svc: svc.name,
          status: "Just booked",
          amount: svc.price,
          _new: true,
        };
        return [next, ...prev].slice(0, 5);
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return { bookings };
}
