import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ChevronsDown } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(SplitText, ScrollTrigger);

type Achievement = {
  index: string;
  title: string;
  place: string;
  detail: string;
  image: string;
  imageAlt: string;
  href?: string;
};

const achievements: Achievement[] = [
  {
    index: "01",
    title: "Bachelor Degree of Information Technology",
    place: "Sulaimani Polytechnic University",
    detail: "9/2022 — 6/2026",
    image: "/assets/images/education/spu.png",
    imageAlt: "Sulaimani Polytechnic University logo",
  },
  {
    index: "02",
    title: "IT Intern",
    place: "Asiacell Telecommunications",
    detail: "07/2025 — 09/2025",
    image: "/assets/images/education/asiacell.png",
    imageAlt: "Asiacell logo",
  },
  {
    index: "03",
    title: "IT Intern",
    place: "Dyar Real Estate Company",
    detail: "06/2025 — 07/2025",
    image: "/assets/images/education/dyar.png",
    imageAlt: "Dyar Real Estate logo",
  },
  {
    index: "04",
    title: "Microsoft Excel Certification",
    place: "Udemy",
    detail: "View certificate",
    href: "https://www.udemy.com/certificate/UC-4892e095-250e-4e07-85e3-de6ccc39214a",
    image: "/assets/images/education/udemy.png",
    imageAlt: "Udemy logo",
  },
];

function EducationCardContent({
  item,
  expanded = false,
}: {
  item: Achievement;
  expanded?: boolean;
}) {
  return (
    <>
      <span className="education-card__glow" aria-hidden />
      <div className="education-card__inner">
        <div className="education-card__logo">
          <img src={item.image} alt={item.imageAlt} loading="lazy" />
        </div>
        <div className="education-card__body">
          <span className="education-card__index">{item.index}</span>
          <h3 className="education-card__title">{item.title}</h3>
          <p className="education-card__place">{item.place}</p>
          {item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="education-card__detail education-card__link"
              onClick={(e) => e.stopPropagation()}
              tabIndex={expanded ? 0 : undefined}
            >
              {item.detail}
            </a>
          ) : (
            <p className="education-card__detail">{item.detail}</p>
          )}
        </div>
      </div>
    </>
  );
}

