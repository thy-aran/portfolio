import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type LoadingScreenProps = {
  /** 0–100 from asset preload */
  progress: number;
  assetsReady: boolean;
  onDone: () => void;
};

/** Soft floor so the bar never looks stuck at 0 while the intro plays */
const INTRO_PROGRESS_CAP = 28;

export function LoadingScreen({ progress, assetsReady, onDone }: LoadingScreenProps) {
  const [mounted, setMounted] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);
  const [displayPercent, setDisplayPercent] = useState(0);
  const displayRef = useRef(0);
  const barFillRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const glow = document.getElementById("load-glow");
    const brand = document.getElementById("load-brand");
    const line = document.getElementById("load-line");
    const sub = document.getElementById("load-sub");

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => setIntroComplete(true),
    });

    // Shorter brand intro — progress bar carries the wait feel
    tl.to(glow, { opacity: 1, scale: 1.12, duration: 0.7 })
      .fromTo(brand, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.4")
      .to(line, { scaleX: 1, duration: 0.5 }, "-=0.2")
      .to(sub, { opacity: 1, duration: 0.3 }, "-=0.15");
  }, []);

  // Smooth percentage buffer: ease toward target, never jump backwards
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const target = assetsReady
        ? 100
        : Math.max(progress, Math.min(INTRO_PROGRESS_CAP, progress + 8));

      const current = displayRef.current;
      const next =
        target > current
          ? current + Math.max(0.35, (target - current) * 0.12)
          : current;

      const clamped = Math.min(100, next);
      displayRef.current = clamped;
      const shown = Math.floor(clamped);
      setDisplayPercent(shown);

      if (barFillRef.current) {
        barFillRef.current.style.width = `${clamped}%`;
      }
      if (percentRef.current) {
        percentRef.current.textContent = `${shown}%`;
      }

      if (clamped < 99.5 || !assetsReady) {
        raf = requestAnimationFrame(tick);
      } else {
        displayRef.current = 100;
        setDisplayPercent(100);
        if (barFillRef.current) barFillRef.current.style.width = "100%";
        if (percentRef.current) percentRef.current.textContent = "100%";
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, assetsReady]);

  // Dismiss only when intro done, assets ready, and bar has reached ~100
  useEffect(() => {
    if (!introComplete || !assetsReady || displayPercent < 100) return;

    const screen = document.getElementById("loading-screen");
    const fade = gsap.to(screen, {
      opacity: 0,
      duration: 0.55,
      ease: "power2.inOut",
      delay: 0.12,
      onComplete: () => {
        setMounted(false);
        onDone();
      },
    });

    return () => {
      fade.kill();
    };
  }, [introComplete, assetsReady, displayPercent, onDone]);

  if (!mounted) return null;

  return (
    <div
      id="loading-screen"
      className="fixed inset-0 z-[10000] bg-void flex items-center justify-center overflow-hidden"
      aria-busy={!assetsReady || displayPercent < 100}
      aria-live="polite"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={displayPercent}
      role="progressbar"
    >
      <div
        id="load-glow"
        className="absolute w-[280px] h-[280px] rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(193,18,31,0.55) 0%, rgba(69,0,0,0.2) 40%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-7 px-6 w-full max-w-sm">
        <p
          id="load-brand"
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-brand text-white opacity-0"
        >
          ARAN ADNAN
        </p>
        <div className="w-48 sm:w-64 overflow-hidden">
          <div id="load-line" className="red-line origin-left scale-x-0" />
        </div>

        <div className="w-full max-w-[14rem] sm:max-w-[16rem] flex flex-col items-center gap-3 opacity-100">
          <div className="load-progress" aria-hidden>
            <div ref={barFillRef} className="load-progress__fill" />
          </div>
          <div className="flex items-center justify-between w-full px-0.5">
            <p
              id="load-sub"
              className="font-body text-[10px] tracking-[0.28em] uppercase text-chrome/50 opacity-0"
            >
              {assetsReady ? "Ready" : "Loading"}
            </p>
            <span
              ref={percentRef}
              className="font-body text-[10px] tracking-[0.2em] tabular-nums text-chrome/55"
            >
              {displayPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
