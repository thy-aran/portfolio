import { lazy, Suspense, useState } from "react";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { StarfieldBackground } from "@/components/ui/starfield-background";
import { GlowCursor } from "@/components/ui/glow-cursor";
import { MusicPlayer } from "@/components/ui/music-player";
import { DeferredMount } from "@/components/ui/deferred-mount";
import { useSplitLines } from "@/hooks/useSplitLines";

const Skills = lazy(() =>
  import("@/components/sections/Skills").then((m) => ({ default: m.Skills })),
);
const Services = lazy(() =>
  import("@/components/sections/Services").then((m) => ({ default: m.Services })),
);
const Projects = lazy(() =>
  import("@/components/sections/Projects").then((m) => ({ default: m.Projects })),
);
const Contact = lazy(() =>
  import("@/components/sections/Contact").then((m) => ({ default: m.Contact })),
);
const Footer = lazy(() =>
  import("@/components/sections/Footer").then((m) => ({ default: m.Footer })),
);

function SectionFallback({ minHeight }: { minHeight: string }) {
  return <div style={{ minHeight }} aria-hidden />;
}

export default function App() {
  const [ready, setReady] = useState(false);
  useSplitLines();

  return (
    <>
      <StarfieldBackground count={200} speed={0.32} starColor="#C0C0C0" twinkle />
      <div className="grain" aria-hidden />
      <GlowCursor />
      {!ready && <LoadingScreen onDone={() => setReady(true)} />}
      <Navbar />
      <div className="relative z-10">
        <main>
          <Hero active={ready} />
          <About />
          <DeferredMount id="skills" minHeight="100vh" rootMargin="400px 0px">
            <Suspense fallback={<SectionFallback minHeight="100vh" />}>
              <Skills />
            </Suspense>
          </DeferredMount>
          <DeferredMount id="services" minHeight="90vh" rootMargin="400px 0px">
            <Suspense fallback={<SectionFallback minHeight="90vh" />}>
              <Services />
            </Suspense>
          </DeferredMount>
          <DeferredMount id="projects" minHeight="120vh" rootMargin="480px 0px">
            <Suspense fallback={<SectionFallback minHeight="120vh" />}>
              <Projects />
            </Suspense>
          </DeferredMount>
          <DeferredMount id="contact" minHeight="70vh" rootMargin="360px 0px">
            <Suspense fallback={<SectionFallback minHeight="70vh" />}>
              <Contact />
            </Suspense>
          </DeferredMount>
        </main>
        <DeferredMount minHeight="8rem" rootMargin="200px 0px">
          <Suspense fallback={<SectionFallback minHeight="8rem" />}>
            <Footer />
          </Suspense>
        </DeferredMount>
      </div>
      {ready && <MusicPlayer />}
    </>
  );
}
