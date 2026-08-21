import type { Conversation, Message, User } from "@/lib/chat-api";

export const demoUser: User = {
  id: "me",
  name: "You",
  phone: "+1 202 555 0147",
  online: true,
};

export const demoConversations: Conversation[] = [
  {
    id: "design",
    name: "Design circle",
    isGroup: true,
    unread: 2,
    lastMessage: {
      id: "m1",
      text: "The new direction feels right.",
      senderName: "Maya",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  },
  {
    id: "sam",
    name: "Sam Rivera",
    unread: 0,
    lastMessage: {
      id: "m2",
      text: "I’ll send the notes tonight.",
      senderName: "Sam",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  },
  {
    id: "launch",
    name: "Launch crew",
    isGroup: true,
    unread: 5,
    lastMessage: {
      id: "m3",
      text: "Thursday works for me.",
      senderName: "Noor",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  },
];

export const demoMessages: Record<string, Message[]> = {
  design: [
    {
      id: "d1",
      senderName: "Maya Chen",
      text: "Morning. I pulled the latest notes into one place.",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "d2",
      senderName: "You",
      senderId: "me",
      text: "Perfect. I’m going through them now — the rhythm is much clearer.",
      createdAt: new Date(Date.now() - 6800000).toISOString(),
    },
    {
      id: "d3",
      senderName: "Maya Chen",
      text: "The new direction feels right.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  sam: [
    {
      id: "s1",
      senderName: "Sam Rivera",
      text: "Can we make the handoff feel a little less formal?",
      createdAt: new Date(Date.now() - 5000000).toISOString(),
    },
  ],
  launch: [
    {
      id: "l1",
      senderName: "Noor",
      text: "Thursday works for me.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};
