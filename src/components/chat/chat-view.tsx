"use client";

import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatSkeleton } from "@/components/chat/chat-skeleton";
import { ConversationDetails } from "@/components/chat/conversation-details";
import { MessageComposer } from "@/components/chat/message-composer";
import { MessageList } from "@/components/chat/message-list";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { conversationTitle } from "@/lib/chat-api";
import { useChat } from "@/hooks/use-chat";
import { playMessageChime, unlockAudio } from "@/lib/sound";
import { ArrowUpRight, Hash, Menu, MessagesSquare, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ACTIVE_CONVERSATION_KEY = "Chatty-active-conversation";

export function ChatView() {
  const router = useRouter();
  const {
    token,
    user,
    conversations,
    messages,
    connection,
    initializing,
    send,
    logout,
    startDirect,
    startGroup,
    renameGroup,
    addGroupMembers,
    removeGroupMember,
    promoteGroupAdmin,
    loadMessages,
    threadLoading,
    markConversationRead,
    setViewingConversation,
    unreadCounts,
  } = useChat();

  const [activeId, setActiveId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACTIVE_CONVERSATION_KEY);
  });
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // The token is resolved from storage during the first client render;
  // this flag gates rendering so the prerendered HTML never leaks chat data.
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    setSessionChecked(true);
  }, []);

  // No valid session → back to the landing page (which offers the login modal).
  useEffect(() => {
    if (sessionChecked && !token) router.replace("/");
  }, [router, sessionChecked, token]);

  // Fetch the history whenever the selected conversation changes.
  // Lives above the auth gate: hooks must run unconditionally every render.
  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId, loadMessages]);

  // Tell the hook which thread is on screen (unread badges depend on it).
  const activeConversationId = activeId;
  useEffect(() => {
    setViewingConversation(activeConversationId);
  }, [activeConversationId, setViewingConversation]);

  // TEMP-DEBUG: remove after diagnosing chime regression —
  // type __chime() in the browser console to test audio in isolation.
  useEffect(() => {
    (window as unknown as { __chime?: () => void }).__chime = () => {
      unlockAudio();
      window.setTimeout(playMessageChime, 60);
    };
  }, []);

  // Browsers block audio until a gesture — unlock the chime on first click,
  // and wake the (suspended) context again whenever the tab becomes visible.
  useEffect(() => {
    const rewake = () => {
      if (document.visibilityState === "visible") unlockAudio();
    };
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    document.addEventListener("visibilitychange", rewake);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("visibilitychange", rewake);
    };
  }, []);

  if (!sessionChecked || !token || initializing) return <ChatSkeleton />;

  const active = conversations.find((item) => item.id === activeId) ?? null;
  const activeMessages = active ? (messages[active.id] ?? []) : [];

  async function handleSend() {
    const text = draft.trim();
    if (!text || !active) return;
    setDraft("");
    await send(active.id, text);
  }

  function handleLogout() {
    logout();
    window.localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    router.replace("/");
  }

  // Leaving a group removes it from the list — if it was open, close the
  // details panel and drop the selection so the empty state shows instead
  // of a ghost thread.
  async function handleRemoveMember(id: string, memberId: string) {
    await removeGroupMember(id, memberId);
    if (memberId === user.id) {
      setDetailsOpen(false);
      if (activeId === id) {
        setActiveId(null);
        window.localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
      }
    }
  }

  function selectConversation(id: string) {
    if (active && active.id !== id) setDrafts((prev) => ({ ...prev, [active.id]: draft }));
    setActiveId(id);
    window.localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
    setDraft(drafts[id] ?? "");
    setMobileRailOpen(false);
    setDetailsOpen(false);
    markConversationRead(id);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex h-19 items-center justify-between border-b border-border px-4 min-[1500px]:px-0">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight group"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-linear-to-t from-primary/20 to-primary/0">
            <MessagesSquare className="size-5 group-hover:scale-103 duration-200" />
          </span>
          Chatty
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex h-[calc(100vh-109px)] max-w-360 overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          activeId={active?.id}
          user={user}
          token={token}
          connected={connection === "live"}
          unreadCounts={unreadCounts}
          open={mobileRailOpen}
          onSelect={selectConversation}
          onClose={() => setMobileRailOpen(false)}
          onLogout={handleLogout}
          onStartDirect={startDirect}
          onStartGroup={startGroup}
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
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold">
                {active ? conversationTitle(active, user.id) : "Your conversations"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {active
                  ? active.isGroup
                    ? `${active.participants?.length ?? 0} members`
                    : "Direct conversation"
                  : "Pick a chat from your circles to start reading"}
              </p>
            </div>
            {active && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDetailsOpen(true)}
                aria-label={
                  active.isGroup ? "Open group info" : "Open contact info"
                }
                title={active.isGroup ? "Group info" : "Contact info"}
              >
                <ArrowUpRight />
              </Button>
            )}
          </div>
          {active ? (
            <>
              <MessageList
                conversation={active}
                messages={activeMessages}
                user={user}
                loading={threadLoading}
              />
              <MessageComposer
                value={draft}
                onChange={setDraft}
                onSend={handleSend}
              />
            </>
          ) : (
            <div className="grid flex-1 place-items-center px-6 text-center">
              <div>
                <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-accent">
                  <MessagesSquare className="size-7 text-muted-foreground" />
                </span>
                <p className="font-medium">Nothing selected yet</p>
                <p className="mt-1 max-w-[36ch] text-sm leading-6 text-muted-foreground">
                  Choose a conversation from your circles — or start a new one
                  with the New chat button.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      {detailsOpen && active && (
        <ConversationDetails
          conversation={active}
          user={user}
          token={token}
          onClose={() => setDetailsOpen(false)}
          onRename={renameGroup}
          onAddMembers={addGroupMembers}
          onRemoveMember={handleRemoveMember}
          onPromote={promoteGroupAdmin}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border px-5 py-2 md:px-10">
        <div className="mx-auto max-w-7xl flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center">Chatty — a quieter way to stay close.</p>
        </div>
      </footer>
    </div>
  );
}
