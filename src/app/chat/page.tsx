import type { Metadata } from "next";
import { ChatView } from "@/components/chat/chat-view";

export const metadata: Metadata = {
  title: "Chat — Chatty",
};

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-360">
      <ChatView />
    </div>
  );
}
