import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

type Logo = { name: string; slug: string; color: string; mark: string };
type Category = { title: string; tools: string[]; logos: Logo[] };

const categories: Category[] = [
  {
    title: "Frontend",
    tools: ["HTML/CSS", "JavaScript", "React", "GSAP"],
    logos: [
      { name: "HTML5", slug: "html5", color: "E34F26", mark: "H5" },
      { name: "CSS3", slug: "css3", color: "1572B6", mark: "C3" },
      { name: "JavaScript", slug: "javascript", color: "F7DF1E", mark: "JS" },
      { name: "React", slug: "react", color: "61DAFB", mark: "RE" },
      { name: "GSAP", slug: "gsap", color: "0AE448", mark: "GS" },
    ],
  },
  {
    title: "Backend",
    tools: ["Express.js", "Node.js", "PHP", "Dart"],
    logos: [
      { name: "Express.js", slug: "express", color: "FFFFFF", mark: "EX" },
      { name: "Node.js", slug: "nodedotjs", color: "5FA04E", mark: "NO" },
      { name: "PHP", slug: "php", color: "777BB4", mark: "PHP" },
      { name: "Dart", slug: "dart", color: "0175C2", mark: "DA" },
    ],
  },
  {
    title: "Frameworks",
    tools: ["Bootstrap", "Flutter", "Laravel"],
    logos: [
      { name: "Bootstrap", slug: "bootstrap", color: "7952B3", mark: "BS" },
      { name: "Flutter", slug: "flutter", color: "02569B", mark: "FL" },
      { name: "Laravel", slug: "laravel", color: "FF2D20", mark: "LA" },
    ],
  },
  {
    title: "Microsoft Office",
    tools: ["Word", "Excel", "PowerPoint"],
    logos: [
      { name: "Microsoft Word", slug: "microsoftword", color: "2B579A", mark: "W" },
      { name: "Microsoft Excel", slug: "microsoftexcel", color: "217346", mark: "X" },
      { name: "Microsoft PowerPoint", slug: "microsoftpowerpoint", color: "B7472A", mark: "P" },
    ],
  },
  {
    title: "Other Tools",
    tools: ["Git/GitHub", "VS Code", "Cursor AI", "Notion"],
    logos: [
      { name: "Git", slug: "git", color: "F05032", mark: "GI" },
      { name: "GitHub", slug: "github", color: "FFFFFF", mark: "GH" },
      { name: "Visual Studio Code", slug: "visualstudiocode", color: "007ACC", mark: "VS" },
      { name: "Cursor AI", slug: "cursor", color: "FFFFFF", mark: "CU" },
      { name: "Notion", slug: "notion", color: "FFFFFF", mark: "NT" },
    ],
  },
];

