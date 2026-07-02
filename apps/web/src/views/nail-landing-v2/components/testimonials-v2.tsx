"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { getFadeUp } from "../nail-landing-v2.animations";

// ─── Heading parts ────────────────────────────────────────────────────────
const PART1 = "Nail Stories";
const PART2 = "That Shine"; // accent phrase

// Full text (spaces between parts count as positions)
const FULL_TEXT = `${PART1} ${PART2}`;
const CENTER_IDX = (FULL_TEXT.length - 1) / 2;

const BASE_DELAY = 0.05;
const CHAR_STAGGER = 0.038;

/** Delay = distance from center of heading */
function getCharDelay(globalIdx: number): number {
  return BASE_DELAY + Math.abs(globalIdx - CENTER_IDX) * CHAR_STAGGER;
}

// Pre-compute delay arrays for each part (before render, stable)
let _offset = 0;
const PART1_DELAYS = PART1.split("").map((_, i) => getCharDelay(_offset + i));
_offset += PART1.length + 1; // +1 for the space between parts

const PART2_DELAYS = PART2.split("").map((_, i) => getCharDelay(_offset + i));

// ─── Char variants (custom = per-char delay) ─────────────────────────────
const charVariants = {
  hidden: { y: "108%", opacity: 0 },
  show: (delay: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.65,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      delay,
    },
  }),
};

