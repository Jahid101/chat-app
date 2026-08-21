"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  Hash,
  Menu,
  Moon,
  Paperclip,
  Plus,
  Search,
  Send,
  Sparkles,
  Sun,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  chatApi,
  demoConversations,
  demoMessages,
  demoUser,
  normalizeConversation,
  normalizeMessage,
  normalizeUser,
  SOCKET_BASE,
  type Conversation,
  type Message,
  type User,
} from "@/lib/chat-api";

type Props = { mode?: "landing" | "chat" };

export function ChatApp({ mode = "landing" }: Props) {
  const [view, setView] = useState(mode);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(demoUser);
  const [conversations, setConversations] =
    useState<Conversation[]>(demoConversations);
  const [activeId, setActiveId] = useState("design");
  const [messages, setMessages] =
    useState<Record<string, Message[]>>(demoMessages);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [connection, setConnection] = useState<
    "demo" | "connecting" | "live" | "offline"
  >("demo");
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileRail, setMobileRail] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const active =
    conversations.find((item) => item.id === activeId) ?? conversations[0];
  const activeMessages = messages[active?.id] ?? [];
  const messageScrollerRef = useRef<HTMLDivElement>(null);
  const isNearLatestRef = useRef(true);
  const filtered = useMemo(
    () =>
      conversations.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [conversations, query],
  );

  useEffect(() => {
    const scroller = messageScrollerRef.current;
    if (!scroller || !isNearLatestRef.current) return;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  }, [activeId, activeMessages.length]);

  function handleMessageScroll() {
    const scroller = messageScrollerRef.current;
    if (!scroller) return;
    const distanceFromLatest =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    isNearLatestRef.current = distanceFromLatest < 96;
  }

  useEffect(() => {
    const scrollers = Array.from(
      document.querySelectorAll<HTMLElement>('[class*="overflow-y-auto"]'),
    );
    const scroller = scrollers.at(-1);
    if (!scroller) return;
    messageScrollerRef.current = scroller;
    isNearLatestRef.current = true;
    scroller.scrollTop = scroller.scrollHeight;
    scroller.addEventListener("scroll", handleMessageScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleMessageScroll);
  }, [activeId]);

  useEffect(() => {
    const saved = window.localStorage.getItem("taghyeer-theme") as
      | "light"
      | "dark"
      | null;
    const savedToken = window.localStorage.getItem("taghyeer-token");
    if (saved) setTheme(saved);
    if (savedToken) {
      setToken(savedToken);
      setConnection("connecting");
      chatApi
        .me(savedToken)
        .then((raw) => setUser(normalizeUser(raw)))
        .catch(() => {
          window.localStorage.removeItem("taghyeer-token");
          setConnection("offline");
        });
      chatApi
        .conversations(savedToken)
        .then((raw) =>
          setConversations(
            (Array.isArray(raw) ? raw : (raw?.conversations ?? [])).map(
              normalizeConversation,
            ),
          ),
        )
        .catch(() => setConnection("offline"));
    }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("taghyeer-theme", theme);
  }, [theme]);
  useEffect(() => {
    if (!token || !activeId) return;
    let socket: Socket | undefined;
    setConnection("connecting");
    try {
      socket = io(SOCKET_BASE, { auth: { token }, transports: ["websocket"] });
      socket.on("connect", () => setConnection("live"));
      socket.on("disconnect", () => setConnection("offline"));
      socket.on("message:new", (raw) => {
        const msg = normalizeMessage(raw);
        if (msg.conversationId === activeId)
          setMessages((prev) => ({
            ...prev,
            [activeId]: [
              ...(prev[activeId] ?? []).filter((item) => item.id !== msg.id),
              msg,
            ],
          }));
      });
      socket.on("conversation:updated", () =>
        chatApi
          .conversations(token)
          .then((raw) =>
            setConversations(
              (Array.isArray(raw) ? raw : (raw?.conversations ?? [])).map(
                normalizeConversation,
              ),
            ),
          )
          .catch(() => undefined),
      );
    } catch {
      setConnection("offline");
    }
    return () => socket?.disconnect();
  }, [token, activeId]);

  function selectConversation(id: string) {
    setDrafts((prev) => ({ ...prev, [activeId]: draft }));
    setActiveId(id);
    setDraft(drafts[id] ?? "");
    setMobileRail(false);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  }
  async function sendMessage() {
    const text = draft.trim();
    if (!text || !active) return;
    const optimistic: Message = {
      id: `pending-${Date.now()}`,
      conversationId: active.id,
      senderId: user.id,
      senderName: user.name,
      text,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => ({
      ...prev,
      [active.id]: [...(prev[active.id] ?? []), optimistic],
    }));
    setDraft("");
    if (!token) {
      window.setTimeout(
        () =>
          setMessages((prev) => ({
            ...prev,
            [active.id]: (prev[active.id] ?? []).map((m) =>
              m.id === optimistic.id ? { ...m, pending: false } : m,
            ),
          })),
        650,
      );
      return;
    }
    try {
      const sent = normalizeMessage(await chatApi.send(token, active.id, text));
      setMessages((prev) => ({
        ...prev,
        [active.id]: (prev[active.id] ?? []).map((m) =>
          m.id === optimistic.id ? sent : m,
        ),
      }));
    } catch {
      setMessages((prev) => ({
        ...prev,
        [active.id]: (prev[active.id] ?? []).map((m) =>
          m.id === optimistic.id ? { ...m, pending: false, failed: true } : m,
        ),
      }));
    }
  }
  async function doLogin(name: string, phone: string) {
    try {
      const raw = await chatApi.login(name, phone);
      const nextToken = raw?.token ?? raw?.access_token ?? raw?.jwt;
      if (!nextToken) throw new Error("No token returned");
      window.localStorage.setItem("taghyeer-token", nextToken);
      setToken(nextToken);
      setUser(normalizeUser(raw?.user ?? raw));
      setLoginOpen(false);
      setView("chat");
    } catch {
      setLoginOpen(false);
      setView("chat");
    }
  }

  if (view === "landing")
    return (
      <Landing
        theme={theme}
        setTheme={setTheme}
        onStart={() => setLoginOpen(true)}
        onDemo={() => setView("chat")}
        showAll={showAllFeatures}
        setShowAll={setShowAllFeatures}
      />
    );
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-8">
        <button
          onClick={() => setView("landing")}
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          Taghyeer
        </button>
        <div className="flex items-center gap-2">
          <Connection status={connection} />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("landing")}
          >
            Home
          </Button>
        </div>
      </header>
      <main className="mx-auto flex h-[calc(100vh-4rem)] max-w-[1440px] overflow-hidden">
        <aside
          className={`${mobileRail ? "absolute inset-0 z-20 flex" : "hidden"} w-full shrink-0 flex-col border-r border-border bg-card md:relative md:flex md:w-80`}
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
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileRail(false)}
              aria-label="Close conversations"
            >
              <X />
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
          <div className="flex flex-col gap-1 overflow-y-auto px-3">
            {filtered.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                item={conversation}
                active={conversation.id === activeId}
                onClick={() => selectConversation(conversation.id)}
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
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {token ? "Connected account" : "Preview mode"}
                </p>
              </div>
            </div>
          </div>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col bg-background">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileRail(true)}
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
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-12">
              <div className="mx-auto flex max-w-3xl flex-col gap-5">
                {activeMessages.length === 0 && (
                  <div className="grid min-h-64 place-items-center text-center">
                    <div>
                      <Sparkles className="mx-auto mb-3 size-6 text-primary" />
                      <p className="font-medium">A quiet beginning</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Send a note to start the conversation.
                      </p>
                    </div>
                  </div>
                )}
                {activeMessages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    own={
                      message.senderId === user.id ||
                      message.senderName === user.name
                    }
                    showName={
                      index === 0 ||
                      activeMessages[index - 1]?.senderName !==
                        message.senderName
                    }
                  />
                ))}
              </div>
            </div>
            <div className="border-t border-border bg-background p-4 md:px-12 md:py-5">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-end gap-2 rounded-2xl border border-input bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Attach a file"
                  >
                    <Paperclip />
                  </Button>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing &&
                        e.keyCode !== 229
                      ) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Write something thoughtful..."
                    rows={1}
                    className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
                    aria-label="Message composer"
                  />
                  <Button
                    size="icon"
                    onClick={sendMessage}
                    disabled={!draft.trim()}
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
          </div>
        </section>
      </main>
      {loginOpen && (
        <LoginDialog onClose={() => setLoginOpen(false)} onSubmit={doLogin} />
      )}
    </div>
  );
}

