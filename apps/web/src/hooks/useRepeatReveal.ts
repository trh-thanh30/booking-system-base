"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/src/hooks/useIsMobile";

type UseRepeatRevealOptions = {
  amount?: number;
  margin?: string;
  y?: number;
  scale?: number;
  duration?: number;
};

export function useRepeatReveal(options: UseRepeatRevealOptions = {}) {
  const isMobile = useIsMobile();

  const {
    amount = isMobile ? 0.05 : 0.25,
    margin = isMobile ? "0px" : "-80px",
    y = isMobile ? 12 : 24,
    scale = isMobile ? 0.98 : 0.96,
    duration = isMobile ? 0.3 : 0.45,
  } = options;

  const ref = useRef<HTMLDivElement | null>(null);

  const isInView = useInView(ref, {
    once: false,
    amount,
    margin: margin as NonNullable<Parameters<typeof useInView>[1]>["margin"],
  });

  const shouldReduceMotion = useReducedMotion();

  const visibleState = {
    opacity: 1,
    y: 0,
    scale: 1,
  };

  const hiddenState = {
    opacity: 0,
    y,
    scale,
  };

  const initial = shouldReduceMotion ? visibleState : hiddenState;

  const animate = shouldReduceMotion
    ? visibleState
    : isInView
      ? visibleState
      : hiddenState;

  const transition = {
    duration: shouldReduceMotion ? 0 : duration,
    ease: "easeOut" as const,
  };

  return {
    ref,
    isInView,
    initial,
    animate,
    transition,
  };
}