// ─── AnimatedWord: renders chars with pre-computed delays ─────────────────
function AnimatedWord({ word, delays }: { word: string; delays: number[] }) {
  return (
    <span
      className="inline-block overflow-hidden"
      style={{ verticalAlign: "bottom" }}
    >
      {word.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={charVariants}
          custom={delays[i] ?? 0}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

// ─── AnimatedPhrase: handles multi-word phrases ───────────────────────────
function AnimatedPhrase({ text, delays }: { text: string; delays: number[] }) {
  const words = text.split(" ");
  let charOffset = 0;

  return (
    <>
      {words.map((word, wi) => {
        const wordDelays = delays.slice(charOffset, charOffset + word.length);
        charOffset += word.length + 1; // +1 for the space
        return (
          <span key={wi} className="inline-block">
            <AnimatedWord word={word} delays={wordDelays} />
            {wi < words.length - 1 && "\u00A0"}
          </span>
        );
      })}
    </>
  );
}

const COMMENTS_LIST = [
  {
    id: "emily",
    name: "Emily Jakes",
    role: "Client",
    avatar: "/nail-salon/ver2.jpg",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus, ultrices mauris. Maecenas vitae mattis tellus.",
  },
  {
    id: "alex",
    name: "Alex Morgan",
    role: "Client",
    avatar: "/nail-salon/ver3.jpg",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus, ultrices mauris. Maecenas vitae mattis tellus.",
  },
  {
    id: "sarah",
    name: "Sarah Mitchell",
    role: "Client",
    avatar: "/nail-salon/ver1.jpg",
    text: "Absolutely love my new gel nails! The attention to detail is outstanding, and the atmosphere was so relaxing. Will definitely be a regular client here.",
  },
  {
    id: "jessica",
    name: "Jessica Taylor",
    role: "Client",
    avatar: "/nail-salon/ver2.jpg",
    text: "The luxury nail treatment here is unmatched. My nails have never looked so healthy and beautiful. The customized designs are always perfect and unique.",
  },
  {
    id: "olivia",
    name: "Olivia Bennett",
    role: "Client",
    avatar: "/nail-salon/ver3.jpg",
    text: "Professional staff, clean environment, and stunning results. The custom design they created for me was perfect. Truly a premium experience.",
  },
  {
    id: "david",
    name: "David Kim",
    role: "Client",
    avatar: "/nail-salon/ver1.jpg",
    text: "Amazing service! The pedicure was so soothing, and the staff was extremely friendly. The brand-900 template styling of this salon feels highly high-end.",
  },
];

export function TestimonialsV2() {
  const prefersReduced = useReducedMotion();
  const fadeUp = getFadeUp(prefersReduced, 20, 0.5);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  return (
    <section
      id="testimonials"
      className="py-20 bg-stone-50 border-t border-stone-200 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <motion.div
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="space-y-2"
          >
            <motion.span
              variants={fadeUp}
              className="text-xs font-bold tracking-widest text-brand-500 uppercase block"
            >
              Testimonial
            </motion.span>
            <motion.h2
              className="text-3xl sm:text-4xl font-bold font-serif text-brand-900 leading-[1.35] select-none text-center"
              initial={prefersReduced ? "show" : "hidden"}
              whileInView="show"
              viewport={{ once: false, amount: 0.3 }}
            >
              {/* Part 1 – normal */}
              <AnimatedPhrase text={PART1} delays={PART1_DELAYS} />
              {"\u00A0"}

              {/* Part 2 – accent */}
              <span className="inline-block text-brand-500">
                <AnimatedPhrase text={PART2} delays={PART2_DELAYS} />
              </span>
            </motion.h2>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto font-light leading-relaxed"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa
            mi. Aliquam in hendrerit urna.
          </motion.p>
        </div>

        {/* Outer Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* 1. Static Stats Badge Card (Fixed, not inside slider) */}
          <div className="w-full flex flex-col rounded-[32px] overflow-hidden border border-stone-200/60 shadow-md bg-stone-50 justify-between min-h-[380px] h-full">
            {/* Top Image part */}
            <div className="relative flex-1 min-h-[220px]">
              <Image
                src="/nail-salon/ver1.jpg"
                alt="10K review thumbnail"
                fill
                className="object-cover"
              />
            </div>

            {/* Bottom Dark Mauve part */}
            <div className="bg-brand-900 text-brand-50 p-6 pb-8 text-center relative flex flex-col items-center justify-center min-h-[140px]">
              {/* Overlapping circular avatars */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex -space-x-2.5 z-10">
                <Image
                  src="/nail-salon/ver3.jpg"
                  alt="Client avatar 1"
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-brand-900 object-cover"
                />
                <Image
                  src="/nail-salon/ver1.jpg"
                  alt="Client avatar 2"
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-brand-900 object-cover"
                />
                <Image
                  src="/nail-salon/ver2.jpg"
                  alt="Client avatar 3"
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-brand-900 object-cover"
                />
                <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm border-2 border-brand-900 select-none">
                  +
                </div>
              </div>

              <h3 className="text-xl font-bold font-serif mt-2 tracking-wide">
                10K Review
              </h3>
              <div className="flex gap-1 mt-2.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-brand-100 text-brand-100"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 2. Embla Slider Container for comments (Occupies 2 columns on desktop) */}
          <div className="lg:col-span-2 flex flex-col justify-between h-full">
            <div
              className="overflow-hidden cursor-grab active:cursor-grabbing px-2 py-1"
              ref={emblaRef}
            >
              <div className="flex -ml-6">
                {COMMENTS_LIST.map((item) => (
                  <div
                    key={item.id}
                    className="flex-[0_0_100%] md:flex-[0_0_50%] pl-6 min-w-0 flex"
                  >
                    <div className="w-full relative flex flex-col rounded-[32px] bg-brand-100/55 border border-stone-200/60 p-8 sm:p-10 shadow-sm justify-between overflow-hidden min-h-[380px]">
                      <div className="space-y-6">
                        {/* Slanted bars top decoration */}
                        <span className="text-3xl font-serif text-brand-300/40 select-none tracking-tighter font-extrabold italic block leading-none text-left">
                          {"////"}
                        </span>

                        {/* Client Profile */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-500 bg-stone-100 flex-shrink-0">
                            <Image
                              src={item.avatar}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          </div>
                          <div className="text-left">
                            <h4 className="text-base font-bold text-brand-900">
                              {item.name}
                            </h4>
                            <p className="text-xs text-stone-500 font-medium">
                              {item.role}
                            </p>
                          </div>
                        </div>

                        {/* Review Text */}
                        <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-normal text-left line-clamp-6">
                          {item.text}
                        </p>
                      </div>

                      {/* Stars at bottom */}
                      <div className="flex gap-1 mt-8">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-brand-500 text-brand-500"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider dots indicators (centered below slider columns) */}
            <div className="flex justify-center gap-2.5 mt-6">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === selectedIndex ? "bg-brand-500" : "bg-stone-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsV2;
