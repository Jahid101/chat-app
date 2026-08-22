"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  icon,
  onClose,
  onConfirm,
}: {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] grid animate-in place-items-center bg-foreground/30 p-4 backdrop-blur-sm fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm animate-in rounded-3xl border border-border bg-card p-6 shadow-2xl zoom-in-95 slide-in-from-bottom-2 fade-in duration-300">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-destructive/10">
          {icon ?? <AlertTriangle className="size-5 text-destructive" />}
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
