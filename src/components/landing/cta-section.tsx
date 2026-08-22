import { HeroCta } from "@/components/landing/hero-cta";
import { Reveal } from "@/components/reveal";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 md:px-10 md:pb-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-linear-to-br from-primary/12 via-card to-primary/5 px-6 py-14 text-center md:py-20">
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,black_20%,transparent_75%)]"
          />
          <div
            aria-hidden
            style={{ animationDuration: "9s" }}
            className="absolute -bottom-24 -left-16 size-72 animate-floatY rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            style={{ animationDuration: "11s" }}
            className="absolute -right-14 -top-24 size-64 animate-floatX rounded-full bg-accent blur-2xl"
          />
          <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Your people are one message away
          </p>
          <h2 className="relative mx-auto mt-3 max-w-2xl text-balance text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
            Ready when you are.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground md:text-base">
            No downloads, no setup ritual. Sign in with a name and a number —
            the conversation takes it from there.
          </p>
          <div className="relative mt-8 flex justify-center">
            <HeroCta />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
