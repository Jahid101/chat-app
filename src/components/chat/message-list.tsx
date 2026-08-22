"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { conversationTitle, type Conversation, type Message, type User } from "@/lib/chat-api";

function isOwnMessage(message: Message, user: User) {
  return Boolean(message.senderId) && message.senderId === user.id;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayLabel(timestamp: string): string {
  const date = new Date(timestamp);
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  if (day === today) return "Today";
  if (today - day === 86_400_000) return "Yesterday";
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(
    undefined,
    sameYear
      ? { month: "short", day: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" },
  );
}

export function MessageList({
  conversation,
  messages,
  user,
  loading = false,
}: {
  conversation: Conversation;
  messages: Message[];
  user: User;
  loading?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const nearLatestRef = useRef(true);
  const prevCountRef = useRef(messages.length);
  const [nearLatest, setNearLatest] = useState(true);
  const [pendingBelow, setPendingBelow] = useState(0);
  const conversationId = conversation.id;

  const senderNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const participant of conversation.participants ?? []) {
      if (participant.id && participant.name) map.set(participant.id, participant.name);
    }
    return map;
  }, [conversation]);

  // Skeleton only when there is nothing to show yet; cached threads stay
  // visible (stale-while-revalidate) while their refresh runs in background.
  const showSkeleton = loading && messages.length === 0;

  useEffect(() => {
    nearLatestRef.current = true;
    setNearLatest(true);
    setPendingBelow(0);
    prevCountRef.current = messages.length;
    requestAnimationFrame(() => {
      const scroller = scrollerRef.current;
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    const diff = messages.length - prevCountRef.current;
    prevCountRef.current = messages.length;
    if (diff <= 0) return;
    if (nearLatestRef.current) {
      setPendingBelow(0);
      const scroller = scrollerRef.current;
      scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
    } else {
      setPendingBelow((count) => count + diff);
    }
  }, [messages.length]);

  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const distanceFromLatest =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    const near = distanceFromLatest < 96;
    nearLatestRef.current = near;
    setNearLatest(near);
    if (near) setPendingBelow(0);
  }

  function scrollToBottom() {
    const scroller = scrollerRef.current;
    scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
    setPendingBelow(0);
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-12"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {showSkeleton ? (
            <>
              <p className="sr-only" role="status">
                Loading messages…
              </p>
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className={`flex animate-pulse ${row % 2 === 1 ? "justify-end" : "justify-start"}`}
                  style={{ animationDelay: `${row * 130}ms` }}
                >
                  <div
                    className={`h-11 rounded-2xl bg-accent ${
                      row % 2 === 1 ? "w-44 rounded-br-md" : "w-60 rounded-bl-md"
                    }`}
                  />
                </div>
              ))}
            </>
          ) : messages.length === 0 ? (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <Sparkles className="mx-auto mb-3 size-6 text-primary" />
                <p className="font-medium">A quiet beginning</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Say hello to{" "}
                  {conversation.isGroup
                    ? "the group"
                    : conversationTitle(conversation, user.id)}
                  .
                </p>
              </div>
            </div>
          ) : null}

          {!showSkeleton &&
            messages.map((message, index) => {
              const previous = messages[index - 1];
              const label = dayLabel(message.createdAt);
              const newDay =
                index === 0 || previous === undefined
                  ? true
                  : label !== dayLabel(previous.createdAt);
              return (
                <Fragment key={message.id}>
                  {newDay && (
                    <div className="my-1 flex items-center gap-3" role="separator">
                      <span className="h-px flex-1 bg-border" />
                      <span className="rounded-full bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
                        {label}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    own={isOwnMessage(message, user)}
                    showName={
                      !conversation.isGroup
                        ? false
                        : newDay ||
                          index === 0 ||
                          previous?.senderId !== message.senderId
                    }
                    senderName={
                      message.senderName ||
                      (message.senderId
                        ? senderNames.get(message.senderId)
                        : undefined)
                    }
                  />
                </Fragment>
              );
            })}
        </div>
      </div>

      {!nearLatest && !showSkeleton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer animate-in items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-lg shadow-black/5 fade-in slide-in-from-bottom-2 duration-300 transition-colors hover:bg-accent"
        >
          <ArrowDown className="size-4 text-primary" />
          {pendingBelow > 0
            ? `${pendingBelow} new message${pendingBelow === 1 ? "" : "s"}`
            : "Jump to latest"}
        </button>
      )}
    </div>
  );
}