function LogoItem({ logo }: { logo: Logo }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="expertise-logo-card">
      {failed ? (
        <span className="expertise-logo-card__fallback" aria-hidden>
          {logo.mark}
        </span>
      ) : (
        <img
          src={`https://cdn.simpleicons.org/${logo.slug}/${logo.color}`}
          alt={`${logo.name} logo`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      <span>{logo.name}</span>
    </div>
  );
}

function LogoGrid({ logos }: { logos: Logo[] }) {
  return (
    <div className="expertise-logo-grid">
      {logos.map((logo) => (
        <LogoItem logo={logo} key={logo.name} />
      ))}
    </div>
  );
}

export function Skills() {
  const root = useRef<HTMLElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const panels = gsap.utils.toArray<HTMLElement>(".expertise-logo-panel", section);
      const steps = categories.length - 1;

      gsap.set(panels, { clearProps: "all" });
      panels.forEach((panel, i) => {
        const cards = panel.querySelectorAll(".expertise-logo-card");
        if (i === 0) {
          gsap.set(panel, { autoAlpha: 1, pointerEvents: "auto" });
          gsap.set(cards, { autoAlpha: 1, y: 0 });
        } else {
          gsap.set(panel, { autoAlpha: 0, pointerEvents: "none" });
          gsap.set(cards, { autoAlpha: 0, y: 16 });
        }
      });

      // Sequence per step: move up → fade out → reveal next (no overlap)
      const timeline = gsap.timeline({ defaults: { ease: "none" } });

      categories.slice(1).forEach((_, index) => {
        const prev = panels[index];
        const next = panels[index + 1];
        const prevCards = prev.querySelectorAll(".expertise-logo-card");
        const nextCards = next.querySelectorAll(".expertise-logo-card");

        timeline.addLabel(`exit-${index}`);

        // 1) lift current tools slightly
        timeline.to(prevCards, {
          y: -16,
          duration: 0.85,
          stagger: 0.03,
        });

        // 2) fade them out after the lift
        timeline.to(prevCards, {
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.02,
        });
        timeline.set(prev, { autoAlpha: 0, pointerEvents: "none" });

        // 3) only then show the next section
        timeline.addLabel(`enter-${index + 1}`);
        timeline.set(next, { autoAlpha: 1, pointerEvents: "auto" });
        timeline.fromTo(
          nextCards,
          { y: 16, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.85,
            stagger: 0.04,
          },
        );

        // brief hold so the new set reads before the next exit
        timeline.to({}, { duration: 0.35 });
      });

      const st = ScrollTrigger.create({
        trigger: section,
        animation: timeline,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * steps * 0.4)}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = Math.min(steps, Math.round(self.progress * steps));
          setActiveIndex((current) => (current === next ? current : next));
        },
      });

      scrollTriggerRef.current = st;
      ScrollTrigger.refresh();

      return () => {
        scrollTriggerRef.current = null;
        st.kill();
      };
    });

    mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
      scrollTriggerRef.current = null;
      const panels = gsap.utils.toArray<HTMLElement>(".expertise-logo-panel", section);
      const cards = gsap.utils.toArray<HTMLElement>(".expertise-logo-card", section);
      gsap.set(panels, { clearProps: "all" });
      gsap.set(cards, { clearProps: "all" });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready?.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, []);

  const selectCategory = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);

    const st = scrollTriggerRef.current;
    if (!st) return;

    const max = categories.length - 1;
    const progress = max === 0 ? 0 : index / max;
    const target = st.start + (st.end - st.start) * progress;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.to(window, {
      duration: reduceMotion ? 0 : 0.7,
      ease: "power2.inOut",
      overwrite: true,
      scrollTo: { y: target, autoKill: true },
    });
  };

  return (
    <section id="skills" ref={root} className="expertise-section relative">
      <div className="ambient-orb w-[480px] h-[480px] bg-blood-glow/15 top-1/2 -translate-y-1/2 right-[-12rem]" />
      <div className="expertise-grid-pattern" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-14 md:py-12">
        <div className="mb-8 md:mb-14 max-w-2xl">
          <p className="section-label">Expertise</p>
          <h2 className="section-title mt-3">
            Tools behind the <span className="text-metallic">work.</span>
          </h2>
          <p className="mt-4 md:mt-5 text-sm md:text-base text-chrome/65 font-light">
            Scroll or tap through the technologies I use to turn ideas into reliable digital
            products.
          </p>
        </div>

        <div className="expertise-layout">
          <div className="expertise-left">
            <nav className="expertise-nav" aria-label="Expertise categories">
              {categories.map((category, index) => (
                <button
                  key={category.title}
                  type="button"
                  className={cn(
                    "expertise-nav__item",
                    index === activeIndex && "is-active",
                  )}
                  aria-current={index === activeIndex ? "true" : undefined}
                  aria-pressed={index === activeIndex}
                  onClick={() => selectCategory(index)}
                >
                  <span className="expertise-nav__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{category.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile: one live grid so category switches always show tools */}
          <div className="expertise-logo-stage expertise-logo-stage--mobile md:hidden">
            <LogoGrid logos={categories[activeIndex].logos} key={categories[activeIndex].title} />
            <div className="expertise-progress" aria-hidden>
              <span
                style={{
                  transform: `scaleX(${(activeIndex + 1) / categories.length})`,
                }}
              />
            </div>
          </div>

          {/* Desktop: stacked panels for ScrollTrigger */}
          <div className="expertise-logo-stage expertise-logo-stage--desktop hidden md:block">
            <div className="expertise-stage-orbit" aria-hidden />
            {categories.map((category, index) => (
              <div
                key={category.title}
                className={cn(
                  "expertise-logo-panel",
                  index === activeIndex && "is-active",
                )}
                data-category={index}
                aria-hidden={index !== activeIndex}
              >
                <LogoGrid logos={category.logos} />
              </div>
            ))}
            <div className="expertise-progress" aria-hidden>
              <span
                style={{
                  transform: `scaleX(${(activeIndex + 1) / categories.length})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
