import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  Home,
  User,
  Layers,
  GraduationCap,
  FolderKanban,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollToPlugin);

const links = [
  { href: "#hero", label: "Home", id: "hero", Icon: Home },
  { href: "#about", label: "About", id: "about", Icon: User },
  { href: "#skills", label: "Skills", id: "skills", Icon: Layers },
  { href: "#services", label: "Education", id: "services", Icon: GraduationCap },
  { href: "#projects", label: "Projects", id: "projects", Icon: FolderKanban },
  { href: "#contact", label: "Contact", id: "contact", Icon: Mail },
];

/** Scroll to a section, accounting for ScrollTrigger pin spacers in document flow. */
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.killTweensOf(window);

  const y =
    id === "hero" ? 0 : Math.max(0, Math.round(window.scrollY + el.getBoundingClientRect().top));

  if (reduceMotion) {
    window.scrollTo(0, y);
    return;
  }

  // Distance-scaled duration so long jumps still finish cleanly
  const distance = Math.abs(window.scrollY - y);
  const duration = Math.min(1.35, Math.max(0.55, distance / 3500));

  // autoKill:false — pin scrub updates can look like user scroll and abort the tween
  gsap.to(window, {
    duration,
    ease: "power2.inOut",
    overwrite: true,
    scrollTo: {
      y,
      autoKill: false,
    },
  });
}

export function Navbar() {
  const [active, setActive] = useState("hero");
  const [hovered, setHovered] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [spotlightPos, setSpotlightPos] = useState(22);

  const focusId = hovered ?? active;
  const focusIndex = Math.max(
    0,
    links.findIndex((l) => l.id === focusId),
  );

  useEffect(() => {
    const ids = links.map((l) => l.id);
    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer the entry closest to the viewport center
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - window.innerHeight / 2) -
              Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - window.innerHeight / 2),
          );
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.08, 0.2, 0.4] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      const item = list.children[focusIndex] as HTMLElement | undefined;
      if (!item) return;
      const listRect = list.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      setSpotlightPos(itemRect.left - listRect.left + itemRect.width / 2);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [focusIndex]);

  const goTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    event.stopPropagation();
    setActive(id);
    setHovered(null);
    scrollToSection(id);
    try {
      history.replaceState(null, "", `#${id}`);
    } catch {
      /* ignore */
    }
  };

  return (
    <header className="nav-header">
      <nav
        className="nav-dock"
        aria-label="Primary"
        onMouseLeave={() => setHovered(null)}
      >
        <div className="nav-dock__inner">
          <div
            className="nav-dock__spotlight"
            aria-hidden
            style={{
              transform: `translateX(calc(${spotlightPos}px - 50%))`,
            }}
          >
            <span className="nav-dock__lamp" />
            <span className="nav-dock__beam" />
            <span className="nav-dock__floor" />
          </div>

          <ul ref={listRef} className="nav-dock__list">
            {links.map((link) => {
              const isLit = focusId === link.id;
              const Icon = link.Icon;
              return (
                <li key={link.id} className="nav-dock__item">
                  <a
                    href={link.href}
                    aria-label={link.label}
                    title={link.label}
                    aria-current={active === link.id ? "true" : undefined}
                    className={cn("nav-dock__link", isLit && "is-active")}
                    onClick={(event) => goTo(event, link.id)}
                    onMouseEnter={() => setHovered(link.id)}
                    onFocus={() => setHovered(link.id)}
                    onBlur={() => setHovered(null)}
                  >
                    <Icon strokeWidth={1.5} className="nav-dock__icon" aria-hidden />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}
