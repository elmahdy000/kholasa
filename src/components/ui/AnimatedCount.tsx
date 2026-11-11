"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedCountProps {
  value: number;
  className?: string;
  suffix?: string;
}

export function AnimatedCount({ value, className, suffix = "" }: AnimatedCountProps) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const durationMs = 420;
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
    <motion.span
      key={value}
      initial={{ scale: 0.9, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={className}
    >
      {display}
      {suffix}
    </motion.span>
  );
}

