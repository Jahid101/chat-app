# Chatty

A quieter way to stay close — a realtime chat application with direct messages, group conversations, and a considered interface that stays out of the way.

## Features

### Conversations
- **Direct messages** — search people by name or phone number and start chatting instantly
- **Group chats** — create a group (minimum 3 members), name it, and manage it over its whole lifetime:
  - Rename the group (admins)
  - Add members via live user search
  - Remove members (admins) or leave the group yourself, both guarded by confirmation dialogs
  - Promote members to admin (admins)
- **Group info drawer** — member list sorted admins-first with role badges, inline rename, add-members search, and a leave-group danger zone

### Messaging
- Realtime delivery over Socket.IO with automatic websocket → long-polling fallback
- Optimistic sends with `Sending…` / delivered / failed states
- Day separators (`Today` / `Yesterday` / date), per-message timestamps, and sender names in groups
- Jump-to-latest pill that counts messages arriving while you're scrolled up
- Emoji picker built into the composer (insert-at-caret, four categories, zero dependencies)

### Presence & polish
- Unread badges for background conversations — persisted across reloads, cleared when you open a thread
- Soft two-tone notification chime synthesized with the Web Audio API (no audio assets), resilient to tab suspension
- Light/dark theme applied before first paint (no flash), persisted per device
- Slim theme-aware custom scrollbars
- Connection status indicator with graceful offline handling and session invalidation on auth failures
- Background sync safety net: conversations refresh on window focus and every 30s while the tab is visible

### Landing page
- Animated hero with a living chat mockup (staggered bubbles, typing indicator, presence pulse)
- Atmosphere layer: masked grid + drifting gradient orbs
- Bento feature grid with micro-visuals, marquee ticker, principles cards, closing CTA banner
- All animation respects `prefers-reduced-motion`

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router, Turbopack) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS v4 (CSS-first config, oklch tokens) |
| Components | shadcn/ui patterns + Base UI, class-variance-authority, tailwind-merge |
| Icons | lucide-react |
| Animation | tw-animate-css + custom CSS keyframes |
| Realtime | socket.io-client |
| Backend | Hosted REST + Socket.IO service |

No state-management library — server state lives in one hook, UI state in components. No emoji or toast libraries either; everything is hand-rolled on purpose.

## Getting started

### Prerequisites
- Node.js 20+
- npm

### Setup

```bash
# 1. Clone and install
git clone <your-repo-url>
cd chat-app
npm install

# 2. Configure environment variables
cp .env.example .env
```

Fill in `.env`:

```env
NEXT_PUBLIC_SITE_URL=frontend_site_url
NEXT_PUBLIC_API_URL=api_base_url
```

> `NEXT_PUBLIC_*` variables are inlined at compile time — restart the dev server after changing them.

### Run

```bash
npm run dev      # development on http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

Sign in with any name and phone number — the backend creates the account on first login.

## Project structure

```
src/
├── app/                    # App Router pages (/ landing, /chat)
├── components/
│   ├── chat/               # Chat view, sidebar, composer, group details, dialogs
│   ├── landing/            # Hero, features, ticker, principles, CTA, footer
│   ├── theme/              # Theme provider + toggle (pre-paint persistence)
│   └── ui/                 # Button, confirm dialog primitives
├── hooks/
│   ├── use-chat.ts         # Session, conversations, messages, socket, unread, chime
│   └── use-user-search.ts  # Debounced people search shared by all pickers
└── lib/
    ├── chat-api.ts         # REST endpoints + response normalization
    ├── auth-token.ts       # Token read/write/clear
    └── sound.ts            # Synthesized notification chime
```

### Design notes

- **Normalization at the edge** — every API response passes through `normalize*` functions, so the rest of the app works with clean shapes regardless of backend quirks
- **Local-first unread state** — the API exposes no seen/delivered flags, so badges are tracked client-side (incremented on background messages, zeroed on open, mirrored to `localStorage`)
- **One socket subscription** — the hook owns a single connection for the whole session; views report which thread is on screen via a ref instead of re-subscribing
- **401 means reset** — any unauthorized response or socket auth rejection invalidates the session and returns you to the landing page

## Local storage keys

| Key | Purpose |
|---|---|
| `Chatty-token` | Auth token |
| `Chatty-theme` | `"light"` / `"dark"` preference |
| `Chatty-active-conversation` | Last open thread |
| `Chatty-unread-counts` | Per-conversation unread counters |

