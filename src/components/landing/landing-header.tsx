import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MessageSquare, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { HeroCta } from "./hero-cta";

export function LandingHeader() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold tracking-tight"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          <MessagesSquare className="size-4" />
        </span>
        Chatty
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        <a href="#why" className="hover:text-foreground">
          Why it works
        </a>
        <a href="#principles" className="hover:text-foreground">
          Principles
        </a>
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {/* <Link href="/chat" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Let's chat
        </Link> */}
        <HeroCta text="Let's chat" />
      </div>
    </header>
  );
}
