import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-5 py-7 md:px-10">
      <div className="mx-auto max-w-7xl flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center">Taghyeer — a quieter way to stay close.</p>
      </div>
    </footer>
  );
}
