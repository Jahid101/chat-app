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
          <div className="relative h-full overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground">
            <div aria-hidden className="flex h-14 items-center justify-between">
              <span className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 ring-1 ring-primary-foreground/20">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground/70" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary-foreground" />
                </span>
                <span className="text-xs font-medium">Live</span>
              </span>
              <span className="flex h-8 items-end gap-1">
                {[0, 1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    style={{
                      animationDelay: `${bar * 120}ms`,
                      animationDuration: `${880 + bar * 90}ms`,
                    }}
                    className="h-full w-1 origin-bottom animate-eq rounded-full bg-primary-foreground/40"
                  />
                ))}
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-semibold">Quietly reliable.</h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-primary-foreground/70">
              Optimistic sends and clear connection states keep the experience
              honest.
            </p>
          </div>
        </Reveal>
        <Reveal delay={220}>
          <div className="h-full rounded-3xl border border-border p-7">
            <div aria-hidden className="flex h-14 items-center">
              <span className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-accent px-4 py-3 ring-1 ring-border">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    style={{ animationDelay: `${delay}ms` }}
                    className="size-1.5 animate-typing-dot rounded-full bg-muted-foreground"
                  />
                ))}
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-semibold">Human by default.</h3>
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
