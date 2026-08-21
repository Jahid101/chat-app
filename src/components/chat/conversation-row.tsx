import { Users } from "lucide-react";
import type { Conversation } from "@/lib/chat-api";

export function ConversationRow({
  item,
  active,
  onClick,
}: {
  item: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-colors ${active ? "bg-accent" : "hover:bg-accent/60"}`}
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold">
        {item.isGroup ? <Users className="size-4" /> : item.name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{item.name}</p>
          {item.lastMessage && (
            <time className="text-[10px] text-muted-foreground">
              {new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </time>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {item.lastMessage?.text ?? "No messages yet"}
        </p>
      </div>
      {item.unread ? (
        <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {item.unread}
        </span>
      ) : null}
    </button>
  );
}
