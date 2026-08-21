export const API_BASE = 'https://frontend-task-chatapp.onrender.com/api'
export const SOCKET_BASE = 'https://frontend-task-chatapp.onrender.com'

export type User = { id: string; name: string; phone?: string; avatar?: string; online?: boolean }
export type Conversation = { id: string; name: string; isGroup?: boolean; participants?: User[]; lastMessage?: Message; unread?: number }
export type Message = { id: string; conversationId?: string; senderId?: string; senderName?: string; text: string; createdAt: string; pending?: boolean; failed?: boolean }

const pick = (obj: any, keys: string[], fallback = '') => keys.reduce((v, k) => v ?? obj?.[k], undefined) ?? fallback
export function normalizeUser(raw: any): User { return { id: String(pick(raw, ['id', '_id', 'userId'], crypto.randomUUID())), name: pick(raw, ['name', 'username', 'fullName'], 'Unknown user'), phone: pick(raw, ['phone', 'phoneNumber']), avatar: pick(raw, ['avatar', 'avatarUrl', 'image']), online: raw?.online } }
export function normalizeMessage(raw: any): Message { return { id: String(pick(raw, ['id', '_id', 'messageId'], crypto.randomUUID())), conversationId: pick(raw, ['conversationId', 'conversation_id', 'chatId']), senderId: pick(raw, ['senderId', 'sender_id', 'userId']), senderName: pick(raw, ['senderName', 'sender_name', 'name']), text: pick(raw, ['text', 'content', 'message'], ''), createdAt: pick(raw, ['createdAt', 'created_at', 'timestamp'], new Date().toISOString()) } }
export function normalizeConversation(raw: any): Conversation { return { id: String(pick(raw, ['id', '_id', 'conversationId'], crypto.randomUUID())), name: pick(raw, ['name', 'title'], 'Conversation'), isGroup: Boolean(raw?.isGroup ?? raw?.is_group), participants: (raw?.participants ?? raw?.members ?? []).map(normalizeUser), lastMessage: raw?.lastMessage ? normalizeMessage(raw.lastMessage) : undefined, unread: Number(raw?.unread ?? raw?.unreadCount ?? 0) } }

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> { const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } }); if (!res.ok) throw new Error((await res.text()) || `Request failed (${res.status})`); return res.status === 204 ? (undefined as T) : res.json() }
export const chatApi = {
    login: (name: string, phone: string) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ name, phone, phoneNumber: phone }) }),
    me: (token: string) => request<any>('/auth/me', {}, token),
    conversations: (token: string) => request<any>('/conversations', {}, token),
    messages: (token: string, id: string) => request<any>(`/conversations/${id}/messages`, {}, token),
    search: (token: string, q: string) => request<any>(`/users/search?query=${encodeURIComponent(q)}&q=${encodeURIComponent(q)}`, {}, token),
    createConversation: (token: string, userId: string) => request<any>('/conversations', { method: 'POST', body: JSON.stringify({ participantId: userId, userId }) }, token),
    send: (token: string, conversationId: string, text: string) => request<any>('/messages', { method: 'POST', body: JSON.stringify({ conversationId, conversation_id: conversationId, text, content: text }) }, token),
}

export const demoUser: User = { id: 'me', name: 'You', phone: '+1 202 555 0147', online: true }
export const demoConversations: Conversation[] = [
    { id: 'design', name: 'Design circle', isGroup: true, unread: 2, lastMessage: { id: 'm1', text: 'The new direction feels right.', senderName: 'Maya', createdAt: new Date(Date.now() - 3600000).toISOString() } },
    { id: 'sam', name: 'Sam Rivera', unread: 0, lastMessage: { id: 'm2', text: 'I’ll send the notes tonight.', senderName: 'Sam', createdAt: new Date(Date.now() - 7200000).toISOString() } },
    { id: 'launch', name: 'Launch crew', isGroup: true, unread: 5, lastMessage: { id: 'm3', text: 'Thursday works for me.', senderName: 'Noor', createdAt: new Date(Date.now() - 86400000).toISOString() } },
]
export const demoMessages: Record<string, Message[]> = { design: [{ id: 'd1', senderName: 'Maya Chen', text: 'Morning. I pulled the latest notes into one place.', createdAt: new Date(Date.now() - 7200000).toISOString() }, { id: 'd2', senderName: 'You', senderId: 'me', text: 'Perfect. I’m going through them now — the rhythm is much clearer.', createdAt: new Date(Date.now() - 6800000).toISOString() }, { id: 'd3', senderName: 'Maya Chen', text: 'The new direction feels right.', createdAt: new Date(Date.now() - 3600000).toISOString() }], sam: [{ id: 's1', senderName: 'Sam Rivera', text: 'Can we make the handoff feel a little less formal?', createdAt: new Date(Date.now() - 5000000).toISOString() }], launch: [{ id: 'l1', senderName: 'Noor', text: 'Thursday works for me.', createdAt: new Date(Date.now() - 86400000).toISOString() }] }
