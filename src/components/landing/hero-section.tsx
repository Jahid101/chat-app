import { CheckCheck, Send } from "lucide-react";
import { HeroCta } from "@/components/landing/hero-cta";

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_.95fr] md:items-center md:px-10 md:pb-28 md:pt-24">
      <div>
        <p className="mb-5 flex animate-in items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary slide-in-from-bottom-2 fade-in duration-700">
          <span className="size-2 rounded-full bg-primary" />
          Conversations with room to breathe
        </p>
        <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-[-0.06em] slide-in-from-bottom-3 fade-in animate-in duration-700 delay-100 md:text-7xl">
          Talk less like a tool.{" "}
          <span className="animate-shimmer bg-[linear-gradient(90deg,var(--muted-foreground),var(--foreground),var(--muted-foreground))] bg-clip-text text-transparent [background-size:200%_100%]">
            Make more room for people.
          </span>
        </h1>
        <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-muted-foreground slide-in-from-bottom-3 fade-in animate-in duration-700 delay-200 md:text-lg">
          Chatty is a considered chat space for teams who care about the signal,
          the small details, and the moment a message finally lands.
        </p>
        <div className="mt-8 flex flex-col gap-3 slide-in-from-bottom-3 fade-in animate-in duration-700 delay-300 sm:flex-row">
          <HeroCta className="px-5 py-6" />
        </div>
        <p className="mt-5 text-xs text-muted-foreground slide-in-from-bottom-3 fade-in animate-in duration-700 delay-300">
          No noisy feeds. No lost threads. Just the right people, in focus.
        </p>
      </div>
      <div
        id="preview"
        className="relative slide-in-from-bottom-6 fade-in zoom-in-95 animate-in duration-700 delay-200"
      >
        <div className="absolute -inset-10 -z-10 rounded-full bg-accent/40 blur-3xl" />

        {/* Floating top */}
        <div className="absolute -top-9 -right-5 animate-floatX rounded-2xl border border-border px-4 py-3 shadow-lg mr-2 sm:mr-0 bg-linear-to-tl from-primary/12 via-card to-primary/5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Realtime, quietly
          </p>
          <p className="mt-1 text-sm font-semibold">Your messages arrive.</p>
        </div>

        {/* Middle part */}
        <div className="rounded-[2rem] border border-border bg-card p-3 shadow-2xl shadow-primary/10">
          <div className="rounded-[1.5rem] border border-border bg-background">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <div className="relative grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                M
                <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-primary ring-2 ring-background">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold">Design circle</p>
                <p className="text-xs text-muted-foreground">
                  8 members · 3 online
                </p>
              </div>
              <span className="ml-auto size-2 animate-pulse rounded-full bg-primary" />
            </div>
            <div className="flex min-h-[330px] flex-col justify-end gap-4 p-5">
              <div className="max-w-[78%] animate-in rounded-2xl rounded-bl-md bg-card p-3 text-sm shadow-sm ring-1 ring-border slide-in-from-bottom-2 fade-in duration-500 delay-500">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Maya Chen
                </p>
                The new direction feels right.
              </div>
              <div className="ml-auto max-w-[78%] animate-in rounded-2xl rounded-br-md bg-primary p-3 text-sm text-primary-foreground slide-in-from-bottom-2 fade-in duration-500 delay-700">
                That’s the feeling. Let’s keep the edges soft.
                <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-primary-foreground/70 opacity-0 animate-in fade-in duration-700 delay-1000">
                  <CheckCheck className="size-3" aria-hidden />
                  Delivered
                </p>
              </div>
              <div className="max-w-[78%] animate-in rounded-2xl rounded-bl-md bg-card p-3 text-sm shadow-sm ring-1 ring-border slide-in-from-bottom-2 fade-in duration-500 delay-900">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Maya Chen
                </p>
                Morning. I pulled the latest notes into one place.
              </div>
              <div
                className="flex max-w-[64%] items-center gap-1.5 animate-in rounded-2xl rounded-bl-md bg-card px-4 py-3.5 shadow-sm ring-1 ring-border slide-in-from-bottom-2 fade-in duration-500 delay-1200"
                role="img"
                aria-label="Maya is typing"
              >
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    style={{ animationDelay: `${delay}ms` }}
                    className="size-1.5 animate-typing-dot rounded-full bg-muted-foreground"
                  />
                ))}
              </div>
            </div>
            <div className="m-3 flex items-center gap-2 rounded-xl border border-input p-2">
              <span className="flex-1 px-2 text-xs text-muted-foreground">
                Write something thoughtful...
              </span>
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground transition-transform duration-200 hover:scale-105">
                <Send className="size-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Floating bottom */}
        <div className="absolute -bottom-9 -left-5 animate-floatY rounded-2xl border border-border px-4 py-3 shadow-lg ml-2 sm:ml-0 bg-linear-to-bl from-primary/12 via-card to-primary/5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Chat. Connect. Stay close
          </p>
          <p className="mt-1 text-sm font-semibold">
            Conversations made simple.
          </p>
        </div>
      </div>
    </section>
  );
}
