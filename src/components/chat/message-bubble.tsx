import { Check } from "lucide-react";
import type { Message } from "@/lib/chat-api";

export function MessageBubble({
  message,
  own,
  showName = false,
  senderName,
}: {
  message: Message;
  own: boolean;
  showName?: boolean;
  senderName?: string;
}) {
  return (
    <div
      className={`flex animate-in flex-col fade-in slide-in-from-bottom-1 duration-300 ${own ? "items-end" : "items-start"}`}
    >
      {showName && !own && senderName && (
        <span className="mb-1 px-3 text-xs font-medium text-muted-foreground">
          {senderName}
        </span>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[70%] ${own ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-card shadow-sm ring-1 ring-border"}`}
      >
        <p>{message.text}</p>
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${own ? "text-primary-foreground/70" : "text-muted-foreground"}`}
        >
          {message.failed ? (
            "Failed · tap to retry"
          ) : message.pending ? (
            "Sending…"
          ) : (
            <>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
              {own && <Check className="size-3" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
