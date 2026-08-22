# Chatty API Documentation

REST + Socket.IO contract for the Chatty backend. Every request/response shape below was verified against the live service during development — including the quirks listed at the end.

- **Base URL (REST):** `https://frontend-task-chatapp.onrender.com/api`
- **Base URL (Realtime):** `https://frontend-task-chatapp.onrender.com` (Socket.IO endpoint)
- **Format:** JSON everywhere (`Content-Type: application/json`)
- **Timestamps:** ISO 8601 UTC strings
- **IDs:** opaque strings

---

## Authentication

All endpoints except `POST /auth/login` require a Bearer token:

```
Authorization: Bearer <token>
```

The token is obtained at login and does not expire on a known schedule — clients must handle sudden `401` responses by clearing the session.

---

## Endpoints

### Auth

#### `POST /auth/login`

Creates the account on first login, otherwise signs in.

**Request**

| Field | Type | Notes |
|---|---|---|
| `name` | string | Display name |
| `phone` | string | Phone number |
| `phoneNumber` | string | Same value as `phone` — the API accepts either; send both |

```json
{ "name": "Maya Chen", "phone": "+15550001111", "phoneNumber": "+15550001111" }
```

**Response `200`**

```json
{
  "token": "<jwt>",
  "user": { "_id": "6a88275de5d6aac97521e37a", "name": "Maya Chen", "phone": "+15550001111" }
}
```

#### `GET /auth/me`

Returns the authenticated user's profile.

**Response `200`**

```json
{ "_id": "6a88275de5d6aac97521e37a", "name": "Maya Chen", "phone": "+15550001111" }
```

**Errors:** `401` invalid/expired token.

---

### Users

#### `GET /users/search?query=<term>`

Search people by name or phone number. Minimum 2 characters for useful results.

| Query param | Type | Notes |
|---|---|---|
| `query` | string | Search term |
| `q` | string | Legacy alias — accepted alongside `query` |

**Response `200`** — array of user objects:

```json
[
  { "_id": "6a8826abe5d6aac97521e28f", "name": "Alex Johnson", "phone": "+12345678901" },
  { "_id": "6a88839ce5d6aac97523759d", "name": "awlad", "phone": "01518456520" }
]
```

---

### Conversations

A conversation is either `"type": "dm"` (two people) or `"type": "group"`. Group conversations carry an `admins` array of user ids and a `createdBy`.

#### `GET /conversations`

List all conversations for the authenticated user.

**Response `200`** — either a bare array **or** `{ "data": [...] }`; treat both identically:

```json
[
  {
    "_id": "6a88cbfce5d6aac97525783e",
    "type": "dm",
    "participant": { "_id": "6a8826abe5d6aac97521e28f", "name": "Alex Johnson", "phone": "+12345678901" },
    "participants": [
      { "_id": "6a88275de5d6aac97521e37a", "name": "Maya Chen", "phone": "+15550001111" },
      { "_id": "6a8826abe5d6aac97521e28f", "name": "Alex Johnson", "phone": "+12345678901" }
    ],
    "lastMessage": { "_id": "...", "conversationId": "6a88cbfce5d6aac97525783e", "senderId": "6a8826abe5d6aac97521e28f", "text": "Morning!", "createdAt": "2026-08-21T22:10:04.120Z" },
    "createdAt": "2026-08-20T18:02:41.003Z",
    "updatedAt": "2026-08-21T22:10:04.130Z"
  }
]
```

Group entries add:

```json
{
  "_id": "6a88d682e5d6aac975259166",
  "type": "group",
  "name": "Project Team",
  "createdBy": "6a88275de5d6aac97521e37a",
  "admins": ["6a88275de5d6aac97521e37a"],
  "participants": [ { "...": "same user objects as above" } ]
}
```

#### `POST /conversations`

Create (or fetch the existing) direct conversation with another user.

**Request**

| Field | Type | Notes |
|---|---|---|
| `userId` | string | The other participant's id |

```json
{ "userId": "6a8826abe5d6aac97521e28f" }
```

**Response `200/201`** — the conversation object (shape as above). Idempotent: repeating with the same pair returns the existing conversation.

#### `POST /conversations/group`

Create a group conversation.

**Request**

| Field | Type | Rules |
|---|---|---|
| `name` | string | Group display name |
| `participantIds` | string[] | Other members' ids. The creator is added automatically and becomes an admin. **At least 3 total members required** (creator + 2) — fewer returns `400`. |

```json
{ "name": "Project Team", "participantIds": ["1", "2", "3"] }
```

**Response `200/201`** — the created group conversation object.

#### `PATCH /conversations/:id`

Rename a group. **Admins only.**

> Note: some briefs describe this as `POST /conversations/:id` — on the live service that returns **404**. The working method is `PATCH`.

**Request**

```json
{ "name": "Renamed Team" }
```

**Response `200`** — the full updated conversation object.

**Errors:** `404` wrong method/route · `403` caller is not an admin.

#### `POST /conversations/:id/participants`

Add one or more members to a group conversation.

**Request**

| Field | Type | Notes |
|---|---|---|
| `userIds` | string[] | Ids to add; duplicates and existing members are tolerated |

