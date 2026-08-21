import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingHeader } from "@/components/landing/landing-header";
import { PrinciplesSection } from "@/components/landing/principles-section";
import { SiteFooter } from "@/components/landing/site-footer";

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <LandingHeader />
      <main id="top">
        <HeroSection />
        <FeaturesSection />
        <PrinciplesSection />
      </main>
      <SiteFooter />
    </div>
  );
}
