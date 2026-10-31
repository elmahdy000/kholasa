"use client";

import { useEffect, useRef } from "react";

interface ConfettiCanvasProps {
  duration?: number; // duration in ms, default 3000
  particleCount?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "rect" | "circle";
}

const COLORS = [
  "#800020", // Kholasa burgundy
  "#9E1B32", // Crimson
  "#D97706", // Amber gold
  "#F59E0B", // Bright gold
  "#059669", // Emerald green
  "#10B981", // Bright emerald
  "#2563EB", // Sapphire blue
  "#3B82F6", // Sky blue
  "#FB7185", // Soft rose
  "#A855F7", // Purple
];

export function ConfettiCanvas({
  duration = 3500,
  particleCount = 90,
  className = "",
}: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const startTime = performance.now();

    // Create particles originating from bottom-middle and sides
    const particles: Particle[] = Array.from({ length: particleCount }).map(() => {
      const startX = width * (0.3 + Math.random() * 0.4);
      const angle = (Math.PI / 4) + Math.random() * (Math.PI / 2); // mostly upward
      const speed = 10 + Math.random() * 14;

      return {
        x: startX,
        y: height * 0.75,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: -Math.sin(angle) * speed,
        size: 6 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
        shape: Math.random() > 0.3 ? "rect" : "circle",
      };
    });

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = elapsed / duration;

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32; // gravity
        p.vx *= 0.985; // air resistance
        p.rotation += p.rotationSpeed;

        // Fade out towards the end
        if (progress > 0.6) {
          p.opacity = Math.max(0, 1 - (progress - 0.6) / 0.4);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [duration, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-50 ${className}`}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
