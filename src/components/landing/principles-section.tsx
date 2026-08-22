import { Sparkles, Users } from "lucide-react";
import { Reveal } from "@/components/reveal";

export function PrinciplesSection() {
  return (
    <section
      id="principles"
      className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24"
    >
      <Reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Built for the in-between
            </p>
            <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.04em]">
              The little details are the product.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Drafts stay where you left them. Reconnects catch you up. The
            interface gets out of your way when the conversation gets good.
          </p>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Reveal delay={100}>
          <div className="h-full rounded-3xl bg-primary p-7 text-primary-foreground">
            <Sparkles className="size-5" />
            <h3 className="mt-12 text-2xl font-semibold">Quietly reliable.</h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-primary-foreground/70">
              Optimistic sends and clear connection states keep the experience
              honest.
            </p>
          </div>
        </Reveal>
        <Reveal delay={220}>
          <div className="h-full rounded-3xl border border-border p-7">
            <Users className="size-5" />
            <h3 className="mt-12 text-2xl font-semibold">Human by default.</h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              Good conversation is allowed to be spacious, specific, and a
              little unfinished.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
