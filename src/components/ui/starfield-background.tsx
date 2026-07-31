"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface StarfieldBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  /** Number of stars */
  count?: number;
  /** Travel speed */
  speed?: number;
  /** Star color */
  starColor?: string;
  /** Enable twinkling */
  twinkle?: boolean;
}

interface Star {
  x: number;
  y: number;
  z: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

function resolveStarCount(requested: number) {
  if (typeof window === "undefined") return requested;
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData =
    "connection" in navigator &&
    Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData,
    );
  if (reduce || saveData) return Math.min(requested, 80);
  if (mobile) return Math.min(requested, 120);
  return requested;
}

export function StarfieldBackground({
  className,
  children,
  count = 220,
  speed = 0.35,
  starColor = "#C0C0C0",
  twinkle = true,
}: StarfieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const starCount = resolveStarCount(count);
    const rect = container.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const syncSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    canvas.width = width;
    canvas.height = height;
    syncSize();

    let animationId = 0;
    let tick = 0;
    let running = true;
    const maxDepth = 1500;

    const createStar = (initialZ?: number): Star => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: initialZ ?? Math.random() * maxDepth,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2,
    });

    const stars: Star[] = Array.from({ length: starCount }, () => createStar());

    const handleResize = () => {
      const next = container.getBoundingClientRect();
      width = next.width;
      height = next.height;
      syncSize();
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    const animate = () => {
      if (!running) return;
      tick += 1;

      ctx.fillStyle = "rgba(5, 5, 5, 0.28)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (const star of stars) {
        star.z -= speed * 2;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          star.z = maxDepth;
        }

        const scale = 400 / star.z;
        const x = cx + star.x * scale;
        const y = cy + star.y * scale;

        if (x < -8 || x > width + 8 || y < -8 || y > height + 8) continue;

        const size = Math.max(0.25, (1 - star.z / maxDepth) * 1.35);
        let opacity = (1 - star.z / maxDepth) * 0.75 + 0.12;

        if (twinkle && star.twinkleSpeed > 0.015) {
          opacity *=
            0.75 + 0.25 * Math.sin(tick * star.twinkleSpeed + star.twinkleOffset);
        }

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.globalAlpha = opacity;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(animationId);
        return;
      }
      if (!running) {
        running = true;
        previousKick();
      }
    };

    const previousKick = () => {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);
      animationId = requestAnimationFrame(animate);
    };

    previousKick();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(animationId);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count, speed, starColor, twinkle]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden bg-void",
        className,
      )}
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 25% 35%, rgba(69, 0, 0, 0.28) 0%, transparent 55%), radial-gradient(ellipse at 75% 65%, rgba(193, 18, 31, 0.1) 0%, transparent 50%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 45%, rgba(5,5,5,0.75) 100%)",
        }}
      />

      {children ? (
        <div className="relative z-10 h-full w-full pointer-events-auto">{children}</div>
      ) : null}
    </div>
  );
}

export default StarfieldBackground;
