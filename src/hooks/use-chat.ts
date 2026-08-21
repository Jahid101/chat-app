"use client";

import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  SOCKET_BASE,
  chatApi,
  normalizeConversation,
  normalizeMessage,
  normalizeUser,
  type Conversation,
  type Message,
  type User,
} from "@/lib/chat-api";
import { demoConversations, demoMessages, demoUser } from "@/lib/demo-data";

export type ConnectionState = "demo" | "connecting" | "live" | "offline";

const TOKEN_KEY = "Chatty-token";

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

async function fetchConversations(token: string): Promise<Conversation[]> {
  const raw = await chatApi.conversations(token);
  const list = Array.isArray(raw) ? raw : (raw?.conversations ?? []);
  return list.map(normalizeConversation);
}

export function useChat() {
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [user, setUser] = useState<User>(demoUser);
  const [conversations, setConversations] =
    useState<Conversation[]>(demoConversations);
  const [messages, setMessages] =
    useState<Record<string, Message[]>>(demoMessages);
  const [connection, setConnection] = useState<ConnectionState>(() =>
    readStoredToken() ? "connecting" : "demo",
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    setConnection("connecting");
    chatApi
      .me(token)
      .then((raw) => {
        if (!cancelled) setUser(normalizeUser(raw));
      })
      .catch(() => {
        if (cancelled) return;
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setConnection("offline");
      });

    fetchConversations(token)
      .then((next) => {
        if (!cancelled) setConversations(next);
      })
      .catch(() => {
        if (!cancelled) setConnection("offline");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_BASE, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => setConnection("live"));
    socket.on("disconnect", () => setConnection("offline"));
    socket.on("connect_error", () => setConnection("offline"));

    socket.on("message:new", (raw) => {
      const message = normalizeMessage(raw);
      const conversationId = message.conversationId;
      if (!conversationId) return;
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [
          ...(prev[conversationId] ?? []).filter((m) => m.id !== message.id),
          message,
        ],
      }));
    });

    socket.on("conversation:updated", () => {
      fetchConversations(token)
        .then(setConversations)
        .catch(() => undefined);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const send = useCallback(
    async (conversationId: string, text: string) => {
      const optimistic: Message = {
        id: `pending-${Date.now()}`,
        conversationId,
        senderId: user.id,
        senderName: user.name,
        text,
        createdAt: new Date().toISOString(),
        pending: true,
      };

      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), optimistic],
      }));

      if (!token) {
        window.setTimeout(() => {
          setMessages((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] ?? []).map((m) =>
              m.id === optimistic.id ? { ...m, pending: false } : m,
            ),
          }));
        }, 650);
        return;
      }

      try {
        const sent = normalizeMessage(
          await chatApi.send(token, conversationId, text),
        );
        setMessages((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] ?? []).map((m) =>
            m.id === optimistic.id ? sent : m,
          ),
        }));
      } catch {
        setMessages((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] ?? []).map((m) =>
            m.id === optimistic.id ? { ...m, pending: false, failed: true } : m,
          ),
        }));
      }
    },
    [token, user],
  );

  const login = useCallback(async (name: string, phone: string) => {
    const raw = await chatApi.login(name, phone);
    const nextToken = raw?.token ?? raw?.access_token ?? raw?.jwt;
    if (!nextToken) throw new Error("No token returned");
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    setUser(normalizeUser(raw?.user ?? raw));
    setToken(nextToken);
  }, []);

  const markConversationRead = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  }, []);

  return {
    token,
    user,
    conversations,
    messages,
    connection,
    send,
    login,
    markConversationRead,
  };
}
