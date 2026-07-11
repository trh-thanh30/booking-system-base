"use client";

import { useReducedMotion, Transition } from "framer-motion";

type UseFloatingOptions = {
  distance?: number;
  duration?: number;
};

export function useFloating(options: UseFloatingOptions = {}) {
  const { distance = 8, duration = 6 } = options;
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return {
      animate: {
        y: 0,
      },
      transition: {
        duration: 0,
      } as Transition,
    };
  }

  return {
    animate: {
      y: [0, -distance, 0],
    },
    transition: {
      duration,
      repeat: Infinity,
      ease: "easeInOut",
    } as Transition,
  };
}
