"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/src/hooks/useIsMobile";

type UseRevealOptions = {
  once?: boolean;
  margin?: string;
};

export function useReveal(options: UseRevealOptions = {}) {
  const isMobile = useIsMobile();

  const { once = true, margin = isMobile ? "0px" : "-80px" } = options;

  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, {
    once,
    margin: margin as NonNullable<Parameters<typeof useInView>[1]>["margin"],
  });

  const shouldReduceMotion = useReducedMotion();

  const yVal = isMobile ? 12 : 24;

  const initial = shouldReduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: yVal };

  const animate = shouldReduceMotion
    ? { opacity: 1, y: 0 }
    : isInView
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: yVal };

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: isMobile ? 0.3 : 0.6, ease: "easeOut" };

  return {
    ref,
    initial,
    animate,
    transition,
  };
}
