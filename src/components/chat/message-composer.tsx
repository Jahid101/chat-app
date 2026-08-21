"use client";

import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessageComposer({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing &&
      event.keyCode !== 229
    ) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <div className="border-t border-border bg-background p-4 md:px-12 md:py-5">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-input bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
          <Button variant="ghost" size="icon" aria-label="Attach a file">
            <Paperclip />
          </Button>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write something thoughtful..."
            rows={1}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
            aria-label="Message composer"
          />
          <Button
            size="icon"
            onClick={onSend}
            disabled={!value.trim()}
            aria-label="Send message"
          >
            <Send />
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}
