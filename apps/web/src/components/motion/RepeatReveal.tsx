"use client";

import { ReactNode, ElementType } from "react";
import { motion } from "framer-motion";
import { useRepeatReveal } from "@/src/hooks/useRepeatReveal";

type RepeatRevealProps = {
  children: ReactNode;
  className?: string;
  amount?: number;
  margin?: string;
  y?: number;
  scale?: number;
  duration?: number;
  as?: "div" | "section";
  id?: string;
};

export function RepeatReveal({
  children,
  className = "",
  amount,
  margin,
  y,
  scale,
  duration,
  as = "div",
  id,
}: RepeatRevealProps) {
  const reveal = useRepeatReveal({
    amount,
    margin,
    y,
    scale,
    duration,
  });

  const Component = motion[as] as ElementType;

  return (
    <Component
      ref={reveal.ref}
      initial={reveal.initial}
      animate={reveal.animate}
      transition={reveal.transition}
      className={className}
      id={id}
    >
      {children}
    </Component>
  );
}
