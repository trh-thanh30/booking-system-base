"use client";

import { motion, useReducedMotion, HTMLMotionProps } from "framer-motion";

type MotionCardProps = HTMLMotionProps<"div">;

export function MotionCard({
  children,
  className = "",
  ...props
}: MotionCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        rounded-[4px] border border-border-light bg-bg-primary p-6 shadow-sm
        transition-all duration-300 ease-out
        hover:border-border-gray hover:shadow-md
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
