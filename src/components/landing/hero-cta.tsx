"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

function pulseHaptic() {
  if ("vibrate" in navigator) navigator.vibrate(8);
}

export function HeroCta({
  text = "Enter your conversations",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <Link
      href="/chat"
      onClick={pulseHaptic}
      className={buttonVariants({
        size: "lg",
        className: [
          className,
          "relative overflow-hidden",
          "motion-safe:animate-breathe",
          "duration-300 ease-out",
          "hover:-translate-y-0.5 hover:brightness-110",
          "active:translate-y-0 active:scale-[0.97]",
          "after:pointer-events-none after:absolute after:inset-0",
          "after:bg-linear-to-r after:from-transparent after:via-white/15 after:to-transparent",
          "after:-translate-x-[150%] hover:after:translate-x-[150%]",
          "after:transition-transform after:duration-700 after:ease-out",
        ].join(" "),
      })}
    >
      {text}{" "}
      <ArrowUpRight
        data-icon="inline-end"
        className="transition-transform duration-300 ease-out group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
      />
    </Link>
  );
}
