"use client";

import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  ApiError,
  SOCKET_BASE,
  chatApi,
  extractToken,
  normalizeConversation,
  normalizeMessage,
  normalizeUser,
  type Conversation,
  type Message,
  type User,
} from "@/lib/chat-api";
import { demoConversations, demoMessages, demoUser } from "@/lib/demo-data";
import { clearToken, readToken, writeToken } from "@/lib/auth-token";

export type ConnectionState = "demo" | "connecting" | "live" | "offline";

async function fetchConversations(token: string): Promise<Conversation[]> {
  const raw = await chatApi.conversations(token);
  const list = Array.isArray(raw) ? raw : (raw?.conversations ?? []);
  return list.map(normalizeConversation);
}

export function useChat() {
  const [token, setToken] = useState<string | null>(readToken);
  const [user, setUser] = useState<User>(demoUser);
  const [conversations, setConversations] =
    useState<Conversation[]>(demoConversations);
  const [messages, setMessages] =
    useState<Record<string, Message[]>>(demoMessages);
  const [connection, setConnection] = useState<ConnectionState>(() =>
    readToken() ? "connecting" : "demo",
  );

  const invalidateSession = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(demoUser);
    setConversations(demoConversations);
    setMessages(demoMessages);
    setConnection("demo");
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    setConnection("connecting");
    chatApi
      .me(token)
      .then((raw) => {
        if (!cancelled) setUser(normalizeUser(raw));
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          invalidateSession();
          return;
        }
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
    socket.on("connect_error", (error) => {
      setConnection("offline");
      const message = String(error?.message ?? "");
      if (/auth|token|unauthor|invalid|401/i.test(message)) {
        invalidateSession();
      }
    });

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
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          invalidateSession();
        }
        setMessages((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] ?? []).map((m) =>
            m.id === optimistic.id ? { ...m, pending: false, failed: true } : m,
          ),
        }));
      }
    },
    [invalidateSession, token, user],
  );

  const login = useCallback(async (name: string, phone: string) => {
    const raw = await chatApi.login(name, phone);
    const nextToken = extractToken(raw);
    if (!nextToken) throw new Error("No token returned");
    writeToken(nextToken);
    setUser(normalizeUser(raw?.user ?? raw));
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    invalidateSession();
  }, [invalidateSession]);

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
    logout,
    markConversationRead,
  };
}
