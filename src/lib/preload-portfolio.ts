import { asset } from "@/lib/asset";
import { projects } from "@/data/projects";

const HERO_TEXTURES = [
  "https://i.postimg.cc/XYwvXN8D/img-4.png",
  "https://i.postimg.cc/2SHKQh2q/raw-4.webp",
];

const AUDIO_TRACKS = [
  asset("assets/audio/artbat-horizon.mp3"),
  asset("assets/audio/videoclub-roi.mp3"),
];

/** First-viewport assets — block onboarding on these only */
function criticalUrls(): string[] {
  return [asset("assets/images/about-me.png")];
}

/** Warm later while the user is already in the site */
function secondaryUrls(): string[] {
  const urls = new Set<string>();
  for (const src of HERO_TEXTURES) urls.add(src);
  for (const project of projects) {
    // First shot per project is enough for cards; rest loads on demand
    if (project.shots[0]) urls.add(project.shots[0]);
  }
  return [...urls];
}

function loadImage(src: string, timeoutMs = 4000): Promise<void> {
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
  /** 0–100 */
  percent: number;
  done: number;
  total: number;
};

/**
 * Fast gate for onboarding: about portrait + fonts.
 * Reports progress so the loading UI can show a percentage buffer.
 * Secondary assets keep warming in the background after this resolves.
 */
export async function preloadPortfolioAssets(
  onProgress?: (progress: PreloadProgress) => void,
): Promise<void> {
  const urls = criticalUrls();
  let done = 0;
  const total = urls.length + 1; // + fonts

  const report = () => {
    onProgress?.({
      done,
      total,
      percent: Math.round((done / total) * 100),
    });
  };

  report();

  await Promise.all([
    ...urls.map((src) =>
      loadImage(src, 4500).then(() => {
        done += 1;
        report();
      }),
    ),
    Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((r) => window.setTimeout(r, 2500)),
    ]).then(() => {
      done += 1;
      report();
    }),
  ]);

  // Don't block the user — warm the rest quietly
  void warmSecondaryAssets();
}

function warmSecondaryAssets() {
  for (const src of secondaryUrls()) {
    void loadImage(src, 8000);
  }
  // First track only — enough for a responsive first play
  if (AUDIO_TRACKS[0]) void loadAudioHint(AUDIO_TRACKS[0], 4000);
}
