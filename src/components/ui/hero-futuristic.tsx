"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Github, Linkedin } from "lucide-react";
import gsap from "gsap";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

/** Lazy: keeps three/webgpu out of the initial JS parse */
const HeroWebGPUCanvas = lazy(
  () => import("@/components/ui/hero-webgpu-canvas"),
);

function ScanText({
  children,
  className = "",
  as: Tag = "span",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "p" | "div" | "h1";
  style?: React.CSSProperties;
}) {
  return (
    <Tag className={`hero-scan-text ${className}`} style={style}>
      <span className="hero-scan-text__base">{children}</span>
      <span className="hero-scan-text__glow" aria-hidden>
        {children}
      </span>
    </Tag>
  );
}

function ScanTitle({
  words,
  visibleWords,
  delays,
}: {
  words: string[];
  visibleWords: number;
  delays: number[];
}) {
  return (
    <>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={index < visibleWords ? "fade-in" : "opacity-0"}
          style={{ animationDelay: `${index * 0.13 + (delays[index] || 0)}s` }}
        >
          <ScanText
            className={
              index === words.length - 1
                ? "hero-scan-text--metallic"
                : "hero-scan-text--white"
            }
          >
            {word}
          </ScanText>
        </span>
      ))}
    </>
  );
}

export type HeroFuturisticProps = {
  title?: string;
  role?: string;
  subtitle?: string;
  onExplore?: () => void;
  /** Mount WebGPU only after the loading overlay is gone so the canvas gets real size */
  active?: boolean;
};

export function HeroFuturistic({
  title = "ARAN ADNAN",
  role = "Web Developer",
  active = true,
}: Pick<HeroFuturisticProps, "title" | "role" | "active">) {
  const titleWords = title.split(" ");
  const roleWords = role.split(" ");
  const [visibleWords, setVisibleWords] = useState(0);
  const [visibleRoleWords, setVisibleRoleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);
  const [roleDelays, setRoleDelays] = useState<number[]>([]);
  const [objectReady, setObjectReady] = useState(false);
  const [loaderMounted, setLoaderMounted] = useState(true);
  const resumeButtonRef = useRef<HTMLAnchorElement>(null);

  const handleObjectReady = useCallback(() => {
    setObjectReady(true);
  }, []);

  useEffect(() => {
    if (!active) {
      setObjectReady(false);
      setLoaderMounted(true);
    }
  }, [active]);

  useEffect(() => {
    if (!active || objectReady) return;
    const timer = window.setTimeout(() => setObjectReady(true), 12000);
    return () => window.clearTimeout(timer);
  }, [active, objectReady]);

  useEffect(() => {
    if (!objectReady) return;
    const timer = window.setTimeout(() => setLoaderMounted(false), 700);
    return () => window.clearTimeout(timer);
  }, [objectReady]);

  const handleResumePointerMove = (
    event: ReactPointerEvent<HTMLAnchorElement>,
  ) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const progress = gsap.utils.clamp(0, 1, x / rect.width);

    gsap.to(button, {
      "--pointer-x": `${x}px`,
      "--pointer-y": `${y}px`,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(button, {
      "--button-glow": gsap.utils.interpolate("#c1121f", "#e8e8e8", progress),
      duration: 0.2,
      overwrite: "auto",
    });
  };

  useEffect(() => {
    setDelays(titleWords.map(() => Math.random() * 0.07));
  }, [titleWords.length]);

  useEffect(() => {
    setRoleDelays(roleWords.map(() => Math.random() * 0.07));
  }, [roleWords.length]);

  useEffect(() => {
    const button = resumeButtonRef.current;
    return () => {
      if (button) gsap.killTweensOf(button);
    };
  }, []);

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords((v) => v + 1), 600);
      return () => clearTimeout(timeout);
    }
    if (visibleRoleWords < roleWords.length) {
      const timeout = setTimeout(() => setVisibleRoleWords((v) => v + 1), 400);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setSubtitleVisible(true), 500);
    return () => clearTimeout(timeout);
  }, [visibleWords, titleWords.length, visibleRoleWords, roleWords.length]);

  return (
    <div className="hero-stage relative h-svh min-h-[100dvh] w-full overflow-hidden">
      <div className="hero-stage__plate" aria-hidden />

      <div className="ambient-orb w-[520px] h-[520px] bg-blood-mid/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow z-[1]" />
      <div className="ambient-orb w-[380px] h-[380px] bg-blood-glow/12 top-[40%] left-[55%] z-[1]" />
      <div
        className="absolute inset-0 opacity-15 z-[1] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(192, 192, 192, 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {active ? (
        <Suspense fallback={null}>
          <HeroWebGPUCanvas onReady={handleObjectReady} />
        </Suspense>
      ) : null}

      {active && loaderMounted ? (
        <div
          className={cn("hero-object-loader", objectReady && "is-done")}
          role="status"
          aria-live="polite"
          aria-busy={!objectReady}
        >
          <div className="hero-object-loader__glow" aria-hidden />
          <p className="hero-object-loader__label">Wait for object to load</p>
          <div className="hero-object-loader__track" aria-hidden>
            <span className="hero-object-loader__beam" />
          </div>
        </div>
      ) : null}

      <div className="hero-stage__scrim" aria-hidden />
      <div className="hero-scan-beam pointer-events-none z-[15]" aria-hidden />

      <div className="hero-copy">
        <h1 className="hero-name font-display text-4xl sm:text-5xl xl:text-6xl font-extrabold uppercase tracking-tight leading-[0.95]">
          <span className="flex flex-col items-center sm:items-start gap-y-1 md:gap-y-2">
            <ScanTitle
              words={titleWords}
              visibleWords={visibleWords}
              delays={delays}
            />
          </span>
        </h1>

        <span className="hero-copy__rule" aria-hidden />

        <p className="hero-role font-display text-4xl sm:text-5xl xl:text-6xl font-extrabold uppercase tracking-tight leading-[0.95]">
          <span className="flex flex-col items-center sm:items-end gap-y-1 md:gap-y-2">
            <ScanTitle
              words={roleWords}
              visibleWords={visibleRoleWords}
              delays={roleDelays}
            />
          </span>
        </p>
      </div>

      <div
        className={`hero-hud z-20 ${
          subtitleVisible ? "fade-in-subtitle" : "opacity-0"
        }`}
      >
        <div className="hero-actions" aria-label="Profile links">
          <a
            ref={resumeButtonRef}
            className="glow-button"
            href={asset("assets/docs/resume.pdf")}
            target="_blank"
            rel="noopener noreferrer"
            onPointerMove={handleResumePointerMove}
          >
            <span>View My Resume</span>
            <div className="gradient" aria-hidden />
          </a>
          <a
            className="hero-social-link"
            href="https://github.com/thy-aran"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Aran's GitHub profile"
          >
            <Github aria-hidden />
          </a>
          <a
            className="hero-social-link"
            href="https://www.linkedin.com/in/aran-adnan-v711/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Aran's LinkedIn profile"
          >
            <Linkedin aria-hidden />
          </a>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-36 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,5,0.28) 0%, rgba(5,5,5,0.08) 45%, transparent 100%)",
        }}
      />
    </div>
  );
}
