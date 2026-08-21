export function FeaturesSection() {
  const features = [
    [
      "01",
      "Find the thread",
      "Search across your conversations without losing the shape of the day.",
    ],
    [
      "02",
      "Stay in the moment",
      "Realtime updates feel instant, but never interrupt the way you think.",
    ],
    [
      "03",
      "Make it yours",
      "Light, dark, groups, direct messages — a space that adjusts to your rhythm.",
    ],
  ] as const;

  return (
    <section id="why" className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-3 md:px-10 md:py-24">
        {features.map(([number, title, copy]) => (
          <article key={number}>
            <div className="bg-linear-to-b from-primary/20 to-primary/0 px-3 py-3 rounded-2xl w-fit">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {number}
              </p>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              {title}
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              {copy}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
