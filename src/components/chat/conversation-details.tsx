"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Crown,
  LogOut,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  UserMinus,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ApiError, type Conversation, type User } from "@/lib/chat-api";
import { useUserSearch } from "@/hooks/use-user-search";

function toMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function ConversationDetails({
  conversation,
  user,
  token,
  onClose,
  onRename,
  onAddMembers,
  onRemoveMember,
  onPromote,
}: {
  conversation: Conversation;
  user: User;
  token: string;
  onClose: () => void;
  onRename: (id: string, name: string) => Promise<void>;
  onAddMembers: (id: string, userIds: string[]) => Promise<void>;
  onRemoveMember: (id: string, userId: string) => Promise<void>;
  onPromote: (id: string, userId: string) => Promise<void>;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isGroup = Boolean(conversation.isGroup);

  return (
    <div
      className="fixed inset-0 z-50 flex animate-in justify-end bg-foreground/30 backdrop-blur-sm fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Conversation details"
    >
      <section
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-md animate-in flex-col border-l border-border bg-card shadow-2xl slide-in-from-right fade-in duration-300"
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {isGroup ? "Group info" : "Contact info"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
            <X />
          </Button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          {isGroup ? (
            <>
              <GroupHeader
                conversation={conversation}
                user={user}
                onRename={onRename}
              />
              <MembersSection
                conversation={conversation}
                user={user}
                onRemoveMember={onRemoveMember}
                onPromote={onPromote}
              />
              <AddPeopleSection
                conversation={conversation}
                user={user}
                token={token}
                onAddMembers={onAddMembers}
              />
              <LeaveSection
                conversation={conversation}
                user={user}
                onRemoveMember={onRemoveMember}
              />
            </>
          ) : (
            <DirectInfo conversation={conversation} user={user} />
          )}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Group header: avatar, renameable name, membership meta.
// ---------------------------------------------------------------------------

function GroupHeader({
  conversation,
  user,
  onRename,
}: Pick<Props, "conversation" | "user"> & { onRename: Props["onRename"] }) {
  const isAdmin = conversation.admins?.includes(user.id) ?? false;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the draft in sync when a rename lands from elsewhere (e.g. refresh).
  useEffect(() => {
    setDraft(conversation.name);
  }, [conversation.name]);

  async function save() {
    const next = draft.trim();
    if (!next || next === conversation.name || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onRename(conversation.id, next);
      setEditing(false);
    } catch (err) {
      setError(toMessage(err, "Couldn't rename the group. Try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <UsersRound className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={draft}
                maxLength={60}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void save();
                  if (e.key === "Escape") setEditing(false);
                }}
                className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-base font-semibold outline-none focus-within:ring-2 focus-within:ring-ring"
                aria-label="Group name"
              />
              <Button size="icon" onClick={() => void save()} disabled={busy} aria-label="Save name">
                {busy ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                ) : (
                  <Check className="size-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setDraft(conversation.name);
                  setError(null);
                }}
                disabled={busy}
                aria-label="Cancel renaming"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="truncate text-xl font-semibold tracking-tight">
                {conversation.name || "Unnamed group"}
              </h3>
              {isAdmin && (
                <button
                  onClick={() => {
                    setDraft(conversation.name);
                    setEditing(true);
                  }}
                  className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Rename group"
                >
                  <Pencil className="size-3.5" />
                </button>
              )}
            </div>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            {conversation.participants?.length ?? 0} members
            {isAdmin && (
              <>
                <span aria-hidden>·</span>
                <Crown className="size-3 text-primary" aria-hidden />
                you&rsquo;re an admin
              </>
            )}
          </p>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Members list: role badges + admin-only promote/remove actions.
// ---------------------------------------------------------------------------

function MembersSection({
  conversation,
  user,
  onRemoveMember,
  onPromote,
}: Pick<Props, "conversation" | "user"> & {
  onRemoveMember: Props["onRemoveMember"];
  onPromote: Props["onPromote"];
}) {
  const isAdmin = conversation.admins?.includes(user.id) ?? false;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<User | null>(null);

  const adminsSet = new Set(conversation.admins ?? []);
  const members = (conversation.participants ?? []).filter((m) => m.id);
  // Admins float to the top so roles read at a glance; rest alphabetical.
  const ordered = [...members].sort(
    (a, b) =>
      Number(adminsSet.has(b.id)) - Number(adminsSet.has(a.id)) ||
      a.name.localeCompare(b.name),
  );

  async function runAction(action: () => Promise<void>, id: string) {
    if (busyId) return;
    setBusyId(id);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(toMessage(err, "That didn't go through. Try again."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section aria-label={`Members (${ordered.length})`}>
      <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Members · {ordered.length}
      </h4>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <ul className="mt-3 flex flex-col gap-1">
        {ordered.map((member) => {
          const memberIsAdmin = adminsSet.has(member.id);
          const isSelf = member.id === user.id;
          const canPromote = isAdmin && !isSelf && !memberIsAdmin;
          const canRemove = isAdmin && !isSelf;

          return (
            <li key={member.id}>
              <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/7 text-sm font-semibold">
                  {member.name.slice(0, 1).toUpperCase() || "?"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {member.name || "Unnamed user"}
                    {isSelf && (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </span>
                  {member.phone && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {member.phone}
                    </span>
                  )}
                </span>

                {memberIsAdmin && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    <Crown className="size-3" aria-hidden />
                    Admin
                  </span>
                )}

                {canPromote && (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={Boolean(busyId)}
                    onClick={() =>
                      void runAction(
                        () => onPromote(conversation.id, member.id),
                        member.id,
                      )
                    }
                    aria-label={`Make ${member.name || "member"} an admin`}
                    title={`Make ${member.name || "member"} an admin`}
                  >
                    {busyId === member.id ? (
                      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                  </Button>
                )}

                {canRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={Boolean(busyId)}
                    onClick={() => setConfirmRemove(member)}
                    aria-label={`Remove ${member.name || "member"} from group`}
                    title={`Remove ${member.name || "member"}`}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <UserMinus className="size-4" />
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {confirmRemove && (
        <ConfirmDialog
          title={`Remove ${confirmRemove.name || "this member"}?`}
          description={`They'll leave "${conversation.name}" and stop seeing its messages. You can add them back later.`}
          confirmLabel="Remove"
          onClose={() => setConfirmRemove(null)}
          onConfirm={() => {
            const target = confirmRemove;
            setConfirmRemove(null);
            void runAction(() => onRemoveMember(conversation.id, target.id), target.id);
          }}
        />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Add people: same debounced search as the start dialog, minus existing members.
// ---------------------------------------------------------------------------

function AddPeopleSection({
  conversation,
  user,
  token,
  onAddMembers,
}: Pick<Props, "conversation" | "user" | "token"> & {
  onAddMembers: Props["onAddMembers"];
}) {
  const existingIds = (conversation.participants ?? [])
    .map((m) => m.id)
    .filter(Boolean);
  const { query, setQuery, results, searching, error, minLength } =
    useUserSearch(token, [user.id, ...existingIds]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  async function add(member: User) {
    if (addingId) return;
    setAddingId(member.id);
    setAddError(null);
    try {
      // The refreshed conversation excludes them from future results.
      await onAddMembers(conversation.id, [member.id]);
    } catch (err) {
      setAddError(toMessage(err, `Couldn't add ${member.name || "them"}.`));
    } finally {
      setAddingId(null);
    }
  }

  return (
    <section aria-label="Add people">
      <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Add people
      </h4>

      <label className="mt-3 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone number"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          aria-label="Search people to add"
        />
        {searching && (
          <span
            className="size-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden
          />
        )}
      </label>

      {(error || addError) && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error ?? addError}
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {results.map((candidate) => (
            <li key={candidate.id}>
              <div className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-accent">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/7 text-sm font-semibold">
                  {candidate.name.slice(0, 1).toUpperCase() || "?"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {candidate.name || "Unnamed user"}
                  </span>
                  {candidate.phone && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {candidate.phone}
                    </span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={Boolean(addingId)}
                  onClick={() => void add(candidate)}
                  className="cursor-pointer gap-1.5 text-primary hover:text-primary"
                >
                  {addingId === candidate.id ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  Add
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {query.trim().length >= minLength &&
        !searching &&
        !error &&
        results.length === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            No one new matches &ldquo;{query.trim()}&rdquo;.
          </p>
        )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Leave group: DELETE with your own id — guarded by a confirmation.
// ---------------------------------------------------------------------------

function LeaveSection({
  conversation,
  user,
  onRemoveMember,
}: Pick<Props, "conversation" | "user"> & {
  onRemoveMember: Props["onRemoveMember"];
}) {
  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leave() {
    if (leaving) return;
    setLeaving(true);
    setError(null);
    try {
      // The view detects the self-removal, clears selection, closes panels.
      await onRemoveMember(conversation.id, user.id);
    } catch (err) {
      setError(toMessage(err, "Couldn't leave the group. Try again."));
      setLeaving(false);
    }
  }

  return (
    <section aria-label="Leave group" className="border-t border-border pt-6">
      <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-destructive">
        Danger zone
      </h4>
      {error && (
        <p role="alert" className="mb-3 mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        variant="outline"
        onClick={() => setConfirming(true)}
        disabled={leaving}
        className="mt-3 w-full cursor-pointer border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {leaving ? (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
        ) : (
          <LogOut className="size-4" />
        )}
        Leave group
      </Button>

      {confirming && (
        <ConfirmDialog
          title="Leave this group?"
          description={`You'll stop receiving messages from "${conversation.name}". Someone can add you back if you change your mind.`}
          confirmLabel="Leave group"
          icon={<LogOut className="size-5 text-destructive" />}
          onClose={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            void leave();
          }}
        />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Direct-message fallback: there's nothing to manage yet, but the panel
// still opens instead of doing nothing.
// ---------------------------------------------------------------------------

function DirectInfo({ conversation, user }: { conversation: Conversation; user: User }) {
  const other =
    conversation.participant ??
    conversation.participants?.find((p) => p.id !== user.id);

  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="grid size-16 place-items-center rounded-3xl bg-accent text-2xl font-semibold">
        {(other?.name || "?").slice(0, 1).toUpperCase()}
      </span>
      <h3 className="mt-4 text-xl font-semibold tracking-tight">
        {other?.name || "Direct message"}
      </h3>
      {other?.phone && (
        <p className="mt-1 text-sm text-muted-foreground">{other.phone}</p>
      )}
      <p className="mt-6 max-w-[32ch] text-sm leading-6 text-muted-foreground">
        Direct conversations are just between the two of you — no settings to
        manage here.
      </p>
    </div>
  );
}

type Props = {
  conversation: Conversation;
  user: User;
  token: string;
  onClose: () => void;
  onRename: (id: string, name: string) => Promise<void>;
  onAddMembers: (id: string, userIds: string[]) => Promise<void>;
  onRemoveMember: (id: string, userId: string) => Promise<void>;
  onPromote: (id: string, userId: string) => Promise<void>;
};
