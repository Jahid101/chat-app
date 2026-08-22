export const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api'
export const SOCKET_BASE = process.env.NEXT_PUBLIC_WS_URL

export type User = { _id?: string; id: string; name: string; phone?: string; avatar?: string; online?: boolean }
export type Conversation = { _id?: string; id: string; name: string; isGroup?: boolean; participant?: User; participants?: User[]; admins?: string[]; createdBy?: string; lastMessage?: Message; unread?: number }
export type Message = { _id?: string; id: string; conversationId?: string; senderId?: string; senderName?: string; text: string; createdAt: string; pending?: boolean; failed?: boolean }

const pick = (obj: any, keys: string[], fallback = '') => keys.reduce((v, k) => v ?? obj?.[k], undefined) ?? fallback

export function normalizeUser(raw: any): User {
    return {
        id: String(pick(raw, ['id', '_id', 'userId'], crypto.randomUUID())),
        name: pick(raw, ['name', 'username', 'fullName'], 'Unknown user'),
        phone: pick(raw, ['phone', 'phoneNumber']),
        avatar: pick(raw, ['avatar', 'avatarUrl', 'image']),
        online: raw?.online
    }
}

export function normalizeMessage(raw: any): Message {
    return {
        id: String(pick(raw, ['id', '_id', 'messageId'], crypto.randomUUID())),
        conversationId: pick(raw, ['conversationId', 'conversation', 'conversation_id', 'chatId']),
        senderId: pick(raw, ['senderId', 'sender', 'sender_id', 'userId']),
        senderName: pick(raw, ['senderName', 'sender_name', 'name']),
        text: pick(raw, ['text', 'content', 'message'], ''),
        createdAt: pick(raw, ['createdAt', 'created_at', 'timestamp'], new Date().toISOString())
    }
}

export function normalizeConversation(raw: any): Conversation {
    const type = String(raw?.type ?? '').toLowerCase()
    const participant = raw?.participant ? normalizeUser(raw.participant) : undefined
    const participants = (raw?.participants ?? raw?.members ?? []).map(normalizeUser)
    const isGroup = Boolean(raw?.isGroup ?? raw?.is_group) || type === 'group'
    return {
        id: String(pick(raw, ['id', '_id', 'conversationId'], crypto.randomUUID())),
        name: pick(raw, ['name', 'title'], '') || (isGroup ? 'Group' : ''),
        isGroup,
        participant,
        participants,
        admins: Array.isArray(raw?.admins) ? raw.admins.map((a: any) => String(a?._id ?? a)) : [],
        createdBy: raw?.createdBy ? String(raw.createdBy?._id ?? raw.createdBy) : undefined,
        lastMessage: raw?.lastMessage ? normalizeMessage(raw.lastMessage) : undefined,
        unread: Number(raw?.unread ?? raw?.unreadCount ?? 0)
    }
}

export function conversationTitle(conversation: Conversation, selfId?: string): string {
    if (conversation.name) return conversation.name
    if (conversation.participant?.name) return conversation.participant.name
    if (conversation.isGroup) return 'Group'
    const other = conversation.participants?.find((p) => p.id && p.id !== selfId)
    return other?.name || other?.phone || 'Direct message'
}

export class ApiError extends Error {
    constructor(message: string, readonly status: number) { super(message) }
}

export function extractToken(raw: any): string | null {
    return raw?.token ?? raw?.access_token ?? raw?.jwt ?? null
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`,
        {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers
            }
        });
    if (!res.ok) {
        let message = `Request failed (${res.status})`
        try { const body = await res.json(); message = body?.error?.message ?? body?.message ?? message } catch { /* keep default */ }
        throw new ApiError(message, res.status)
    }
    return res.status === 204 ? (undefined as T) : res.json()
}

export const chatApi = {
    login: (name: string, phone: string) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ name, phone, phoneNumber: phone }) }),
    me: (token: string) => request<any>('/auth/me', {}, token),
    conversations: (token: string) => request<any>('/conversations', {}, token),
    messages: (token: string, id: string) => request<any>(`/conversations/${id}/messages`, {}, token),
    search: (token: string, q: string) => request<any>(`/users/search?query=${encodeURIComponent(q)}&q=${encodeURIComponent(q)}`, {}, token),
    createConversation: (token: string, userId: string) => request<any>('/conversations', { method: 'POST', body: JSON.stringify({ userId: userId }) }, token),
    createGroup: (token: string, name: string, participantIds: string[]) => request<any>('/conversations/group', { method: 'POST', body: JSON.stringify({ name, participantIds }) }, token),
    renameGroup: (token: string, id: string, name: string) => request<any>(`/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }, token),
    addGroupParticipants: (token: string, id: string, userIds: string[]) => request<any>(`/conversations/${id}/participants`, { method: 'POST', body: JSON.stringify({ userIds }) }, token),
    removeGroupParticipant: (token: string, id: string, userId: string) => request<any>(`/conversations/${id}/participants/${userId}`, { method: 'DELETE' }, token),
    promoteGroupAdmin: (token: string, id: string, userId: string) => request<any>(`/conversations/${id}/admins`, { method: 'POST', body: JSON.stringify({ userId }) }, token),
    send: (token: string, conversationId: string, text: string) => request<any>('/messages', { method: 'POST', body: JSON.stringify({ conversationId, conversation_id: conversationId, text, content: text }) }, token),
}