```json
{ "userIds": ["6a88839ce5d6aac97523759d"] }
```

**Response `200`** — full updated conversation object.

#### `DELETE /conversations/:id/participants/:userId`

Remove a member from a group. **Admins only** — except when `:userId` is the caller's own id, which is how you **leave the group**.

No request body.

**Response `200`** — empty object / confirmation.

**Behavioral notes**
- Removing yourself works even if you are an admin.
- There is no "delete conversation" endpoint; leaving is the only exit.

#### `POST /conversations/:id/admins`

Promote an existing group member to admin. **Admins only.**

**Request**

```json
{ "userId": "6a88839ce5d6aac97523759d" }
```

**Response `200`** — full updated conversation object (check its `admins` array).

**Errors:** promoting a non-member or an existing admin fails with a validation error message.

---

### Messages

#### `GET /conversations/:id/messages`

Fetch history for one conversation.

**Response `200`** — bare array, **newest first** (clients must reverse for chronological display):

```json
[
  { "_id": "m2", "conversationId": "6a88cbfce5d6aac97525783e", "senderId": "6a88275de5d6aac97521e37a", "text": "Sounds good", "createdAt": "2026-08-21T22:15:30.000Z" },
  { "_id": "m1", "conversationId": "6a88cbfce5d6aac97525783e", "senderId": "6a8826abe5d6aac97521e28f", "text": "Morning!", "createdAt": "2026-08-21T22:10:04.120Z" }
]
```

#### `POST /messages`

Send a message to any conversation you participate in (DM or group).

**Request**

| Field | Type | Notes |
|---|---|---|
| `conversationId` | string | Target conversation |
| `text` | string | Message body — plain text, emojis included |

```json
{ "conversationId": "6a88cbfce5d6aac97525783e", "text": "See you at standup 🎉" }
```

**Response `200/201`** — the persisted message object (same shape as history items).

---

## Realtime (Socket.IO)

Connect to the service root (**not** `/api`) with the auth token in the handshake payload:

```js
io("https://frontend-task-chatapp.onrender.com", {
  auth: { token: "<jwt>" },
  transports: ["websocket", "polling"], // fall back if ws upgrade is blocked
});
```

Handshake negotiation reports `pingInterval: 25000`, `pingTimeout: 20000`.

### Server → client events

#### `message:new`

Fired for every message sent in any conversation you belong to (your own sends included).

```json
{
  "_id": "m3",
  "conversationId": "6a88d682e5d6aac975259166",
  "senderId": "6a8826abe5d6aac97521e28f",
  "senderName": "Alex Johnson",
  "text": "Pushed the update",
  "createdAt": "2026-08-22T09:41:12.480Z"
}
```

#### `conversation:updated`

Fired when a conversation changes out-of-band (group renamed, members changed, new group you were added to). No meaningful payload — clients should re-fetch `GET /conversations`.

### Client → server events

None. All writes go through the REST API; the socket is read-only for this client, which keeps send-state handling (optimistic UI, retries) in one place.

### Connection failures

An invalid token produces a `connect_error`. Clients should inspect `error.message` — auth-related failures mean the session is dead and should be cleared.

---

## Errors

Error bodies are not uniform; expect either shape:

```json
{ "error": { "message": "At least 3 participants are required" } }
```
```json
{ "message": "You are not allowed to do that" }
```

| Status | Meaning |
|---|---|
| `400` | Validation failure (e.g. group with fewer than 3 members) |
| `401` | Missing/invalid token — clear the session |
| `403` | Not permitted (non-admin attempting admin actions) |
| `404` | Unknown id — or right path with wrong HTTP method |
| `5xx` | Server fault; safe to retry |

---

## Known quirks (verified against the live service)

1. **Rename is `PATCH`, not `POST`** — `POST /conversations/:id` returns 404 despite what briefs say.
2. **Login body duplicates the phone field** (`phone` + `phoneNumber`); sending both is the safe path.
3. **List envelopes vary** — `GET /conversations` may return a bare array or `{ data: [...] }`.
4. **Messages arrive newest-first** from the history endpoint; reverse before rendering.
5. **Mutations return whole conversation objects**, so a refetch after any group mutation is optional but keeps ordering/previews honest.
6. **Leaving = deleting yourself** via the remove-participant route; there is no dedicated leave endpoint.
7. **Group minimum is enforced server-side** (3 total members including the creator) — mirror it in the UI rather than letting users hit a 400.

---

## Client-side normalization reference

The frontend maps every response through normalizers (`src/lib/chat-api.ts`) so the rest of the app never sees the inconsistencies above:

| API field | Client field | Notes |
|---|---|---|
| `_id` / `id` / `conversationId` | `id` | First present wins |
| `participants[].*_id/name/phone` | `User { id, name, phone }` | Objects flattened to primitives |
| `admins` | `string[]` | Object-shaped entries flattened to ids |
| `lastMessage` / `unreadCount` | `lastMessage` / `unread` | Optional; defaults supplied |
| `text` / `content` / `message` | `text` | All aliases accepted on inbound messages |
