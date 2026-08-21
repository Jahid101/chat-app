"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageCirclePlus,
  MessageSquarePlus,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError, chatApi, normalizeUser, type User } from "@/lib/chat-api";

const SEARCH_MIN_LENGTH = 2;
const DEBOUNCE_MS = 300;

export function StartChatDialog({
  token,
  selfId,
  onClose,
  onStart,
}: {
  token: string;
  selfId: string;
  onClose: () => void;
  onStart: (otherUserId: string) => Promise<string>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < SEARCH_MIN_LENGTH) {
      setResults([]);
      setSearching(false);
      setSearchError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setSearching(true);
    setSearchError(null);

    const timer = window.setTimeout(async () => {
      try {
        const raw = await chatApi.search(token, trimmed);
        if (requestId !== requestIdRef.current) return;
        const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.users ?? []);
        setResults(
          list
            .map(normalizeUser)
            .filter((user: User) => user.id && user.id !== selfId),
        );
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        setResults([]);
        setSearchError(
          error instanceof ApiError
            ? `Search failed: ${error.message}`
            : "Search failed. Check your connection and try again.",
        );
      } finally {
        if (requestId === requestIdRef.current) setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [selfId, trimmed]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleStart(user: User) {
    if (creatingId) return;
    setCreateError(null);
    setCreatingId(user.id);
    try {
      await onStart(user.id);
    } catch (error) {
      setCreateError(
        error instanceof ApiError
          ? `Couldn't start the chat: ${error.message}`
          : "Couldn't start the chat. Try again in a moment.",
      );
    } finally {
      setCreatingId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid animate-in place-items-center bg-foreground/30 p-4 backdrop-blur-sm fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Start a new conversation"
    >
      <div className="flex max-h-[85vh] w-full max-w-md animate-in flex-col rounded-3xl border border-border bg-card p-6 shadow-2xl zoom-in-95 slide-in-from-bottom-2 fade-in duration-300">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              New conversation
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Find someone to talk to
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search by name or phone number.
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

        <label className="mt-5 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Maya or +1 202 555 0147"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            aria-label="Search people by name or phone"
          />
          {searching && (
            <span
              className="size-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent"
              aria-hidden
            />
          )}
        </label>

        {createError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {createError}
          </p>
        )}

        <div className="mt-4 min-h-55 flex-1 overflow-y-auto pr-1">
          {trimmed.length > 0 && trimmed.length < SEARCH_MIN_LENGTH ? (
            <p className="px-1 py-8 text-center text-sm text-muted-foreground">
              Keep typing — at least {SEARCH_MIN_LENGTH} characters.
            </p>
          ) : searchError ? (
            <p
              role="alert"
              className="px-1 py-8 text-center text-sm text-destructive"
            >
              {searchError}
            </p>
          ) : !searching &&
            results.length === 0 &&
            trimmed.length >= SEARCH_MIN_LENGTH ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-accent text-muted-foreground">
                <UserRound className="size-6" />
              </span>
              <p className="max-w-[26ch] text-sm text-muted-foreground">
                No one matches “{trimmed}”. Check the spelling or try their
                phone number.
              </p>
            </div>
          ) : results.length === 0 && trimmed.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-accent text-muted-foreground">
                <MessageSquarePlus className="size-6" />
              </span>
              <p className="max-w-[40ch] text-sm leading-6 text-muted-foreground">
                Search by a number or name to find people on Chatty and open a
                direct conversation.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {results.map((user) => (
                <li key={user.id}>
                  <button
                    onClick={() => handleStart(user)}
                    disabled={Boolean(creatingId)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-accent disabled:cursor-default disabled:opacity-60 cursor-pointer ${
                      creatingId && creatingId !== user.id ? "opacity-50" : ""
                    }`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/7 font-semibold">
                      {creatingId === user.id ? (
                        <span
                          className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                          aria-hidden
                        />
                      ) : (
                        user.name.slice(0, 1).toUpperCase() || "?"
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {user.name || "Unnamed user"}
                      </span>
                      {user.phone && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.phone}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-primary">
                      {creatingId === user.id ? (
                        "Starting…"
                      ) : (
                        <MessageCirclePlus className="size-6" />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
