"use client";

import { useEffect, useMemo, useRef } from "react";
import { Sparkles } from "lucide-react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { conversationTitle, type Conversation, type Message, type User } from "@/lib/chat-api";

function isOwnMessage(message: Message, user: User) {
  return Boolean(message.senderId) && message.senderId === user.id;
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
  const isNearLatestRef = useRef(true);
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
    isNearLatestRef.current = true;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    requestAnimationFrame(() => {
      scroller.scrollTop = scroller.scrollHeight;
    });
  }, [conversationId]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !isNearLatestRef.current) return;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const distanceFromLatest =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    isNearLatestRef.current = distanceFromLatest < 96;
  }


  return (
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
          return (
            <MessageBubble
              key={message.id}
              message={message}
              own={isOwnMessage(message, user)}
              showName={
                !conversation.isGroup
                  ? false
                  : index === 0 || previous?.senderId !== message.senderId
              }
              senderName={
                message.senderName ||
                (message.senderId ? senderNames.get(message.senderId) : undefined)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
