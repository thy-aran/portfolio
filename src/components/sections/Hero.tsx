import { HeroFuturistic } from "@/components/ui/hero-futuristic";

export function Hero({ active = true }: { active?: boolean }) {
  return (
    <section id="hero" className="hero-section relative min-h-svh">
      <HeroFuturistic title="ARAN ADNAN" role="Full Stack Developer" active={active} />
    </section>
  );
}
