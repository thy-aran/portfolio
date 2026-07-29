import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Mark applied so MutationObserver / re-runs skip already-bound nodes. */
export const SPLIT_LINES_ATTR = "data-split-lines-ready";

/**
 * GSAP responsive line-split reveal (SplitText lines + mask + autoSplit).
 * @see https://demos.gsap.com/demo/responsive-line-splits-on-scroll/
 * @see https://codepen.io/GreenSock/pen/GggpRoB
 */
export function bindSplitLines(el: HTMLElement): () => void {
  if (el.hasAttribute(SPLIT_LINES_ATTR)) return () => {};
  el.setAttribute(SPLIT_LINES_ATTR, "");

  const split = SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    aria: "auto",
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 110,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    },
  });

  return () => {
    split.revert();
    el.removeAttribute(SPLIT_LINES_ATTR);
  };
}

export function querySplitLineTargets(root: ParentNode = document): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(".split-lines")).filter(
    (el) => !el.hasAttribute(SPLIT_LINES_ATTR),
  );
}
