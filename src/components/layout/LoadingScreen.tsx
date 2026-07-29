import { useEffect, useState } from "react";
import gsap from "gsap";

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const glow = document.getElementById("load-glow");
    const brand = document.getElementById("load-brand");
    const line = document.getElementById("load-line");
    const sub = document.getElementById("load-sub");
    const screen = document.getElementById("loading-screen");

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.to(screen, {
          opacity: 0,
          duration: 0.85,
          ease: "power2.inOut",
          onComplete: () => {
            setMounted(false);
            onDone();
          },
        });
      },
    });

    tl.to(glow, { opacity: 1, scale: 1.15, duration: 1.1 })
      .fromTo(brand, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.85 }, "-=0.55")
      .to(line, { scaleX: 1, duration: 0.8 }, "-=0.3")
      .to(sub, { opacity: 1, duration: 0.45 }, "-=0.25")
      .to({}, { duration: 0.4 });
  }, [onDone]);

  if (!mounted) return null;

  return (
    <div
      id="loading-screen"
      className="fixed inset-0 z-[10000] bg-void flex items-center justify-center overflow-hidden"
      aria-hidden
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
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        <p
          id="load-brand"
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-brand text-white opacity-0"
        >
          ARAN ADNAN
        </p>
        <div className="w-48 sm:w-64 overflow-hidden">
          <div id="load-line" className="red-line origin-left scale-x-0" />
        </div>
        <p
          id="load-sub"
          className="font-body text-[10px] tracking-[0.35em] uppercase text-chrome/50 opacity-0"
        >
          Portfolio Experience
        </p>
      </div>
    </div>
  );
}
