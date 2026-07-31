import { asset } from "@/lib/asset";
import { projects } from "@/data/projects";

const ABOUT_SRC = asset("assets/images/about-me.png");

const HERO_TEXTURES = [
  "https://i.postimg.cc/XYwvXN8D/img-4.png",
  "https://i.postimg.cc/2SHKQh2q/raw-4.webp",
];

const AUDIO_TRACKS = [
  asset("assets/audio/artbat-horizon.mp3"),
  asset("assets/audio/videoclub-roi.mp3"),
];

export function getAboutImageSrc() {
  return ABOUT_SRC;
}

/** Inject early so Safari starts the request before React mounts. */
export function injectAboutImagePreload() {
  if (typeof document === "undefined") return;
  const existing = document.querySelector(`link[data-preload-about="1"]`);
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = ABOUT_SRC;
  link.setAttribute("data-preload-about", "1");
  document.head.appendChild(link);
}

function secondaryUrls(): string[] {
  const urls = new Set<string>();
  for (const src of HERO_TEXTURES) urls.add(src);
  for (const project of projects) {
    if (project.shots[0]) urls.add(project.shots[0]);
  }
  return [...urls];
}

/** Soft warm — may resolve on timeout; never blocks onboarding. */
function loadImageSoft(src: string, timeoutMs = 8000): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    img.decoding = "async";
    img.onload = () => finish();
    img.onerror = () => finish();
    img.src = src;
    window.setTimeout(finish, timeoutMs);
  });
}

/**
 * Hard wait for a critical image: decode into memory, long safety timeout only.
 * Prefers an in-DOM <img> (Safari shares that request with the real portrait).
 */
function loadImageHard(src: string, timeoutMs = 20_000): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const fromDom = document.querySelector<HTMLImageElement>(
      `img[data-preload-about="1"]`,
    );

    const bind = (img: HTMLImageElement) => {
      const done = async () => {
        try {
          if (typeof img.decode === "function") await img.decode();
        } catch {
          /* decode can reject if already broken — still continue */
        }
        finish();
      };

      if (img.complete && img.naturalWidth > 0) {
        void done();
        return;
      }
      img.addEventListener("load", () => void done(), { once: true });
      img.addEventListener("error", finish, { once: true });
      if (!img.src) img.src = src;
    };

    if (fromDom) {
      bind(fromDom);
    } else {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      bind(img);
    }

    window.setTimeout(finish, timeoutMs);
  });
}

function loadAudioHint(src: string, timeoutMs = 2500): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    audio.preload = "auto";
    audio.addEventListener("canplaythrough", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    audio.src = src;
    window.setTimeout(finish, timeoutMs);
  });
}

export type PreloadProgress = {
  percent: number;
  done: number;
  total: number;
};

/**
 * Gate onboarding on the about portrait (hard) + fonts (soft).
 * Everything else warms in the background after dismiss.
 */
export async function preloadPortfolioAssets(
  onProgress?: (progress: PreloadProgress) => void,
): Promise<void> {
  injectAboutImagePreload();

  let done = 0;
  const total = 2; // about + fonts

  const report = () => {
    onProgress?.({
      done,
      total,
      percent: Math.min(100, Math.round((done / total) * 100)),
    });
  };

  report();

  await Promise.all([
    loadImageHard(ABOUT_SRC).then(() => {
      done += 1;
      report();
    }),
    Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((r) => window.setTimeout(r, 2000)),
    ]).then(() => {
      done += 1;
      report();
    }),
  ]);

  void warmSecondaryAssets();
}

function warmSecondaryAssets() {
  for (const src of secondaryUrls()) {
    void loadImageSoft(src, 8000);
  }
  if (AUDIO_TRACKS[0]) void loadAudioHint(AUDIO_TRACKS[0], 4000);
}
