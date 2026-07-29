import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

export interface PerspectiveMarqueeProps {
  items: ReactNode[];
  rotateX?: number;
  rotateY?: number;
  perspective?: number;
  /** Scroll speed in pixels per second. */
  speed?: number;
  maxBlur?: number;
  minOpacity?: number;
  label?: string;
  className?: string;
}

const COPIES = 3;

export function PerspectiveMarquee({
  items,
  rotateX = 8,
  rotateY = -28,
  perspective = 1200,
  speed = 70,
  maxBlur = 6,
  minOpacity = 0.35,
  label,
  className = "",
}: PerspectiveMarqueeProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const itemNodes = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const view = viewport.current;
    const strip = track.current;
    if (!view || !strip) return;

    const nodes = itemNodes.current.filter(
      (node): node is HTMLSpanElement => node !== null,
    );
    if (!nodes.length) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const centers: number[] = [];
    let groupWidth = 0;
    let viewCenter = 0;
    // Keep the depth falloff from collapsing on narrow screens, where half the
    // viewport is barely wider than a single item.
    let falloff = 1;
    let offset = 0;

    const measure = () => {
      viewCenter = view.offsetWidth / 2;
      falloff = Math.max(viewCenter, 440);
      groupWidth = 0;
      let running = 0;
      nodes.forEach((node, i) => {
        const width = node.offsetWidth;
        centers[i] = running + width / 2;
        running += width;
        if (i < items.length) groupWidth += width;
      });
      if (groupWidth > 0) offset = -((-offset % groupWidth) + groupWidth) % groupWidth;
    };

    const paint = () => {
      for (let i = 0; i < nodes.length; i++) {
        const distance = Math.min(
          1,
          Math.abs(centers[i] + offset - viewCenter) / falloff,
        );
        nodes[i].style.filter = `blur(${(distance * maxBlur).toFixed(2)}px)`;
        nodes[i].style.opacity = (1 - distance * (1 - minOpacity)).toFixed(3);
      }
      strip.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
    };

    measure();
    paint();

    const tick = (_time: number, delta: number) => {
      offset -= (speed * delta) / 1000;
      if (offset <= -groupWidth) offset += groupWidth;
      paint();
    };

    let running = false;
    const start = () => {
      if (running || reduceMotion) return;
      gsap.ticker.add(tick);
      running = true;
    };
    const stop = () => {
      if (!running) return;
      gsap.ticker.remove(tick);
      running = false;
    };

    // Only burn frames while the marquee is actually on screen.
    const visibility = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "120px" },
    );
    visibility.observe(view);

    const resize = new ResizeObserver(() => {
      measure();
      paint();
    });
    resize.observe(view);

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (cancelled) return;
      measure();
      paint();
    });

    return () => {
      cancelled = true;
      stop();
      visibility.disconnect();
      resize.disconnect();
    };
  }, [items, speed, maxBlur, minOpacity]);

  const rendered = Array.from({ length: COPIES }, () => items).flat();

  return (
    <div
      ref={viewport}
      className={`perspective-marquee ${className}`.trim()}
      style={{ perspective: `${perspective}px` }}
      aria-label={label}
      role={label ? "group" : undefined}
    >
      <div
        className="perspective-marquee__stage"
        style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}
      >
        <div ref={track} className="perspective-marquee__track">
          {rendered.map((item, i) => (
            <span
              key={i}
              ref={(node) => {
                itemNodes.current[i] = node;
              }}
              className="perspective-marquee__item"
              aria-hidden={i >= items.length}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
