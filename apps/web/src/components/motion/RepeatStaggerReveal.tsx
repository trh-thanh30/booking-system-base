"use client";

import { ReactNode, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/src/hooks/useIsMobile";

type RepeatStaggerRevealProps = {
  children: ReactNode;
  className?: string;
  amount?: number;
  margin?: string;
};

export function RepeatStaggerReveal({
  children,
  className = "",
  amount,
  margin,
}: RepeatStaggerRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  const finalAmount = amount !== undefined ? amount : isMobile ? 0.05 : 0.2;
  const finalMargin =
    margin !== undefined ? margin : isMobile ? "0px" : "-80px";

  const isInView = useInView(ref, {
    once: false,
    amount: finalAmount,
    margin: finalMargin as NonNullable<
      Parameters<typeof useInView>[1]
    >["margin"],
  });

  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : isMobile ? 0.05 : 0.08,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}
