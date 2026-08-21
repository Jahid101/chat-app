"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmLogoutDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid animate-in place-items-center bg-foreground/30 p-4 backdrop-blur-sm fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm log out"
    >
      <div className="w-full max-w-sm animate-in rounded-3xl border border-border bg-card p-6 shadow-2xl zoom-in-95 slide-in-from-bottom-2 fade-in duration-300">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-destructive/10">
          <LogOut className="size-5 text-destructive" />
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">
          Log out of Chatty?
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          You&rsquo;ll be signed out on this device. Your conversations will be waiting when you come back.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Stay in
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
