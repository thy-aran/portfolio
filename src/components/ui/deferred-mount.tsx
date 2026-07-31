import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";

type DeferredMountProps = {
  children: ReactNode;
  /** Section hash id used by the navbar before the real section mounts */
  id?: string;
  /** How far before the placeholder enters the viewport to mount children */
  rootMargin?: string;
  /** Placeholder height so scroll layout stays stable */
  minHeight?: string | number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Keeps heavy sections out of the first paint; mounts when near the viewport.
 * Visual output is unchanged once mounted — only load timing changes.
 */
export function DeferredMount({
  children,
  id,
  rootMargin = "280px 0px",
  minHeight = "70vh",
  className,
  style,
}: DeferredMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || mounted) return;

    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setMounted(true);
        io.disconnect();
      },
      { rootMargin, threshold: 0.01 },
    );
    io.observe(el);

    // Deep-link / replaceState hash — mount immediately if this section is targeted
    const mountIfHash = () => {
      if (id && window.location.hash === `#${id}`) setMounted(true);
    };
    mountIfHash();
    window.addEventListener("hashchange", mountIfHash);

    const onNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      if (detail?.id === id) setMounted(true);
    };
    window.addEventListener("portfolio:navigate", onNavigate);

    return () => {
      io.disconnect();
      window.removeEventListener("hashchange", mountIfHash);
      window.removeEventListener("portfolio:navigate", onNavigate);
    };
  }, [mounted, rootMargin, id]);

  // Navbar uses history.replaceState (no hashchange) — poll briefly while unmounted
  useEffect(() => {
    if (mounted || !id) return;
    const tick = () => {
      if (window.location.hash === `#${id}`) setMounted(true);
    };
    const timer = window.setInterval(tick, 400);
    return () => window.clearInterval(timer);
  }, [mounted, id]);

  return (
    <div
      ref={ref}
      id={!mounted ? id : undefined}
      className={className}
      style={mounted ? style : { minHeight, ...style }}
    >
      {mounted ? children : null}
    </div>
  );
}
