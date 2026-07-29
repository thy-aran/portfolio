import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Home,
  User,
  Layers,
  GraduationCap,
  FolderKanban,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const links = [
  { href: "#hero", label: "Home", id: "hero", Icon: Home },
  { href: "#about", label: "About", id: "about", Icon: User },
  { href: "#skills", label: "Skills", id: "skills", Icon: Layers },
  { href: "#services", label: "Education", id: "services", Icon: GraduationCap },
  { href: "#projects", label: "Projects", id: "projects", Icon: FolderKanban },
  { href: "#contact", label: "Contact", id: "contact", Icon: Mail },
];

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
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: 0.1 },
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

  const goTo = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(window, {
      duration: reduceMotion ? 0 : 1.1,
      ease: "power2.inOut",
      overwrite: true,
      scrollTo: { y: href, autoKill: true },
    });
  };

  return (
    <header className="nav-header pointer-events-none fixed z-50">
      <nav
        className="nav-dock pointer-events-auto"
        aria-label="Primary"
        onMouseLeave={() => setHovered(null)}
      >
        <div className="relative">
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

          <ul ref={listRef} className="nav-dock__list relative z-[2]">
            {links.map((link) => {
              const isLit = focusId === link.id;
              const Icon = link.Icon;
              return (
                <li key={link.id} className="nav-dock__item">
                  <a
                    href={link.href}
                    aria-label={link.label}
                    title={link.label}
                    className={cn("nav-dock__link", isLit && "is-active")}
                    onClick={(event) => goTo(event, link.href)}
                    onMouseEnter={() => setHovered(link.id)}
                    onFocus={() => setHovered(link.id)}
                    onBlur={() => setHovered(null)}
                  >
                    <Icon strokeWidth={1.5} className="nav-dock__icon" />
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
