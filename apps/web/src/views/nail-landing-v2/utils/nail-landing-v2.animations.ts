import { Variants, Easing } from "framer-motion";

export const getStaggerContainer = (
  prefersReduced: boolean | null,
  staggerChildren: number,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: prefersReduced ? 0 : staggerChildren,
      delayChildren: prefersReduced ? 0 : delayChildren,
    },
  },
});

export const getFadeUp = (
  prefersReduced: boolean | null,
  yOffset = 16,
  duration = 0.4,
  ease: Easing | Easing[] = "easeOut",
): Variants => ({
  hidden: { opacity: 0, y: prefersReduced ? 0 : yOffset },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, ease },
  },
});

export const getFadeDown = (
  prefersReduced: boolean | null,
  yOffset = -12,
  duration = 0.35,
  ease: Easing | Easing[] = "easeOut",
): Variants => ({
  hidden: { opacity: 0, y: prefersReduced ? 0 : yOffset },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, ease },
  },
});

export const getScaleIn = (
  prefersReduced: boolean | null,
  scale = 0.95,
  duration = 0.35,
  ease: Easing | Easing[] = "easeOut",
): Variants => ({
  hidden: { opacity: 0, scale: prefersReduced ? 1 : scale },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration, ease },
  },
});
