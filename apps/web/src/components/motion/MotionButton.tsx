"use client";

import { motion, useReducedMotion, HTMLMotionProps } from "framer-motion";
import { buttonVariants, cn } from "@repo/ui";

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

  return (
    <motion.button
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      className={cn(
        buttonVariants({ variant }),
        "min-h-11 rounded-full px-6 py-3 text-label font-semibold cursor-pointer duration-normal",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
