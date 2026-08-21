"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { MessageBubble } from "@/components/chat/message-bubble";
import type { Message, User } from "@/lib/chat-api";

function isOwnMessage(message: Message, user: User) {
  return message.senderId === user.id || message.senderName === user.name;
}

export function MessageList({
  conversationId,
  messages,
  user,
}: {
  conversationId: string;
  messages: Message[];
  user: User;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isNearLatestRef = useRef(true);

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
        {messages.length === 0 && (
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
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            own={isOwnMessage(message, user)}
            showName={
              index === 0 ||
              messages[index - 1]?.senderName !== message.senderName
            }
          />
        ))}
      </div>
    </div>
  );
}
