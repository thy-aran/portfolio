import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/asset";

const TRACKS = [
  {
    src: asset("assets/audio/artbat-horizon.mp3"),
    title: "Horizon",
    artist: "ARTBAT",
  },
  {
    src: asset("assets/audio/videoclub-roi.mp3"),
    title: "Roi (instrumental)",
    artist: "VIDEOCLUB",
  },
];

const BARS = 5;

function randomHeights() {
  return Array.from({ length: BARS }, () => Math.random() * 0.8 + 0.2);
}

/**
 * Native HTMLAudioElement — Howler/use-sound often fails on iOS Safari
 * because play() must stay inside a user gesture.
 */
export function MusicPlayer() {
  const [visible, setVisible] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [heights, setHeights] = useState(() => Array(BARS).fill(0.1) as number[]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackIndexRef = useRef(0);

  const track = TRACKS[trackIndex];

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.src = TRACKS[0].src;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      const next = (trackIndexRef.current + 1) % TRACKS.length;
      trackIndexRef.current = next;
      setTrackIndex(next);
      audio.src = TRACKS[next].src;
      void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    trackIndexRef.current = trackIndex;
  }, [trackIndex]);

  useEffect(() => {
    const about = document.getElementById("about");
    if (!about) return;

    const reveal = () => setVisible(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) reveal();
      },
      { threshold: 0.08, rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(about);

    const onScroll = () => {
      if (about.getBoundingClientRect().top <= window.innerHeight * 0.75) reveal();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setHeights(Array(BARS).fill(0.1));
      return;
    }
    const id = window.setInterval(() => setHeights(randomHeights()), 100);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    // Synchronous play() inside the tap — required by Safari
    if (!audio.getAttribute("src")) {
      audio.src = TRACKS[trackIndexRef.current].src;
    }
    void audio.play().catch(() => setIsPlaying(false));
  };

  const skip = (dir: number) => {
    const audio = audioRef.current;
    const next = (trackIndexRef.current + dir + TRACKS.length) % TRACKS.length;
    const shouldResume = Boolean(audio && !audio.paused);

    trackIndexRef.current = next;
    setTrackIndex(next);

    if (!audio) return;

    audio.pause();
    audio.src = TRACKS[next].src;
    if (shouldResume) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          className="music-player"
          initial={{ opacity: 0, y: 28, x: -12 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          aria-label="Background music player"
        >
          <div className="music-player__meta">
            <span className="music-player__artist">{track.artist}</span>
            <span className="music-player__title">{track.title}</span>
          </div>

          <div className="music-player__controls">
            <button
              type="button"
              className="music-player__skip"
              onClick={() => skip(-1)}
              aria-label="Previous track"
            >
              <SkipBack aria-hidden />
            </button>

            <motion.button
              type="button"
              onClick={toggle}
              aria-label={isPlaying ? "Pause music" : "Play music"}
              aria-pressed={isPlaying}
              initial={{ padding: "14px 14px" }}
              whileHover={{ padding: "16px 20px" }}
              whileTap={{ padding: "16px 20px" }}
              transition={{ duration: 0.9, bounce: 0.55, type: "spring" }}
              className={cn("music-player__toggle", isPlaying && "is-playing")}
            >
              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", bounce: 0.35 }}
                className="music-player__wave"
              >
                {heights.map((height, index) => (
                  <motion.div
                    key={index}
                    className="music-player__bar"
                    initial={{ height: 1 }}
                    animate={{ height: Math.max(4, height * 14) }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  />
                ))}
              </motion.div>
            </motion.button>

            <button
              type="button"
              className="music-player__skip"
              onClick={() => skip(1)}
              aria-label="Next track"
            >
              <SkipForward aria-hidden />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