function Connection({ status }: { status: string }) {
  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
      {status === "live" ? (
        <Wifi className="size-3.5 text-primary" />
      ) : status === "offline" ? (
        <WifiOff className="size-3.5" />
      ) : (
        <span className="size-2 rounded-full bg-primary" />
      )}
      {status === "demo"
        ? "Preview mode"
        : status === "live"
          ? "Live"
          : status === "connecting"
            ? "Connecting"
            : "Offline"}
    </span>
  );
}
function ConversationRow({
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
function MessageBubble({
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
function Landing({
  theme,
  setTheme,
  onStart,
  onDemo,
  showAll,
  setShowAll,
}: {
  theme: "light" | "dark";
  setTheme: (v: "light" | "dark") => void;
  onStart: () => void;
  onDemo: () => void;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
        <a
          href="#top"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          Taghyeer
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#why" className="hover:text-foreground">
            Why it works
          </a>
          <a href="#preview" className="hover:text-foreground">
            Preview
          </a>
          <a href="#principles" className="hover:text-foreground">
            Principles
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </Button>
          <Button variant="outline" size="sm" onClick={onStart}>
            Open chat
          </Button>
        </div>
      </header>
      <main id="top">
        <section className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-14 md:grid-cols-[1.05fr_.95fr] md:items-center md:px-10 md:pb-28 md:pt-24">
          <div>
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <span className="size-2 rounded-full bg-primary" />
              Conversations with room to breathe
            </p>
            <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-[-0.06em] md:text-7xl">
              Talk less like a tool.{" "}
              <span className="text-muted-foreground">
                Make more room for people.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
              Taghyeer is a considered chat space for teams who care about the
              signal, the small details, and the moment a message finally lands.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={onStart}>
                Enter your conversations <ArrowUpRight data-icon="inline-end" />
              </Button>
              <Button size="lg" variant="ghost" onClick={onDemo}>
                Explore the preview{" "}
                <ChevronLeft className="rotate-180" data-icon="inline-end" />
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              No noisy feeds. No lost threads. Just the right people, in focus.
            </p>
          </div>
          <div id="preview" className="relative">
            <div className="absolute -inset-10 -z-10 rounded-full bg-accent/40 blur-3xl" />
            <div className="rounded-[2rem] border border-border bg-card p-3 shadow-2xl shadow-primary/10">
              <div className="rounded-[1.5rem] border border-border bg-background">
                <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                  <div className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Design circle</p>
                    <p className="text-xs text-muted-foreground">
                      8 members · 3 online
                    </p>
                  </div>
                  <span className="ml-auto size-2 rounded-full bg-primary" />
                </div>
                <div className="flex min-h-[330px] flex-col justify-end gap-4 p-5">
                  <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-card p-3 text-sm shadow-sm ring-1 ring-border">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Maya Chen
                    </p>
                    The new direction feels right.
                  </div>
                  <div className="ml-auto max-w-[78%] rounded-2xl rounded-br-md bg-primary p-3 text-sm text-primary-foreground">
                    That’s the feeling. Let’s keep the edges soft.
                  </div>
                  <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-card p-3 text-sm shadow-sm ring-1 ring-border">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Maya Chen
                    </p>
                    Morning. I pulled the latest notes into one place.
                  </div>
                </div>
                <div className="m-3 flex items-center gap-2 rounded-xl border border-input p-2">
                  <span className="flex-1 px-2 text-xs text-muted-foreground">
                    Write something thoughtful...
                  </span>
                  <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Send className="size-3.5" />
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Realtime, quietly
              </p>
              <p className="mt-1 text-sm font-semibold">
                Your messages arrive.
              </p>
            </div>
          </div>
        </section>
        <section id="why" className="border-y border-border bg-card/40">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-3 md:px-10 md:py-24">
            {[
              [
                "01",
                "Find the thread",
                "Search across your conversations without losing the shape of the day.",
              ],
              [
                "02",
                "Stay in the moment",
                "Realtime updates feel instant, but never interrupt the way you think.",
              ],
              [
                "03",
                "Make it yours",
                "Light, dark, groups, direct messages — a space that adjusts to your rhythm.",
              ],
            ].map(([number, title, copy]) => (
              <article key={number}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {number}
                </p>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                  {title}
                </h2>
                <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section
          id="principles"
          className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Built for the in-between
              </p>
              <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.04em]">
                The little details are the product.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Drafts stay where you left them. Reconnects catch you up. The
              interface gets out of your way when the conversation gets good.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-primary p-7 text-primary-foreground">
              <Sparkles className="size-5" />
              <h3 className="mt-12 text-2xl font-semibold">
                Quietly reliable.
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-primary-foreground/70">
                Optimistic sends and clear connection states keep the experience
                honest.
              </p>
            </div>
            <div className="rounded-3xl border border-border p-7">
              <Users className="size-5" />
              <h3 className="mt-12 text-2xl font-semibold">
                Human by default.
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                Good conversation is allowed to be spacious, specific, and a
                little unfinished.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-8 text-sm font-medium underline underline-offset-4"
          >
            {showAll ? "Show less" : "Show one more principle"}
          </button>
          {showAll && (
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              A thoughtful edge case beats a crowded feature list: when a
              connection drops, Taghyeer tells you what happened and catches up
              without duplicating the message you just sent.
            </p>
          )}
        </section>
      </main>
      <footer className="border-t border-border px-5 py-8 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Taghyeer — a quieter way to stay close.</span>
          <button
            onClick={onDemo}
            className="text-foreground underline underline-offset-4"
          >
            Open the working preview
          </button>
        </div>
      </footer>
    </div>
  );
}
function LoginDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (name: string, phone: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Welcome in
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Open your chat space
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your account, or explore the preview without signing in.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </Button>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="rounded-xl border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 202 555 0147"
              className="rounded-xl border border-input bg-background px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <Button
            className="mt-2 w-full"
            disabled={!name.trim() || !phone.trim()}
            onClick={() => onSubmit(name, phone)}
          >
            Continue <ArrowUpRight data-icon="inline-end" />
          </Button>
          <button
            className="text-sm text-muted-foreground underline underline-offset-4"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
