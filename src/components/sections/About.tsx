import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { PerspectiveMarquee } from "../ui/perspective-marquee";
import { asset } from "@/lib/asset";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const stats = [
  { value: "5", label: "Projects" },
  { value: "10", label: "Technologies" },
  { value: "4", label: "Years of Experience" },
];

const marqueeItems = stats.map((stat) => (
  <Fragment key={stat.label}>
    <span className="perspective-marquee__value">{stat.value}</span>
    <span className="perspective-marquee__label">{stat.label}</span>
  </Fragment>
));

export function About() {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      gsap.from(".about-reveal", {
        autoAlpha: 0,
        y: reduceMotion ? 0 : 28,
        duration: reduceMotion ? 0 : 0.75,
        stagger: reduceMotion ? 0 : 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root.current,
          // Fire as soon as About enters the viewport (was top 78%)
          start: "clamp(top 96%)",
          once: true,
        },
      });

      if (reduceMotion || !title.current) return;

      gsap.to(title.current, {
        duration: 1.5,
        ease: "none",
        scrambleText: {
          text: "{original}",
          chars: "upperAndLowerCase",
          speed: 0.55,
          revealDelay: 0.3,
        },
        scrollTrigger: {
          trigger: title.current,
          start: "top 96%",
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={root}
      className="about-section relative py-20 md:py-24"
    >
      <div className="ambient-orb w-[460px] h-[460px] bg-blood-deep/45 top-1/3 -translate-y-1/2 -left-32" />
      <div className="ambient-orb w-[320px] h-[320px] bg-blood-mid/20 bottom-0 -right-32" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          <div className="about-reveal lg:col-span-5">
            <div className="about-portrait">
              <img
                src={asset("assets/images/about-me.png")}
                alt="Aran Adnan in profile against a red illuminated ring"
                className="about-portrait__image"
                loading="eager"
                decoding="sync"
                fetchPriority="high"
                width={620}
                height={775}
              />
              <div className="about-portrait__ring" aria-hidden />
              <div className="about-portrait__chase" aria-hidden />
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="about-reveal section-label">About Me</p>
            <h2 ref={title} className="section-title mt-5">
              Who am I?
            </h2>
            <div className="about-reveal red-line w-24 mt-6" />

            <div className="about-copy mt-8 space-y-5 text-[0.98rem] md:text-[1.04rem] text-chrome/70 font-light leading-relaxed">
              <p className="split-lines">
                I’m Aran Adnan, an Information Technology graduate and Computer Science
                enthusiast dedicated to continuous learning and technical excellence.
                While I have broad knowledge across the IT landscape, my primary focus is
                Full-Stack Development. I love building impactful applications, many of
                which leverage the tools and technologies detailed in my Expertise section.
              </p>
              <p className="split-lines">
                Beyond code, I am deeply inspired by art, philosophy, and physics.
                Embracing this creative side fuels my problem-solving and inspires unique,
                out-of-the-box technical solutions.
              </p>
              <p className="split-lines">
                I approach my work with strong determination and a high standard for
                quality—aiming to deliver distinct, polished results. A reliable team
                player, I thrive in fast-paced environments and pride myself on delivering
                clear, high-quality outcomes even under tight deadlines.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PerspectiveMarquee
        className="about-reveal about-marquee mt-16 md:mt-20"
        label="Highlights"
        items={marqueeItems}
      />
    </section>
  );
}
