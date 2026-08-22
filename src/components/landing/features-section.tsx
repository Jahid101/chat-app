import {
  BellRing,
  Search,
  SunMoon,
  UsersRound,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/reveal";

const cardBase =
  "group h-full rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5";

const iconBox =
  "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary";

const visualBox =
  "mt-6 flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background";

export function FeaturesSection() {
  return (
    <section id="why" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Why Chatty
              </p>
              <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.04em]">
                Everything essential. Nothing extra.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              The features you use every hour, polished until they disappear
              into the conversation.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {/* Realtime — wide card with a live waveform */}
          <Reveal className="md:col-span-2" delay={80}>
            <article className={cardBase}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={iconBox}>
                    <Zap className="size-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight">
                    Realtime, quietly
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    Messages land the moment they&rsquo;re sent — over a live
                    socket, no refresh, no spinner anxiety.
                  </p>
                </div>
              </div>
              <div className={visualBox} aria-hidden>
                <span className="flex h-12 items-end gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                    <span
                      key={bar}
                      style={{
                        animationDelay: `${bar * 110}ms`,
                        animationDuration: `${820 + bar * 90}ms`,
                      }}
                      className="h-full w-1 origin-bottom animate-eq rounded-full bg-primary/60"
                    />
                  ))}
                </span>
              </div>
            </article>
          </Reveal>

          {/* Theme */}
          <Reveal delay={160}>
            <article className={cardBase}>
              <span className={iconBox}>
                <SunMoon className="size-5" />
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                Light &amp; dark, remembered
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your theme survives reloads — it&rsquo;s applied before the
                first paint.
              </p>
              <div className={visualBox} aria-hidden>
                <span className="relative h-9 w-16 rounded-full bg-accent transition-colors duration-300 group-hover:bg-primary/20">
                  <span className="absolute top-1 left-1 size-7 rounded-full bg-card shadow-md transition-transform duration-300 group-hover:translate-x-7" />
                </span>
              </div>
            </article>
          </Reveal>

          {/* Groups */}
          <Reveal delay={120}>
            <article className={cardBase}>
              <span className={iconBox}>
                <UsersRound className="size-5" />
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                Groups in seconds
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Name it, add people, done. Admins can rename, promote, and
                curate.
              </p>
              <div className={visualBox} aria-hidden>
                <span className="flex -space-x-2.5">
                  {["A", "M", "K"].map((letter, index) => (
                    <span
                      key={letter}
                      className={`relative grid size-9 place-items-center rounded-full text-xs font-semibold ring-2 ring-background ${
                        index % 2 === 0 ? "bg-primary/15" : "bg-accent"
                      }`}
                      style={{ zIndex: 3 - index }}
                    >
                      {letter}
                      {index === 0 && (
                        <span className="absolute -top-0.5 -right-0.5 size-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-primary ring-2 ring-background" />
                        </span>
                      )}
                    </span>
                  ))}
                  <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-2 ring-background">
                    +5
                  </span>
                </span>
              </div>
            </article>
          </Reveal>

          {/* Search */}
          <Reveal delay={200}>
            <article className={cardBase}>
              <span className={iconBox}>
                <Search className="size-5" />
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                Find anyone, instantly
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Start a thread by name or number — results stream as you type.
              </p>
              <div className={visualBox} aria-hidden>
                <span className="flex w-[80%] items-center gap-2 rounded-xl border border-input bg-card px-3 py-2 shadow-sm">
                  <Search className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Maya</span>
                  <span className="ml-auto h-3.5 w-px animate-pulse bg-primary" />
                </span>
              </div>
            </article>
          </Reveal>

          {/* Notifications */}
          <Reveal delay={280}>
            <article className={cardBase}>
              <span className={iconBox}>
                <BellRing className="size-5" />
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                Gentle notifications
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A soft chime and a quiet badge — only for chats you&rsquo;re
                not looking at.
              </p>
              <div className={visualBox} aria-hidden>
                <span className="relative grid size-11 place-items-center rounded-2xl bg-accent">
                  <BellRing className="size-5 text-muted-foreground" />
                  <span className="absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 py-0.5 text-[10px] font-bold text-primary-foreground">
                    2
                  </span>
                </span>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
