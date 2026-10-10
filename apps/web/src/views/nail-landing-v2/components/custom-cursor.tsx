"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring settings for the outer ring (fluid lag effect)
  const ringSpringConfig = { damping: 26, stiffness: 220, mass: 0.5 };
  const ringX = useSpring(cursorX, ringSpringConfig);
  const ringY = useSpring(cursorY, ringSpringConfig);

  useEffect(() => {
    setMounted(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("cursor-pointer") ||
        target.getAttribute("role") === "button";

      setIsHovering(!!isInteractive);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <>
      {/* 1. Inner Dot: stays locked on the mouse coordinate */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-brand-500 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          scale: isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      />

      {/* 2. Outer Ring: lags behind with smooth spring interpolation */}
      <motion.div
        className="fixed top-0 left-0 w-9 h-9 border border-brand-500 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
        style={{
          x: ringX,
          y: ringY,
        }}
        animate={{
          scale: isHovering ? 1.8 : 1,
          borderColor: isHovering ? "transparent" : "var(--color-brand-500)",
          opacity: isHovering ? 1 : 0.45,
          backgroundColor: isHovering
            ? "rgba(120, 113, 108, 0.25)"
            : "rgba(120, 113, 108, 0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
    </>
  );
}
export default CustomCursor;