export function Services() {
  const root = useRef<HTMLDivElement>(null);
  const horizontal = useRef<HTMLElement>(null);
  const text = useRef<HTMLHeadingElement>(null);
  const prompt = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);
  const active = achievements.find((item) => item.index === expanded) ?? null;

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openCard = (index: string) => {
    clearCloseTimer();
    setExpanded(index);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setExpanded(null), 280);
  };

  useEffect(() => () => clearCloseTimer(), []);


  useEffect(() => {
    const wrapper = horizontal.current;
    const heading = text.current;
    if (!wrapper || !heading || !root.current) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const split = SplitText.create(heading, {
        type: "words, chars",
        wordsClass: "word",
        charsClass: "char",
        smartWrap: true,
        aria: "auto",
      });
      // The heading starts a full viewport to the right, so the pinned section
      // reads as empty until the user scrolls. The prompt fades as the copy
      // travels toward it and is gone once the first word is CLEARANCE away.
      const CLEARANCE = 45;
      const promptEl = prompt.current;
      const promptText = promptEl?.querySelector<HTMLElement>(
        ".services-horizontal__prompt-text",
      );
      const firstChar = split.chars[0] as HTMLElement | undefined;

      const syncPrompt = () => {
        if (!promptEl || !promptText || !firstChar) return;
        const edge = promptText.getBoundingClientRect().right;
        const gap = firstChar.getBoundingClientRect().left - edge;
        const span = Math.max(1, window.innerWidth - edge - CLEARANCE);
        const visible = gsap.utils.clamp(0, 1, (gap - CLEARANCE) / span);
        gsap.set(promptEl, {
          autoAlpha: visible,
          scale: 0.94 + visible * 0.06,
          y: (1 - visible) * -12,
        });
      };

      // Stop the travel with the closing word parked in the middle of the
      // screen, so the pin releases into the next section instead of holding
      // an empty viewport after the copy has swept past.
      const lastWord = split.words[split.words.length - 1] as HTMLElement;
      const travel = () => {
        const centred =
          lastWord.offsetLeft + lastWord.offsetWidth / 2 - window.innerWidth / 2;
        return Math.max(0, centred);
      };
      // Two pixels of copy per pixel of scroll, matching the previous pace.
      const SCROLL_RATIO = 0.5;

      const scrollTween = gsap.to(heading, {
        x: () => -travel(),
        ease: "none",
        onUpdate: syncPrompt,
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: () => `+=${Math.max(Math.round(travel() * SCROLL_RATIO), 800)}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: syncPrompt,
        },
      });

      syncPrompt();

      gsap.set(split.chars, { force3D: true });

      // The closing word stops at centre, so its letters have to finish
      // settling further right than the rest or they'd freeze mid-tumble.
      const closingChars = new Set<Element>(lastWord.querySelectorAll(".char"));

      split.chars.forEach((char) => {
        gsap.from(char, {
          yPercent: gsap.utils.random(-180, 180),
          rotation: gsap.utils.random(-18, 18),
          autoAlpha: 0.2,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: char,
            containerAnimation: scrollTween,
            start: "left 100%",
            end: closingChars.has(char) ? "left 74%" : "left 30%",
            scrub: 0.8,
          },
        });
      });

      ScrollTrigger.refresh();
      return () => {
        split.revert();
        if (promptEl) gsap.set(promptEl, { clearProps: "all" });
      };
    });

    // Mobile: split words for gradient + hover enlarge (no horizontal pin)
    mm.add("(max-width: 767px)", () => {
      const split = SplitText.create(heading, {
        type: "words",
        wordsClass: "word",
        smartWrap: true,
        aria: "auto",
      });
      heading.classList.add("services-horizontal__text--mobile");
      split.words.forEach((word, i) => {
        (word as HTMLElement).style.setProperty("--word-i", String(i));
      });
      return () => {
        heading.classList.remove("services-horizontal__text--mobile");
        split.revert();
      };
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready?.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  const canHoverExpand = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  return (
    <div ref={root}>
      <section id="services" ref={horizontal} className="services-horizontal">
        <div className="services-horizontal__grid" aria-hidden />
        <div className="services-horizontal__orb" aria-hidden />
        <div className="services-horizontal__eyebrow">
          <span>Services</span>
          <span className="services-horizontal__line" />
          <span>Creative engineering</span>
        </div>
        <h2 ref={text} className="services-horizontal__text">
          With a mix of creativity and knowledge, I develop unique and never-seen-before projects
        </h2>
        <div ref={prompt} className="services-horizontal__prompt" aria-hidden>
          <span className="services-horizontal__prompt-glow" />
          <span className="services-horizontal__mouse">
            <span className="services-horizontal__wheel" />
          </span>
          <span className="services-horizontal__prompt-text">Scroll to read</span>
          <ChevronsDown className="services-horizontal__chevron" strokeWidth={1.75} />
        </div>
      </section>

      <section className="services-list relative py-20 md:py-24 overflow-hidden">
        <div className="ambient-orb w-[420px] h-[420px] bg-blood-deep/35 top-1/2 -translate-y-1/2 -right-40" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-10">
          <div className="mb-14 md:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-xl">
              <p className="section-label">Educational Journey</p>
              <h2 className="section-title mt-3">
                Path of <span className="text-metallic">growth</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm text-chrome/55 font-light">
              Degree work, internships, and certifications that shaped how I build.
            </p>
          </div>

          <div className={cn("education-grid", expanded && "is-dimmed")}>
            {achievements.map((item) => (
              <button
                key={item.index}
                type="button"
                className={cn(
                  "education-card",
                  expanded === item.index && "is-active",
                )}
                onMouseEnter={() => {
                  if (canHoverExpand()) openCard(item.index);
                }}
                onMouseLeave={() => {
                  if (canHoverExpand()) scheduleClose();
                }}
                onClick={() => {
                  if (canHoverExpand()) {
                    openCard(item.index);
                    return;
                  }
                  setExpanded((current) => (current === item.index ? null : item.index));
                }}
                aria-expanded={expanded === item.index}
              >
                <EducationCardContent item={item} />
              </button>
            ))}
          </div>
        </div>

        {active && (
          <>
            <button
              type="button"
              className="education-backdrop"
              aria-label="Close expanded card"
              onClick={() => setExpanded(null)}
            />
            <article
              className="education-card education-card--overlay is-expanded"
              onMouseEnter={() => {
                if (canHoverExpand()) clearCloseTimer();
              }}
              onMouseLeave={() => {
                if (canHoverExpand()) scheduleClose();
              }}
            >
              <EducationCardContent item={active} expanded />
            </article>
          </>
        )}
      </section>
    </div>
  );
}
