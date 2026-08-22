"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { clearToken, readToken, writeToken } from "@/lib/auth-token";
import { playMessageChime } from "@/lib/sound";

export type ConnectionState = "demo" | "connecting" | "live" | "offline";

const EMPTY_USER: User = { id: "", name: "" };

async function fetchConversations(token: string): Promise<Conversation[]> {
  const raw = await chatApi.conversations(token);
  const list = Array.isArray(raw)
    ? raw
    : (raw?.data ?? raw?.conversations ?? []);
  return list.map(normalizeConversation);
}

export function useChat() {
  const [token, setToken] = useState<string | null>(readToken);
  const [user, setUser] = useState<User>(EMPTY_USER);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [connection, setConnection] = useState<ConnectionState>(() =>
    readToken() ? "connecting" : "demo",
  );
  // True while the session (me + conversations) is being fetched for a token;
  // lets views hold a skeleton instead of flashing default data.
  const [initializing, setInitializing] = useState<boolean>(
    () => Boolean(readToken()),
  );

  const invalidateSession = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(EMPTY_USER);
    setConversations([]);
    setMessages({});
    setConnection("demo");
    setInitializing(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    let pending = 2;
    const settle = () => {
      if (!cancelled && --pending === 0) setInitializing(false);
    };

    setConnection("connecting");
    setInitializing(true);

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
      })
      .finally(settle);

    fetchConversations(token)
      .then((next) => {
        if (!cancelled) setConversations(next);
      })
      .catch(() => {
        if (!cancelled) setConnection("offline");
      })
      .finally(settle);

    return () => {
      cancelled = true;
    };
  }, [invalidateSession, token]);

  const refreshConversations = useCallback(async () => {
    if (!token) return [];
    try {
      const next = await fetchConversations(token);
      setConversations(next);
      return next;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        invalidateSession();
      }
      return [];
    }
  }, [invalidateSession, token]);

  // Latest user id without re-subscribing the socket on profile loads.
  const currentUserIdRef = useRef(user.id);
  useEffect(() => {
    currentUserIdRef.current = user.id;
  }, [user.id]);

  // Which conversation the user is currently looking at (set by the view),
  // so we know when an incoming message deserves a badge + chime.
  const viewingIdRef = useRef<string | null>(null);
  const setViewingConversation = useCallback((id: string | null) => {
    viewingIdRef.current = id;
  }, []);

  // Locally-tracked unread counts — the API has no seen/delivered state,
  // so badges are ours: incremented on background messages, zeroed on open.
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const markConversationRead = useCallback((id: string) => {
    setUnreadCounts((prev) => (prev[id] ? { ...prev, [id]: 0 } : prev));
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  }, []);

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
      // Someone else messaged us → refresh the sidebar so its preview,
      // unread badge, and ordering reflect it. Own sends refresh separately.
      if (!message.senderId || message.senderId !== currentUserIdRef.current) {
        void refreshConversations();
        // Not looking at that thread? Badge it and chime softly.
        if (message.senderId && conversationId !== viewingIdRef.current) {
          setUnreadCounts((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] ?? 0) + 1,
          }));
          playMessageChime();
        }
      }
    });

    socket.on("conversation:updated", () => {
      fetchConversations(token)
        .then(setConversations)
        .catch(() => undefined);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserIdRef, refreshConversations, token]);

  // Conversation history ------------------------------------------------------
  const [threadLoading, setThreadLoading] = useState(false);
  const threadRequestRef = useRef(0);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!token || !conversationId) return;
      const request = ++threadRequestRef.current;
      setThreadLoading(true);
      try {
        const raw = await chatApi.messages(token, conversationId);
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.messages)
            ? raw.messages
            : [];
        if (request !== threadRequestRef.current) return;
        // The API returns newest-first; normalize to oldest-first so the
        // thread reads top-to-bottom and new messages land at the bottom.
        const ordered = list
          .map(normalizeMessage)
          .sort(
            (a: Message, b: Message) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        setMessages((prev) => ({
          ...prev,
          [conversationId]: ordered,
        }));
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          invalidateSession();
          return;
        }
        if (request === threadRequestRef.current) {
          setConnection("offline");
          setMessages((prev) => ({ ...prev, [conversationId]: prev[conversationId] ?? [] }));
        }
      } finally {
        if (request === threadRequestRef.current) setThreadLoading(false);
      }
    },
    [invalidateSession, token],
  );

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

      if (!token) return;

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
        // Keep the sidebar (last message, ordering) in sync with what was sent.
        void refreshConversations();
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
    [invalidateSession, refreshConversations, token, user],
  );

  const startDirect = useCallback(
    async (otherUserId: string): Promise<string> => {
      if (!token) throw new Error("You need to be signed in.");
      const created = await chatApi.createConversation(token, otherUserId);
      await refreshConversations();
      return String(created?._id ?? created?.id ?? "");
    },
    [refreshConversations, token],
  );

  // Shared plumbing for every group mutation: run the API call, re-sync the
  // conversation list (the backend returns the updated conversation, but a
  // full refresh also fixes ordering/previews), and treat 401 as a dead
  // session. Errors propagate so the UI can show them inline.
  const mutateGroup = useCallback(
    async <T,>(action: (t: string) => Promise<T>): Promise<T> => {
      if (!token) throw new Error("You need to be signed in.");
      try {
        const result = await action(token);
        await refreshConversations();
        return result;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) invalidateSession();
        throw error;
      }
    },
    [invalidateSession, refreshConversations, token],
  );

  const startGroup = useCallback(
    async (name: string, participantIds: string[]): Promise<string> => {
      const created = await mutateGroup((t) =>
        chatApi.createGroup(t, name.trim(), participantIds),
      );
      return String(created?._id ?? created?.id ?? "");
    },
    [mutateGroup],
  );

  const renameGroup = useCallback(
    async (id: string, name: string) => {
      await mutateGroup((t) => chatApi.renameGroup(t, id, name.trim()));
    },
    [mutateGroup],
  );

  const addGroupMembers = useCallback(
    async (id: string, userIds: string[]) => {
      await mutateGroup((t) => chatApi.addGroupParticipants(t, id, userIds));
    },
    [mutateGroup],
  );

  // Passing your own id is how you leave the group — same endpoint.
  const removeGroupMember = useCallback(
    async (id: string, userId: string) => {
      await mutateGroup((t) => chatApi.removeGroupParticipant(t, id, userId));
    },
    [mutateGroup],
  );

  const promoteGroupAdmin = useCallback(
    async (id: string, userId: string) => {
      await mutateGroup((t) => chatApi.promoteGroupAdmin(t, id, userId));
    },
    [mutateGroup],
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

  return {
    token,
    user,
    conversations,
    messages,
    connection,
    initializing,
    threadLoading,
    unreadCounts,
    send,
    login,
    logout,
    startDirect,
    startGroup,
    renameGroup,
    addGroupMembers,
    removeGroupMember,
    promoteGroupAdmin,
    refreshConversations,
    loadMessages,
    markConversationRead,
    setViewingConversation,
  };
}
