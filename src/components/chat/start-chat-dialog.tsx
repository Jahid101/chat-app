"use client";

import { useEffect, useState } from "react";
import {
  Check,
  MessageCirclePlus,
  MessageSquarePlus,
  Plus,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError, type User } from "@/lib/chat-api";
import { useUserSearch } from "@/hooks/use-user-search";

type Mode = "direct" | "group";

// The API rejects group creation with fewer than 3 total members
// (you + 2 others), so mirror that rule in the UI instead of letting
// people hit a server error.
const MIN_OTHER_MEMBERS = 2;

export function StartChatDialog({
  token,
  selfId,
  initialMode = "direct",
  onClose,
  onStartDirect,
  onStartGroup,
}: {
  token: string;
  selfId: string;
  initialMode?: Mode;
  onClose: () => void;
  onStartDirect: (otherUserId: string) => Promise<string>;
  onStartGroup: (name: string, participantIds: string[]) => Promise<string>;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState<User[]>([]);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const selectedIds = selected.map((u) => u.id);
  const { query, setQuery, results, searching, error: searchError, minLength } =
    useUserSearch(token, [selfId, ...(mode === "group" ? selectedIds : [])]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function switchMode(next: Mode) {
    setMode(next);
    setCreateError(null);
  }

  async function handleStartDirect(user: User) {
    if (creatingId) return;
    setCreateError(null);
    setCreatingId(user.id);
    try {
      await onStartDirect(user.id);
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

  function toggleMember(user: User) {
    setSelected((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user],
    );
  }

  const trimmedName = groupName.trim();
  const enoughMembers = selected.length >= MIN_OTHER_MEMBERS;
  const nameValid = trimmedName.length >= 2;

  async function handleCreateGroup() {
    if (creatingGroup || !nameValid || !enoughMembers) return;
    setCreateError(null);
    setCreatingGroup(true);
    try {
      await onStartGroup(
        trimmedName,
        selected.map((u) => u.id),
      );
      onClose();
    } catch (error) {
      setCreateError(
        error instanceof ApiError
          ? `Couldn't create the group: ${error.message}`
          : "Couldn't create the group. Try again in a moment.",
      );
    } finally {
      setCreatingGroup(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid animate-in place-items-center bg-foreground/30 p-4 backdrop-blur-sm fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "group" ? "Create a group" : "Start a new conversation"}
    >
      <div className="flex max-h-[85vh] w-full max-w-md animate-in flex-col rounded-3xl border border-border bg-card p-6 shadow-2xl zoom-in-95 slide-in-from-bottom-2 fade-in duration-300">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              New conversation
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              {mode === "group" ? "Create a group" : "Find someone to talk to"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "group"
                ? `Name it and add at least ${MIN_OTHER_MEMBERS + 1} people including you.`
                : "Search by name or phone number."}
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

        <div
          className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-accent p-1"
          role="tablist"
          aria-label="Conversation type"
        >
          <button
            role="tab"
            aria-selected={mode === "direct"}
            onClick={() => switchMode("direct")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === "direct"
                ? "bg-card shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCirclePlus className="size-4" />
            Direct message
          </button>
          <button
            role="tab"
            aria-selected={mode === "group"}
            onClick={() => switchMode("group")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === "group"
                ? "bg-card shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UsersRound className="size-4" />
            Group
          </button>
        </div>

        {mode === "group" && (
          <>
            <label className="mt-4 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring">
              <span className="sr-only">Group name</span>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder='Group name — e.g. "Project Team"'
                maxLength={60}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                aria-label="Group name"
              />
            </label>

            {selected.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {selected.map((user) => (
                  <li
                    key={user.id}
                    className="flex max-w-full items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-3 pr-1.5 text-xs font-medium"
                  >
                    <span className="max-w-36 truncate">{user.name}</span>
                    <button
                      onClick={() => toggleMember(user)}
                      aria-label={`Remove ${user.name || "member"} from selection`}
                      className="grid size-4 shrink-0 cursor-pointer place-items-center rounded-full bg-primary/15 transition-colors hover:bg-destructive/25"
                    >
                      <X className="size-2.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <label
          className={`flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring ${
            mode === "group" ? "mt-3" : "mt-5"
          }`}
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === "group"
                ? "Add members — search name or phone"
                : "e.g. Maya or +1 202 555 0147"
            }
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

        {searchError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {searchError}
          </p>
        )}
        {createError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {createError}
          </p>
        )}

        <div className="mt-4 min-h-55 flex-1 overflow-y-auto pr-1">
          {query.trim().length > 0 && query.trim().length < minLength ? (
            <p className="px-1 py-8 text-center text-sm text-muted-foreground">
              Keep typing — at least {minLength} characters.
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
            query.trim().length >= minLength ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-accent text-muted-foreground">
                <UsersRound className="size-6" />
              </span>
              <p className="max-w-[26ch] text-sm text-muted-foreground">
                No one matches &ldquo;{query.trim()}&rdquo;. Check the spelling
                or try their phone number.
              </p>
            </div>
          ) : results.length === 0 && query.trim().length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-accent text-muted-foreground">
                {mode === "group" ? (
                  <UsersRound className="size-6" />
                ) : (
                  <MessageSquarePlus className="size-6" />
                )}
              </span>
              <p className="max-w-[40ch] text-sm leading-6 text-muted-foreground">
                {mode === "group"
                  ? "Search for people to add to your group. You can pick as many as you like."
                  : "Search by a number or name to find people on Chatty and open a direct conversation."}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {results.map((user) => {
                const picked = selected.some((u) => u.id === user.id);
                const busyDirect = creatingId !== null && !picked;
                return (
                  <li key={user.id}>
                    <button
                      onClick={() =>
                        mode === "group"
                          ? toggleMember(user)
                          : handleStartDirect(user)
                      }
                      disabled={Boolean(creatingId) || creatingGroup}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-accent disabled:cursor-default disabled:opacity-60 cursor-pointer ${
                        busyDirect ? "opacity-50" : ""
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
                        {mode === "group" ? (
                          picked ? (
                            <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-3.5" />
                            </span>
                          ) : (
                            <Plus className="size-5" />
                          )
                        ) : creatingId === user.id ? (
                          "Starting…"
                        ) : (
                          <MessageCirclePlus className="size-6" />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {mode === "group" && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs leading-5 text-muted-foreground">
              {!nameValid
                ? "Give your group a name first."
                : !enoughMembers
                  ? `Pick ${MIN_OTHER_MEMBERS - selected.length} more ${
                      MIN_OTHER_MEMBERS - selected.length === 1
                        ? "person"
                        : "people"
                    } — groups need ${MIN_OTHER_MEMBERS + 1} members including you.`
                  : `${selected.length + 1} members ready.`}
            </p>
            <Button
              onClick={handleCreateGroup}
              disabled={!nameValid || !enoughMembers || creatingGroup}
            >
              {creatingGroup ? (
                <>
                  <span
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden
                  />
                  Creating…
                </>
              ) : (
                <>
                  <UsersRound className="size-4" />
                  Create group
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
