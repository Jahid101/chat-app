"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginDialog } from "@/components/chat/login-dialog";
import { buttonVariants } from "@/components/ui/button";
import { chatApi, extractToken } from "@/lib/chat-api";
import { readToken, writeToken } from "@/lib/auth-token";

function pulseHaptic() {
  if ("vibrate" in navigator) navigator.vibrate(8);
}

export function HeroCta({
  text = "Enter your conversations",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    pulseHaptic();
    if (readToken()) return; // authenticated → let the Link navigate
    event.preventDefault();
    setLoginOpen(true);
  }

  async function handleLogin(name: string, phone: string) {
    const raw = await chatApi.login(name, phone);
    const nextToken = extractToken(raw);
    if (!nextToken) throw new Error("No token returned");
    writeToken(nextToken);
    setLoginOpen(false);
    router.push("/chat");
  }

  return (
    <>
      <Link
        href="/chat"
        onClick={handleClick}
        className={buttonVariants({
          size: "lg",
          className: [
            "relative overflow-hidden",
            "motion-safe:animate-breathe",
            "duration-300 ease-out",
            "hover:-translate-y-0.5 hover:brightness-110",
            "active:translate-y-0 active:scale-[0.97]",
            "after:pointer-events-none after:absolute after:inset-0",
            "after:bg-linear-to-r after:from-transparent after:via-white/15 after:to-transparent",
            "after:-translate-x-[150%] hover:after:translate-x-[150%]",
            "after:transition-transform after:duration-700 after:ease-out",
            className,
          ].join(" "),
        })}
      >
        {text}{" "}
        <ArrowUpRight
          data-icon="inline-end"
          className="transition-transform duration-300 ease-out group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
        />
      </Link>
      {loginOpen && (
        <LoginDialog
          onClose={() => setLoginOpen(false)}
          onSubmit={handleLogin}
        />
      )}
    </>
  );
}
