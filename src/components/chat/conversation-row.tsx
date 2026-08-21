import { User, Users } from "lucide-react";
import { conversationTitle, type Conversation } from "@/lib/chat-api";

export function ConversationRow({
  item,
  selfId,
  active,
  onClick,
}: {
  item: Conversation;
  selfId?: string;
  active: boolean;
  onClick: () => void;
}) {
  const title = conversationTitle(item, selfId);
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-colors ${active ? "bg-accent" : "hover:bg-accent/60"}`}
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold">
        {item.isGroup ? <Users className="size-4" /> : <User className="size-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{title}</p>
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
