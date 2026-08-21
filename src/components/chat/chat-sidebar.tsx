"use client";

import { useMemo, useState } from "react";
import { LogOut, Plus, Search, X } from "lucide-react";
import { ConfirmLogoutDialog } from "@/components/chat/confirm-logout-dialog";
import { ConversationRow } from "@/components/chat/conversation-row";
import type { Conversation, User } from "@/lib/chat-api";

type Props = {
  conversations: Conversation[];
  activeId?: string;
  user: User;
  connected: boolean;
  open: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
  onLogout: () => void;
};

export function ChatSidebar({
  conversations,
  activeId,
  user,
  connected,
  open,
  onSelect,
  onClose,
  onLogout,
}: Props) {
  const [query, setQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const filtered = useMemo(
    () =>
      conversations.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [conversations, query],
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
      <div className="flex flex-col gap-1 overflow-y-auto px-3">
        {filtered.map((conversation) => (
          <ConversationRow
            key={conversation.id}
            item={conversation}
            active={conversation.id === activeId}
            onClick={() => onSelect(conversation.id)}
          />
        ))}
        <button className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <Plus className="size-4" /> Start a new conversation
        </button>
      </div>
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-accent font-semibold">
            {user.name.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">Connected</p>
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
    </aside>
  );
}
