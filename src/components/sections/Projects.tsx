import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { projects, type Project, type ProjectDevice } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

type ViewerState = { project: number; shot: number };

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function deviceOf(project: Project): ProjectDevice {
  return project.device ?? "laptop";
}

function originSelector(device: ProjectDevice) {
  return device === "phone"
    ? ".macbook-project__trigger .iphone__frame"
    : ".macbook-project__trigger .macbook__lid";
}

type DevicePreviewProps = {
  project: Project;
  index: number;
  full?: boolean;
  imgRef?: React.RefObject<HTMLImageElement | null>;
  shotSrc?: string;
  shotAlt?: string;
};

function DevicePreview({
  project,
  index,
  full = false,
  imgRef,
  shotSrc,
  shotAlt,
}: DevicePreviewProps) {
  const src = shotSrc ?? project.shots[0];
  const alt =
    shotAlt ??
    `${project.name} ${deviceOf(project) === "phone" ? "app" : "website"} preview`;
  const device = deviceOf(project);

  if (device === "phone") {
    return (
      <div className={full ? "iphone iphone--full" : "iphone"}>
        <div className="iphone__frame">
          <span className="iphone__notch" aria-hidden />
          <span className="iphone__speaker" aria-hidden />
          <span className="iphone__camera" aria-hidden />
          <div className="iphone__screen">
            <img
              ref={imgRef}
              key={src}
              src={src}
              alt={alt}
              className="iphone__preview"
              loading={full ? undefined : "lazy"}
            />
            {!full && (
              <>
                <div className="iphone__screen-shade" />
                <div className="iphone__screen-label">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{project.shots.length} screens</span>
                </div>
              </>
            )}
          </div>
          <span className="iphone__home" aria-hidden />
        </div>
        <div className="iphone__shadow" aria-hidden />
      </div>
    );
  }

  return (
    <div className={full ? "macbook macbook--full" : "macbook"}>
      <div className="macbook__lid">
        <span className="macbook__camera" aria-hidden />
        <div className="macbook__screen">
          <img
            ref={imgRef}
            key={src}
            src={src}
            alt={alt}
            className="macbook__preview"
            loading={full ? undefined : "lazy"}
          />
          {!full && (
            <>
              <div className="macbook__screen-shade" />
              <div className="macbook__screen-label">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{project.shots.length} screens</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="macbook__base">
        <span className="macbook__notch" aria-hidden />
      </div>
      <div className="macbook__shadow" aria-hidden />
    </div>
  );
}

export function Projects() {
  const root = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const shotImg = useRef<HTMLImageElement>(null);
  const originRect = useRef<DOMRect | null>(null);
  const stageRect = useRef<DOMRect | null>(null);
  const direction = useRef(1);
  const isClosing = useRef(false);
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  const active = viewer ? projects[viewer.project] : null;

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

      gsap.utils
        .toArray<HTMLElement>(".macbook-project__trigger .macbook", section)
        .forEach((laptop) => {
          const lid = laptop.querySelector<HTMLElement>(".macbook__lid");
          if (!lid) return;
          gsap.to(lid, {
            rotationX: -86,
            y: 8,
            transformOrigin: "bottom center",
            ease: "none",
            scrollTrigger: {
              trigger: laptop,
              // Mobile: stay open until the whole laptop is above mid-screen,
              // then ease closed over the remaining upward travel.
              start: () => (isMobile() ? "bottom center" : "bottom 72%"),
              end: () => (isMobile() ? "bottom 8%" : "bottom 18%"),
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          });
        });

      gsap.utils
        .toArray<HTMLElement>(".macbook-project__trigger .iphone", section)
        .forEach((phone) => {
          gsap.fromTo(
            phone,
            { y: 28, rotateZ: -2 },
            {
              y: -12,
              rotateZ: 2,
              ease: "none",
              scrollTrigger: {
                trigger: phone,
                start: () => (isMobile() ? "top 80%" : "top 75%"),
                end: () => (isMobile() ? "bottom 25%" : "bottom 20%"),
                scrub: 0.7,
                invalidateOnRefresh: true,
              },
            },
          );
        });
    });

    return () => mm.revert();
  }, []);

  const openViewer = (index: number, event: React.MouseEvent<HTMLElement>) => {
    const card = event.currentTarget.closest("article");
    const source = card?.querySelector<HTMLElement>(
      originSelector(deviceOf(projects[index])),
    );
    originRect.current = source?.getBoundingClientRect() ?? null;
    direction.current = 1;
    setViewer({ project: index, shot: 0 });
  };

  const close = useCallback(() => {
    const overlayEl = overlay.current;
    const stageEl = stage.current;
    if (!overlayEl || !stageEl || isClosing.current) {
      setViewer(null);
      return;
    }
    isClosing.current = true;

    const finish = () => {
      isClosing.current = false;
      setViewer(null);
    };

    if (reduced()) {
      finish();
      return;
    }

    const origin = originRect.current;
    const target = stageRect.current;
    gsap.killTweensOf([stageEl, overlayEl]);

    const tl = gsap.timeline({ onComplete: finish });
    tl.to(
      overlayEl.querySelectorAll(".project-viewer__ui"),
      { autoAlpha: 0, duration: 0.2, ease: "power2.in" },
      0,
    );

    if (origin && target) {
      tl.to(
        stageEl,
        {
          x: origin.left + origin.width / 2 - (target.left + target.width / 2),
          y: origin.top + origin.height / 2 - (target.top + target.height / 2),
          scale: origin.width / target.width,
          opacity: 0.35,
          duration: 0.55,
          ease: "power3.inOut",
        },
        0,
      );
    } else {
      tl.to(
        stageEl,
        { scale: 0.92, autoAlpha: 0, duration: 0.35, ease: "power2.in" },
        0,
      );
    }

    tl.to(overlayEl, { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, 0.15);
  }, []);

  const step = useCallback((dir: number) => {
    direction.current = dir;
    setViewer((current) => {
      if (!current) return current;
      const total = projects[current.project].shots.length;
      return { ...current, shot: (current.shot + dir + total) % total };
    });
  }, []);

  const goTo = useCallback((shot: number) => {
    setViewer((current) => {
      if (!current) return current;
      direction.current = shot > current.shot ? 1 : -1;
      return { ...current, shot };
    });
  }, []);

  useEffect(() => {
    if (!viewer) return;
    const overlayEl = overlay.current;
    const stageEl = stage.current;
    if (!overlayEl || !stageEl) return;

    stageRect.current = stageEl.getBoundingClientRect();
    if (reduced()) return;

    const origin = originRect.current;
    const target = stageRect.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        overlayEl,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
        0,
      );

      if (origin) {
        tl.fromTo(
          stageEl,
          {
            x: origin.left + origin.width / 2 - (target.left + target.width / 2),
            y: origin.top + origin.height / 2 - (target.top + target.height / 2),
            scale: origin.width / target.width,
            opacity: 0.4,
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.78,
            ease: "power3.inOut",
          },
          0,
        );
      } else {
        tl.fromTo(
          stageEl,
          { scale: 0.92, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
          0,
        );
      }

      tl.fromTo(
        overlayEl.querySelectorAll(".project-viewer__ui"),
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        },
        0.34,
      );
    }, overlayEl);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer?.project]);

  useEffect(() => {
    const img = shotImg.current;
    if (!viewer || !img || reduced()) return;
    gsap.fromTo(
      img,
      { autoAlpha: 0, xPercent: direction.current * 5 },
      { autoAlpha: 1, xPercent: 0, duration: 0.45, ease: "power2.out" },
    );
  }, [viewer?.project, viewer?.shot, viewer]);

  useEffect(() => {
    if (!viewer) return;

    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          close();
          break;
        case "ArrowRight":
          event.preventDefault();
          step(1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          step(-1);
          break;
        case " ":
        case "PageDown":
        case "PageUp":
        case "Home":
        case "End":
          event.preventDefault();
          break;
      }
    };
    const block = (event: Event) => event.preventDefault();

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
    };
  }, [viewer, close, step]);

  useEffect(() => {
    if (!viewer || !active) return;
    const total = active.shots.length;
    [1, -1].forEach((offset) => {
      const img = new Image();
      img.src = active.shots[(viewer.shot + offset + total) % total];
    });
  }, [viewer, active]);

  return (
    <section
      id="projects"
      ref={root}
      className="projects-showcase relative py-20 md:py-24"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="ambient-orb w-[500px] h-[500px] bg-blood-mid/25 top-1/3 left-1/3" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <div className="mb-16 md:mb-20 max-w-2xl">
          <p className="section-label">Selected Work</p>
          <h2 className="section-title split-lines mt-3">
            Featured <span className="text-metallic">projects</span>
          </h2>
          <p className="split-lines mt-5 text-chrome/55 font-light">
            A selection of web and mobile experiences presented in their natural
            habitat. Open any device to walk through the full interface.
          </p>
        </div>

        <div className="projects-list">
          {projects.map((project, index) => {
            const device = deviceOf(project);
            return (
              <article
                key={project.id}
                className={`macbook-project group${device === "phone" ? " macbook-project--phone" : ""}`}
              >
                <button
                  type="button"
                  className="macbook-project__trigger"
                  onClick={(event) => openViewer(index, event)}
                  aria-label={`View ${project.name} screenshots`}
                >
                  <DevicePreview project={project} index={index} />
                </button>

                <div className="macbook-project__body">
                  <p className="macbook-project__tagline split-lines">
                    {project.tagline}
                  </p>
                  <h3 className="split-lines">{project.name}</h3>
                  <ul className="macbook-project__tech">
                    {project.tech.map((item) => (
                      <li key={item} className="split-lines">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="macbook-project__desc split-lines">
                    {project.description}
                  </p>
                  <button
                    type="button"
                    className="macbook-project__link"
                    onClick={(event) => openViewer(index, event)}
                  >
                    {device === "phone" ? "View app" : "View website"}
                    <ArrowUpRight aria-hidden />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {viewer && active && (
        <div
          className={`project-viewer${deviceOf(active) === "phone" ? " project-viewer--phone" : ""}`}
          ref={overlay}
          role="dialog"
          aria-modal="true"
          aria-label={`${active.name} screenshots`}
        >
          <button
            type="button"
            className="project-viewer__backdrop"
            onClick={close}
            aria-label="Close preview"
            tabIndex={-1}
          />

          <button
            type="button"
            className="project-viewer__close project-viewer__ui"
            onClick={close}
            aria-label="Close preview"
          >
            <X aria-hidden />
          </button>

          <div className="project-viewer__frame">
            <button
              type="button"
              className="project-viewer__nav project-viewer__nav--prev project-viewer__ui"
              onClick={() => step(-1)}
              aria-label="Previous screenshot"
            >
              <ChevronLeft aria-hidden />
            </button>

            <div className="project-viewer__stage" ref={stage}>
              <DevicePreview
                project={active}
                index={viewer.project}
                full
                imgRef={shotImg}
                shotSrc={active.shots[viewer.shot]}
                shotAlt={`${active.name} screen ${viewer.shot + 1} of ${active.shots.length}`}
              />
            </div>

            <button
              type="button"
              className="project-viewer__nav project-viewer__nav--next project-viewer__ui"
              onClick={() => step(1)}
              aria-label="Next screenshot"
            >
              <ChevronRight aria-hidden />
            </button>
          </div>

          <div className="project-viewer__meta project-viewer__ui">
            <span className="project-viewer__name">{active.name}</span>
            <span className="project-viewer__count">
              {String(viewer.shot + 1).padStart(2, "0")}
              <i>/</i>
              {String(active.shots.length).padStart(2, "0")}
            </span>
            <span className="project-viewer__dots">
              {active.shots.map((shot, i) => (
                <button
                  key={shot}
                  type="button"
                  className={i === viewer.shot ? "is-active" : undefined}
                  onClick={() => goTo(i)}
                  aria-label={`Screenshot ${i + 1}`}
                  aria-current={i === viewer.shot}
                />
              ))}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
