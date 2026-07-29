import { useEffect } from "react";
import { bindSplitLines, querySplitLineTargets } from "@/lib/split-lines";

/**
 * Binds the portfolio line-split scroll effect to every `.split-lines` node,
 * including elements added later (MutationObserver).
 */
export function useSplitLines() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanups = new Map<HTMLElement, () => void>();

    const bind = (el: HTMLElement) => {
      if (cleanups.has(el)) return;
      cleanups.set(el, bindSplitLines(el));
    };

    querySplitLineTargets(document).forEach(bind);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.classList.contains("split-lines")) bind(node);
          node.querySelectorAll<HTMLElement>(".split-lines").forEach(bind);
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cleanups.forEach((dispose) => dispose());
      cleanups.clear();
    };
  }, []);
}
