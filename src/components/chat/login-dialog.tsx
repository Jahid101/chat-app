"use client";

import { useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (name: string, phone: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await onSubmit(name.trim(), phone.trim());
    } catch {
      setError("Sign in failed. Check your details and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Welcome in
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Open your chat space
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your account, or explore the preview without signing in.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="rounded-xl border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 202 555 0147"
              autoComplete="tel"
              className="rounded-xl border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={pending || !name.trim() || !phone.trim()}
          >
            {pending ? "Signing in…" : "Continue"}{" "}
            {!pending && <ArrowUpRight data-icon="inline-end" />}
          </Button>
          <button
            type="button"
            className="text-sm text-muted-foreground underline underline-offset-4"
            onClick={onClose}
          >
            Cancel — explore the preview instead
          </button>
        </form>
      </div>
    </div>
  );
}
