import { useState } from "react";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Services } from "@/components/sections/Services";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { StarfieldBackground } from "@/components/ui/starfield-background";
import { GlowCursor } from "@/components/ui/glow-cursor";
import { MusicPlayer } from "@/components/ui/music-player";
import { useSplitLines } from "@/hooks/useSplitLines";

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
          <Skills />
          <Services />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>
      {ready && <MusicPlayer />}
    </>
  );
}
