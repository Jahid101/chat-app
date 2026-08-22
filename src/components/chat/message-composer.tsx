"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMOJI_GROUPS: Array<{ label: string; emojis: string[] }> = [
  {
    label: "Smileys",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😊",
      "😇", "🙂", "😉", "😍", "🥰", "😘", "😜", "🤪",
      "🤗", "🤔", "🤨", "😐", "😴", "🤤", "😪", "🥳",
      "😎", "🤓", "🥺", "😢", "😭", "😤", "😱", "🤯",
      "🥶", "😳", "🤫", "🤭",
    ],
  },
  {
    label: "Gestures",
    emojis: [
      "👋", "🤚", "✌️", "🤞", "🤟", "🤘", "🤙", "👈",
      "👉", "👆", "👇", "☝️", "👏", "🙌", "🤝", "🙏",
      "💪", "🫶", "👍", "👎", "✊", "👊", "🫡", "🤌",
      "🫰", "🤲", "👐", "✋",
    ],
  },
  {
    label: "Hearts",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
      "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
      "💘", "💝", "💟", "💯", "💢", "💥", "💫", "⭐",
      "🌟", "✨", "⚡", "🔥",
    ],
  },
  {
    label: "Fun",
    emojis: [
      "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "⚽", "🏀",
      "🎮", "🎧", "🎸", "📱", "💻", "☕", "🍕", "🍔",
      "🍿", "🍩", "🍪", "🐶", "🐱", "🦄", "🌈", "🌙",
      "☀️", "🌸", "🍀", "🌊",
    ],
  },
];

export function MessageComposer({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close the picker on any click outside the composer's emoji area.
  useEffect(() => {
    if (!pickerOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pickerOpen]);

  // Insert at the caret (or replace the selection), then put the caret back.
  function insertEmoji(emoji: string) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? start;
    onChange(value.slice(0, start) + emoji + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      const caret = start + emoji.length;
      el?.setSelectionRange(caret, caret);
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing &&
      event.keyCode !== 229
    ) {
      event.preventDefault();
      onSend();
    }
    if (event.key === "Escape") setPickerOpen(false);
  }

  return (
    <div className="border-t border-border bg-background p-4 md:px-12 md:py-5">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-center gap-2 rounded-2xl border border-input bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
          <div ref={pickerRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Emoji"
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen((open) => !open)}
              className={pickerOpen ? "bg-accent text-primary" : undefined}
            >
              <Smile />
            </Button>

            {pickerOpen && (
              <div
                role="dialog"
                aria-label="Pick an emoji"
                className="absolute bottom-full left-0 z-20 mb-2 w-76 animate-in rounded-2xl border border-border bg-card p-3 shadow-xl fade-in slide-in-from-bottom-2 duration-200"
              >
                <div
                  role="tablist"
                  aria-label="Emoji categories"
                  className="mb-2 flex gap-1 rounded-lg bg-accent p-1"
                >
                  {EMOJI_GROUPS.map((group, index) => (
                    <button
                      key={group.label}
                      role="tab"
                      aria-selected={index === activeGroup}
                      onClick={() => setActiveGroup(index)}
                      className={`flex-1 cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                        index === activeGroup
                          ? "bg-card shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>
                <ul className="grid h-40 grid-cols-7 gap-0.5 overflow-y-auto pr-1">
                  {EMOJI_GROUPS[activeGroup].emojis.map((emoji, index) => (
                    <li key={`${emoji}-${index}`}>
                      <button
                        onClick={() => insertEmoji(emoji)}
                        aria-label={`Insert ${emoji}`}
                        className="grid size-8 cursor-pointer place-items-center rounded-lg text-lg transition-colors hover:bg-accent"
                      >
                        {emoji}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write something thoughtful..."
            rows={1}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
            aria-label="Message composer"
          />
          <Button
            size="icon"
            onClick={onSend}
            disabled={!value.trim()}
            aria-label="Send message"
          >
            <Send />
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}
