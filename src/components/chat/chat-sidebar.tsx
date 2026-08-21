"use client";

import { useMemo, useState } from "react";
import { LogOut, MessageSquarePlus, Search, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmLogoutDialog } from "@/components/chat/confirm-logout-dialog";
import { ConversationRow } from "@/components/chat/conversation-row";
import { StartChatDialog } from "@/components/chat/start-chat-dialog";
import { conversationTitle, type Conversation, type User } from "@/lib/chat-api";

type Props = {
  conversations: Conversation[];
  activeId?: string;
  user: User;
  token: string | null;
  connected: boolean;
  open: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
  onLogout: () => void;
  onStartDirect: (otherUserId: string) => Promise<string>;
};

export function ChatSidebar({
  conversations,
  activeId,
  user,
  token,
  connected,
  open,
  onSelect,
  onClose,
  onLogout,
  onStartDirect,
}: Props) {
  const [query, setQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const filtered = useMemo(
    () =>
      conversations.filter((c) =>
        conversationTitle(c, user.id).toLowerCase().includes(query.toLowerCase()),
      ),
    [conversations, query, user.id],
  );

  return (
    <aside
      className={`${open ? "absolute inset-0 z-20 flex animate-in slide-in-from-left-4 fade-in duration-300" : "hidden"} w-full shrink-0 flex-col border-r border-border bg-card md:relative md:flex md:w-80`}
    >
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Messages
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Your circles
          </h1>
        </div>
        <button
          onClick={onClose}
          className="grid size-9 place-items-center rounded-lg hover:bg-accent md:hidden"
          aria-label="Close conversations"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex w-full gap-2 px-4 pb-4">
        <Button
          size="sm"
          onClick={() => setStartOpen(true)}
          disabled={!token}
          title={token ? "Start a direct conversation" : "Sign in first"}
          className="flex-1 cursor-pointer"
        >
          <MessageSquarePlus data-icon="inline-start" />
          New chat
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled
          title="Group chats are on their way"
          className="flex-1 cursor-not-allowed"
        >
          <UsersRound data-icon="inline-start" />
          New group
        </Button>
      </div>

      <div className="px-4 pb-4">
        <label className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            aria-label="Search conversations"
          />
        </label>
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto px-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm font-medium">
              {query ? "No matches" : "No conversations yet"}
            </p>
            <p className="max-w-[26ch] text-xs leading-5 text-muted-foreground">
              {query
                ? `Nothing here matches “${query}”.`
                : "Start your first chat — search for someone by name or number."}
            </p>
          </div>
        ) : (
          filtered.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              item={conversation}
              selfId={user.id}
              active={conversation.id === activeId}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-accent font-semibold">
            {user.name.slice(0, 1).toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name || "…"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {connected ? "Connected" : "Connection issues"}
            </p>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="size-4 text-destructive" />
          </button>
        </div>
      </div>
      {confirmOpen && (
        <ConfirmLogoutDialog
          onClose={() => setConfirmOpen(false)}
          onConfirm={onLogout}
        />
      )}
      {startOpen && token && (
        <StartChatDialog
          token={token}
          selfId={user.id}
          onClose={() => setStartOpen(false)}
          onStart={async (otherUserId) => {
            const conversationId = await onStartDirect(otherUserId);
            setStartOpen(false);
            onSelect(conversationId);
            return conversationId;
          }}
        />
      )}
    </aside>
  );
}
