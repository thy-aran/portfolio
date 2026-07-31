import { asset } from "@/lib/asset";
import { projects } from "@/data/projects";

const HERO_TEXTURES = [
  "https://i.postimg.cc/XYwvXN8D/img-4.png",
  "https://i.postimg.cc/2SHKQh2q/raw-4.webp",
];

function loadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => resolve(); // don't block the whole site on one failure
    img.src = src;
  });
}

const AUDIO_TRACKS = [
  asset("assets/audio/artbat-horizon.mp3"),
  asset("assets/audio/videoclub-roi.mp3"),
];

function collectCriticalUrls(): string[] {
  const urls = new Set<string>();
  urls.add(asset("assets/images/about-me.png"));
  for (const src of HERO_TEXTURES) urls.add(src);
  for (const project of projects) {
    for (const shot of project.shots) urls.add(shot);
  }
  return [...urls];
}

function loadAudio(src: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "auto";
    const done = () => {
      audio.removeEventListener("canplaythrough", done);
      audio.removeEventListener("error", done);
      resolve();
    };
    audio.addEventListener("canplaythrough", done, { once: true });
    audio.addEventListener("error", done, { once: true });
    audio.src = src;
    // Safety: don't hang forever on slow mobile networks
    window.setTimeout(done, 12_000);
  });
}

/**
 * Warm the browser cache for portrait, hero maps, project shots, and audio
 * so the loading screen can hold until the portfolio is ready to scroll.
 */
export async function preloadPortfolioAssets(
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const urls = collectCriticalUrls();
  let done = 0;
  const total = urls.length + AUDIO_TRACKS.length + 1; // +1 for fonts

  const tick = () => {
    done += 1;
    onProgress?.(done, total);
  };

  await Promise.all([
    ...urls.map((src) => loadImage(src).then(tick)),
    ...AUDIO_TRACKS.map((src) => loadAudio(src).then(tick)),
    (document.fonts?.ready ?? Promise.resolve()).then(tick),
  ]);
}
