import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SkipBack, SkipForward } from "lucide-react";
import useSound from "use-sound";
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
 * Music toggle adapted from Skiper UI / 21st.dev Music Toggle btn
 * @see https://21st.dev/@reuno-ui/components/music-toggle-btn
 * @see https://skiper-ui.com/v1/skiper25
 */
export function MusicPlayer() {
  const [visible, setVisible] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wantPlay, setWantPlay] = useState(false);
  const [heights, setHeights] = useState(() => Array(BARS).fill(0.1) as number[]);

  const track = TRACKS[trackIndex];

  const [play, { pause, stop }] = useSound(track.src, {
    loop: false,
    interrupt: true,
    soundEnabled: true,
    onplay: () => setIsPlaying(true),
    onend: () => {
      setIsPlaying(false);
      setTrackIndex((i) => (i + 1) % TRACKS.length);
      setWantPlay(true);
    },
    onpause: () => setIsPlaying(false),
    onstop: () => setIsPlaying(false),
  });

  // Reveal once the About section enters (or has been scrolled past) and stay.
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

  // Auto-play after track change when the previous track ended.
  useEffect(() => {
    if (!wantPlay) return;
    const id = window.setTimeout(() => {
      play();
      setWantPlay(false);
    }, 80);
    return () => window.clearTimeout(id);
  }, [trackIndex, wantPlay, play]);

  useEffect(() => {
    if (!isPlaying) {
      setHeights(Array(BARS).fill(0.1));
      return;
    }
    const id = window.setInterval(() => setHeights(randomHeights()), 100);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      try {
        stop();
      } catch {
        /* sound may already be disposed */
      }
    };
  }, [stop]);

  const toggle = () => {
    if (isPlaying) {
      pause();
      setWantPlay(false);
      return;
    }
    play();
  };

  const skip = (dir: number) => {
    try {
      stop();
    } catch {
      /* ignore */
    }
    setIsPlaying(false);
    setTrackIndex((i) => (i + dir + TRACKS.length) % TRACKS.length);
    setWantPlay(true);
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
