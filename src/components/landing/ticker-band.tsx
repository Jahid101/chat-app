const items = [
  "Realtime delivery",
  "Group conversations",
  "Optimistic sends",
  "Soft chimes",
  "Light & dark",
  "Unread badges",
  "Instant search",
  "Presence dots",
];

export function TickerBand() {
  return (
    <section
      aria-hidden
      className="group overflow-hidden border-y border-border bg-card/40 py-5"
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex items-center" aria-hidden={copy === 1}>
            {items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 pr-10 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground"
              >
                <span className="size-1.5 rounded-full bg-primary/40" />
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
