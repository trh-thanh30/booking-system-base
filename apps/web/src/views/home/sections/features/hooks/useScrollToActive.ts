import { useEffect, useRef } from "react";

export function useScrollToActive<T extends string | number>(
  activeId: T,
  delay = 120,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    // Only scroll internally on desktop screens (width >= 1024px)
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      return;
    }

    const activeEl = itemRefs.current[activeId];
    const containerEl = containerRef.current;
    if (activeEl && containerEl) {
      const timer = setTimeout(() => {
        const targetScrollTop =
          activeEl.offsetTop -
          containerEl.clientHeight / 2 +
          activeEl.clientHeight / 2;

        containerEl.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [activeId, delay]);

  const setItemRef = (id: T) => (el: HTMLElement | null) => {
    itemRefs.current[id as string] = el;
  };

  return {
    containerRef,
    setItemRef,
  };
}
