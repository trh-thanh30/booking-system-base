"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/src/hooks/useIsMobile";

type RepeatStaggerItemProps = {
  children: ReactNode;
  className?: string;
};

export function RepeatStaggerItem({
  children,
  className = "",
}: RepeatStaggerItemProps) {
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotion();

  const itemVariants = {
    hidden: shouldReduceMotion
      ? {
          opacity: 1,
          y: 0,
          scale: 1,
        }
      : {
          opacity: 0,
          y: isMobile ? 14 : 24,
          scale: isMobile ? 0.98 : 0.96,
        },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      transition={{
        duration: shouldReduceMotion ? 0 : isMobile ? 0.35 : 0.45,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
