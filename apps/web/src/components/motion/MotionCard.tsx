"use client";

import { motion, useReducedMotion, HTMLMotionProps } from "framer-motion";
import { FeatureCard } from "@/src/components/common/landing-compositions";

const AnimatedFeatureCard = motion.create(FeatureCard);

type MotionCardProps = HTMLMotionProps<"div">;

export function MotionCard({
  children,
  className = "",
  ...props
}: MotionCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatedFeatureCard
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        transition-shadow duration-normal ease-standard
        hover:border-input hover:shadow-md
        ${className}
      `}
      {...props}
    >
      {children}
    </AnimatedFeatureCard>
  );
}
