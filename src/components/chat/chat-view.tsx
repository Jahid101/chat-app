"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Hash,
  Menu,
  Sparkles,
  Users,
} from "lucide-react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ConnectionStatus } from "@/components/chat/connection-status";
import { LoginDialog } from "@/components/chat/login-dialog";
import { MessageComposer } from "@/components/chat/message-composer";
import { MessageList } from "@/components/chat/message-list";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";

export function ChatView() {
  const {
    token,
    user,
    conversations,
    messages,
    connection,
    send,
    login,
    markConversationRead,
  } = useChat();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!token) setLoginOpen(true);
  }, []);

  const active =
    conversations.find((item) => item.id === activeId) ?? conversations[0];
  const activeMessages = active ? (messages[active.id] ?? []) : [];

  function selectConversation(id: string) {
    if (active) setDrafts((prev) => ({ ...prev, [active.id]: draft }));
    setActiveId(id);
    setDraft(drafts[id] ?? "");
    setMobileRailOpen(false);
    markConversationRead(id);
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || !active) return;
    setDraft("");
    await send(active.id, text);
  }

  async function handleLogin(name: string, phone: string) {
    await login(name, phone);
    setLoginOpen(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          Taghyeer
        </Link>
        <div className="flex items-center gap-2">
          <ConnectionStatus status={connection} />
          <ThemeToggle />
          <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Home
          </Link>
        </div>
      </header>
      <main className="mx-auto flex h-[calc(100vh-4rem)] max-w-[1440px] overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          activeId={active?.id}
          user={user}
          connected={Boolean(token)}
          open={mobileRailOpen}
          onSelect={selectConversation}
          onClose={() => setMobileRailOpen(false)}
        />
        <section className="flex min-w-0 flex-1 flex-col bg-background">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileRailOpen(true)}
              aria-label="Open conversations"
            >
              <Menu />
            </Button>
            <div className="grid size-10 place-items-center rounded-2xl bg-accent">
              {active?.isGroup ? (
                <Users className="size-5" />
              ) : (
                <Hash className="size-5" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-semibold">{active?.name}</h2>
              <p className="text-xs text-muted-foreground">
                {active?.isGroup
                  ? "8 members · 3 online"
                  : "Usually replies in a few minutes"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              aria-label="Conversation details"
            >
              <ArrowUpRight />
            </Button>
          </div>
          {active ? (
            <>
              <MessageList
                conversationId={active.id}
                messages={activeMessages}
                user={user}
              />
              <MessageComposer
                value={draft}
                onChange={setDraft}
                onSend={handleSend}
              />
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-sm text-muted-foreground">
              No conversations yet.
            </div>
          )}
        </section>
      </main>
      {loginOpen && (
        <LoginDialog onClose={() => setLoginOpen(false)} onSubmit={handleLogin} />
      )}
    </div>
  );
}
