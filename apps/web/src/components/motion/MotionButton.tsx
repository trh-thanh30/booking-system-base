"use client";

import { motion, useReducedMotion, HTMLMotionProps } from "framer-motion";

type MotionButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary";
};

export function MotionButton({
  children,
  className = "",
  variant = "primary",
  ...props
}: MotionButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  const baseClass =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer";

  const variantClass =
    variant === "primary"
      ? "bg-brand-blue text-white border border-transparent shadow-sm hover:bg-brand-blue-hover hover:shadow-md"
      : "border border-border-light bg-bg-primary text-text-secondary hover:bg-bg-secondary hover:text-text-primary";

  return (
    <motion.button
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      className={`${baseClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
