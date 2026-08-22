# Thought Process Write-up

A short account of how I approached the Chatty task: the decisions I made, why I made them, where AI tools helped, and what I'd change with more time.

---

## Approach at a glance

Before writing any feature code I **probed the live API** with small scripts to verify every endpoint: real routes, real response shapes, real failure modes. That habit paid for itself repeatedly — several things behaved differently from how they read on paper (details in "Issues" below).

From there I built vertically rather than horizontally: auth → direct messages → realtime → groups → polish. Each layer was manually tested end-to-end with two browser profiles acting as two users before the next one started.

---

## Part 1 — Architecture and library choices

**Next.js App Router (given starter), React 19, TypeScript.** The landing page stays statically prerendered; `/chat` is a client island that gates rendering until the token has been read from storage, so no chat data can leak into prerendered HTML.

**One hook owns server state — no Redux/React Query.** All session, conversation, message, and socket state lives in a single `useChat` hook. Trade-off considered: React Query would have given me cache invalidation and retries for free, but this app has exactly one data source, one socket subscription, and a handful of mutations — a second mental model plus a dependency didn't pay rent. The cost of the hand-rolled route is explicit `refreshConversations()` calls after mutations; everything else got simpler.

**Normalization at the edge.** Every API response passes through `normalize*` functions in `lib/chat-api.ts`. Backend inconsistencies (varying id fields, envelope shapes, alias keys) are absorbed in one file, so hooks and components only ever see clean shapes. This was the single highest-leverage decision in the codebase — it turned most API quirks into non-events.

**Read-only socket, REST writes.** Messages are sent over REST and received over Socket.IO. That keeps optimistic-send logic (pending → delivered/failed) in exactly one place instead of racing an emit callback.

**localStorage persistence for theme, token, active conversation, and unread counts.** Trade-off accepted knowingly: this state is per-device and exposed to XSS by design; the reward is instant personalization with zero server round-trips. A production system with real accounts would move tokens to httpOnly cookies.

**Web Audio chime instead of an asset.** A two-tone ding synthesized at runtime costs ~50 lines, zero downloads, and adapts volume in code. Cost: browsers suspend audio contexts aggressively, so the module handles unlock-on-gesture and resume-after-suspension explicitly.

**Tailwind v4 CSS-first tokens + shadcn/ui patterns.** I kept the design-token workflow (oklch variables, semantic color roles) but hand-wrote the handful of primitives I needed (button, confirm dialog) rather than pulling the full component library into a small app.

---

## Part 2 — Product and UI design reasoning

**Group management lives in a details drawer, not a settings page.** Opening a panel beside the thread keeps you in context while renaming, promoting, or removing people. Permissions are derived directly from the conversation's `admins[]` array: actions you can't perform don't render at all — hiding beats disabling-and-erroring.

**Server rules are mirrored in the UI.** The API rejects groups with fewer than three members, so the create dialog enforces the same rule client-side with live copy ("groups need 3 members including you") instead of letting users discover it via a 400.

**Destructive actions get confirmations.** Leaving a group and removing a member both pass through a confirmation dialog — cheap friction in exactly the two places a misclick hurts.

**Unread badges are local-first.** The API exposes no seen/delivered/read state anywhere, so badges are tracked client-side: incremented on background messages, zeroed on open, persisted to localStorage. Documented honestly as per-device rather than pretending it's synced.

**Reading flow gets first-class treatment.** Day separators (`Today` / `Yesterday` / date), repeated sender names after breaks in group threads, and a jump-to-latest pill that counts messages arriving while you're scrolled up — because history reading is half the usage of any chat app.

**Landing page: quiet brand, alive product.** The brand voice is calm ("Talk less like a tool"), so instead of adding noise I made the hero mockup *live* — bubbles cascade in, a typing indicator loops, presence pulses. Every animation respects `prefers-reduced-motion`.

**Small honesty calls:** removed the decorative attachment button (no attachment API exists) and replaced it with something real — a dependency-free emoji picker. Skipped online-presence dots entirely because the API's `online` flag is a search-time snapshot; showing stale presence felt like lying.

---

## How I used AI tools

I used an **agentic AI coding assistant** (opencode CLI driven by a large LLM) as a continuous pair-programmer across the whole build.

**What it did well:**
- Scaffolding components and plumbing (socket lifecycle, normalization layers, drawer/dialog structure)
- Debugging sessions with me — e.g. tracing a notification-chime regression to a race condition where `AudioContext.resume()` hadn't settled before playback, and diagnosing that the socket was dialing `localhost` because an environment variable was missing
- Generating throwaway scripts to probe the live API before trusting its contract
- Drafting the README and API documentation, which I reviewed against reality

**What I drove myself:**
- Product direction: naming, what to build next, and — more importantly — what *not* to build (presence dots rejected, dead features removed rather than faked)
- Visual direction and iteration: layout choices, spacing rhythm, which sections earned their animations
- Verification: every flow tested manually with two accounts; regressions caught by use (the chime broke — I noticed before any tool did)

**What I changed or rejected from AI output:**
- Leftover debug logs and commented-out code were stripped in a dedicated cleanup pass
- Louder landing-page proposals were toned down to stay inside the brand's restraint
- Generated abstractions that outlived their usefulness (e.g. an unused prop drilled through three components) were cut

The division of labor that worked: AI for breadth and boilerplate velocity, me for taste, verification, and saying no.

---

## Issues I ran into with the given API

1. **Rename documented as `POST`, actually `PATCH`.** `POST /conversations/:id` returns 404; probing revealed `PATCH` works. Documented both in the API docs.
2. **Login body needs the phone number twice** (`phone` *and* `phoneNumber`). Sending either alone is unreliable; the client sends both.
3. **Inconsistent list envelopes.** `GET /conversations` returns either a bare array or `{ data: [...] }` depending on mood/path — normalizers accept both.
4. **Message history arrives newest-first**, opposite of display order; the client reverses on load.
5. **Non-uniform error bodies.** Some failures are `{ error: { message } }`, others `{ message }`; the fetch wrapper tries both before falling back to a generic message.
6. **No seen/delivered/read state exists anywhere.** Unread badges and delivery ticks are therefore a client-side construct, clearly labeled as such.
7. **Group minimum enforced only server-side.** Fewer than 3 members fails at submit time with a validation error — mirrored the rule in the UI so users never meet the 400.
8. **The `online` flag is a point-in-time snapshot**, not live presence. I chose not to render it rather than show stale truth.
9. **Free-tier hosting cold starts.** After idle, the service sleeps and the first request takes ~30–60s; sockets fail during wake-up. The client uses websocket→polling fallback, retries, and surfaces connection state honestly.
10. **Mutations return entire updated conversation objects** — convenient, but ordering/previews still drift, so the client re-syncs the full list after group mutations anyway.

---

## What I'd improve with more time

- **Real seen/delivered state** — needs backend support; the current badges are honest about being local.
- **A toast system** — success feedback ("Maya added", "Group renamed") currently relies on visible state changes; inline errors work but toasts would unify both.
- **Accessibility depth** — focus trapping and focus restoration in modals, a full keyboard-only pass, `aria-live` announcements for incoming messages.
- **Tests** — unit tests for the normalizers, permission helpers, and day-label logic; Playwright E2E flows driving two accounts simultaneously (the manual testing I did, automated).
- **Pagination/virtualization** — message history loads fully per thread; fine today, a wall at scale. Would need backend pagination support.
- **Optimistic group mutations** — renames/adds currently refetch-after-mutate; optimistic updates would shave perceived latency.
