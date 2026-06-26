import { useState, useEffect, useRef } from "react";
import { HERO_SLOTS } from "../hero.constants";

export function useHeroAutoplay() {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("15:00");
  const [selectedService, setSelectedService] = useState<string>("spa");

  const [bookingsCount, setBookingsCount] = useState<number>(12);
  const [revenueAmount, setRevenueAmount] = useState<number>(150.0);
  const [isBookingLoading, setIsBookingLoading] = useState<boolean>(false);
  const [isBooked, setIsBooked] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState<boolean>(false);
  const [flashBookings, setFlashBookings] = useState<boolean>(false);
  const [flashRevenue, setFlashRevenue] = useState<boolean>(false);

  // State refs to keep the loop independent of state updates re-triggering the useEffect
  const isAutoplayPausedRef = useRef(isAutoplayPaused);
  const isBookedRef = useRef(isBooked);
  const isBookingLoadingRef = useRef(isBookingLoading);
  const selectedServiceRef = useRef(selectedService);

  useEffect(() => {
    isAutoplayPausedRef.current = isAutoplayPaused;
  }, [isAutoplayPaused]);
  useEffect(() => {
    isBookedRef.current = isBooked;
  }, [isBooked]);
  useEffect(() => {
    isBookingLoadingRef.current = isBookingLoading;
  }, [isBookingLoading]);
  useEffect(() => {
    selectedServiceRef.current = selectedService;
  }, [selectedService]);

  // Autoplay loop timer - Self-scheduling timeout chain
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runStep = () => {
      if (
        isAutoplayPausedRef.current ||
        isBookedRef.current ||
        isBookingLoadingRef.current
      ) {
        // If paused or busy, check again in 1 second
        timeoutId = setTimeout(runStep, 1000);
        return;
      }

      // Step 1: Cycle service and choose slot
      const nextService = selectedServiceRef.current === "spa" ? "hair" : "spa";
      setSelectedService(nextService);

      const slots = HERO_SLOTS.filter((s) => s !== "13:00");
      const nextSlot =
        slots[Math.floor(Math.random() * slots.length)] || "15:00";
      setSelectedTimeSlot(nextSlot);

      // Step 2: After 800ms, start the booking animation
      timeoutId = setTimeout(() => {
        setIsBookingLoading(true);

        // Step 3: After 900ms, complete booking
        timeoutId = setTimeout(() => {
          setIsBookingLoading(false);
          setIsBooked(true);
          setShowToast(true);

          // Update stats
          const deposit = nextService === "spa" ? 15 : 18;
          setBookingsCount(13);
          setRevenueAmount(150 + deposit);
          setFlashBookings(true);
          setFlashRevenue(true);

          // Turn off stat flash after 500ms
          timeoutId = setTimeout(() => {
            setFlashBookings(false);
            setFlashRevenue(false);
          }, 500);

          // Step 4: After 2.5s, reset booking state and return to idle
          timeoutId = setTimeout(() => {
            setIsBooked(false);
            setShowToast(false);
            setBookingsCount(12);
            setRevenueAmount(150.0);

            // Wait 2 seconds of idle time before starting next loop
            timeoutId = setTimeout(runStep, 2000);
          }, 2500);
        }, 900);
      }, 800);
    };

    // Start loop after 1.5 seconds initial delay
    timeoutId = setTimeout(runStep, 1500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSelectServiceManual = (srv: string) => {
    setIsAutoplayPaused(true);
    setSelectedService(srv);
  };

  const handleSelectSlotManual = (slot: string) => {
    setIsAutoplayPaused(true);
    setSelectedTimeSlot(slot);
  };

  const handleBookManual = () => {
    setIsAutoplayPaused(true);
    if (isBooked || isBookingLoading) return;
    setIsBookingLoading(true);

    setTimeout(() => {
      setIsBookingLoading(false);
      setIsBooked(true);
      setShowToast(true);

      const deposit = selectedService === "spa" ? 15 : 18;
      setBookingsCount(13);
      setRevenueAmount(150 + deposit);
      setFlashBookings(true);
      setFlashRevenue(true);

      setTimeout(() => {
        setFlashBookings(false);
        setFlashRevenue(false);
      }, 500);

      setTimeout(() => {
        setIsBooked(false);
        setShowToast(false);
        setBookingsCount(12);
        setRevenueAmount(150.0);
      }, 2500);
    }, 900);
  };

  return {
    selectedTimeSlot,
    selectedService,
    bookingsCount,
    revenueAmount,
    isBookingLoading,
    isBooked,
    showToast,
    isAutoplayPaused,
    flashBookings,
    flashRevenue,
    setIsAutoplayPaused,
    handleSelectServiceManual,
    handleSelectSlotManual,
    handleBookManual,
  };
}
