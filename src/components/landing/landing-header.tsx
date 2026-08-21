"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MessagesSquare } from "lucide-react";
import Link from "next/link";
import { HeroCta } from "./hero-cta";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 animate-in fade-in slide-in-from-top-30 duration-700 ease-out">
      <div
        className={`transition-all duration-300 ease-out ${
          scrolled
            ? "border-b border-border bg-background/80 shadow-sm backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-300 ease-out md:px-10 ${
            scrolled ? "py-3" : "py-5"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight group"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-linear-to-t from-primary/20 to-primary/0">
              <MessagesSquare className="size-5 group-hover:scale-103 duration-200" />
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
        </div>
      </div>
    </header>
  );
}
