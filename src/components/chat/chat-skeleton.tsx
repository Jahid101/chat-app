export function ChatSkeleton() {
  const rows = [0, 1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="size-10 animate-pulse rounded-xl bg-accent" />
          <div className="h-4 w-16 animate-pulse rounded-md bg-accent" />
        </div>
        <div className="size-9 animate-pulse rounded-full bg-accent" />
      </header>

      <main className="mx-auto flex h-[calc(100vh-4rem)] max-w-[1440px] overflow-hidden">
        <div className="hidden w-80 shrink-0 flex-col gap-2 border-r border-border bg-card p-4 md:flex">
          <div className="mb-2 h-7 w-32 animate-pulse rounded-lg bg-accent" />
          {rows.map((row) => (
            <div
              key={row}
              className="flex animate-pulse items-center gap-3 rounded-xl p-3"
              style={{ animationDelay: `${row * 120}ms` }}
            >
              <div className="size-10 shrink-0 rounded-full bg-accent" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded-md bg-accent" />
                <div className="h-2.5 w-1/2 rounded-md bg-accent/60" />
              </div>
            </div>
          ))}
        </div>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-8">
            <div className="size-10 animate-pulse rounded-2xl bg-accent" />
            <div className="space-y-2">
              <div className="h-3.5 w-40 animate-pulse rounded-md bg-accent" />
              <div className="h-2.5 w-24 animate-pulse rounded-md bg-accent/60" />
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-end gap-4 p-5 md:p-8">
            {[0, 1, 2].map((bubble) => (
              <div
                key={bubble}
                className={`max-w-[70%] animate-pulse rounded-2xl bg-accent ${
                  bubble % 2 === 1 ? "ml-auto h-12 w-52" : "h-16 w-64"
                }`}
                style={{ animationDelay: `${300 + bubble * 120}ms` }}
              />
            ))}
            <div className="mt-2 h-12 animate-pulse rounded-xl border border-input bg-card" />
          </div>
        </section>
      </main>

      <span className="sr-only" role="status">
        Loading your conversations…
      </span>
    </div>
  );
}
