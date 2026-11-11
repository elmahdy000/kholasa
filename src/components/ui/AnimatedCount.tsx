"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface AnimatedCountProps {
  value: number;
  className?: string;
  suffix?: string;
  startFromZero?: boolean;
}

export function AnimatedCount({
  value,
  className,
  suffix = "",
  startFromZero = false,
}: AnimatedCountProps) {
  const [display, setDisplay] = useState(startFromZero ? 0 : value);
  const prevRef = useRef(startFromZero ? 0 : value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const durationMs = Math.min(850, Math.max(420, Math.abs(end - start) * 140));
    const startTime = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Cubic ease-out for crisp decelerating settle
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        prevRef.current = end;
      }
    };

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      prevRef.current = end;
    };
  }, [value]);

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: -8, scale: 1.24, opacity: 0.35 }}
        animate={{ y: 0, scale: [1.24, 0.96, 1], opacity: 1 }}
        exit={{ y: 8, scale: 0.82, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 20 }}
        className={`inline-block ${className ?? ""}`}
      >
        {display}
        {suffix}
      </motion.span>
    </AnimatePresence>
  );
}
