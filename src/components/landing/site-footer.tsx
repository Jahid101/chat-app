import Link from "next/link";
import { MessagesSquare } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-5 py-8 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-linear-to-t from-primary/20 to-primary/0">
            <MessagesSquare className="size-3.5" />
          </span>
          <span className="font-semibold text-foreground">Chatty</span>
          — a quieter way to stay close.
        </p>
        <nav aria-label="Footer" className="flex items-center gap-4">
          <Link href="/#why" className="transition-colors hover:text-foreground">
            Why Chatty
          </Link>
          <Link href="/#principles" className="transition-colors hover:text-foreground">
            Principles
          </Link>
        </nav>
      </div>
    </footer>
  );
}
