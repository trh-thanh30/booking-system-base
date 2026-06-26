"use client";

import { ReactNode, ElementType } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/src/hooks/useReveal";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  id?: string;
};

export function Reveal({ children, className, as = "div", id }: RevealProps) {
  const reveal = useReveal();
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
