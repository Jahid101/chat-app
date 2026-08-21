import { Check } from "lucide-react";
import type { Message } from "@/lib/chat-api";

export function MessageBubble({
  message,
  own,
  showName,
}: {
  message: Message;
  own: boolean;
  showName: boolean;
}) {
  return (
    <div className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
      {showName && !own && (
        <span className="mb-1 px-3 text-xs font-medium text-muted-foreground">
          {message.senderName}
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
