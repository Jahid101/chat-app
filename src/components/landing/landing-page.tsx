import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingHeader } from "@/components/landing/landing-header";
import { PrinciplesSection } from "@/components/landing/principles-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { TickerBand } from "@/components/landing/ticker-band";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main id="top" className="relative overflow-x-clip">
        {/* Atmosphere: faint grid + gradient orbs behind the hero */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[860px]">
          <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_70%_55%_at_60%_0%,black_15%,transparent_70%)]" />
          <div className="absolute -top-48 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-[380px] -left-40 size-[380px] rounded-full bg-primary/8 blur-[110px]" />
          <div className="absolute top-[300px] -right-32 size-[340px] rounded-full bg-accent blur-[100px]" />
        </div>
        <HeroSection />
        <TickerBand />
        <FeaturesSection />
        <PrinciplesSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
