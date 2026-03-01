"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Channel, Event, LocalMessage } from "stream-chat";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

import { initials } from "@/components/call/utils";

type InCallChatPanelProps = {
  channel: Channel;
  currentUserId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnreadCountChange: (count: number) => void;
};

function formatMessageTime(value?: string | Date) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function InCallChatPanel({
  channel,
  currentUserId,
  open,
  onOpenChange,
  onUnreadCountChange,
}: InCallChatPanelProps) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onUnreadCountChange(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  useEffect(() => {
    setUnreadCount(0);
    setMessages([...(channel.state.messages ?? [])]);

    const subscription = channel.on((event: Event) => {
      if (
        event.type === "message.new" ||
        event.type === "message.updated" ||
        event.type === "message.deleted"
      ) {
        setMessages([...(channel.state.messages ?? [])]);
      }

      if (event.type === "message.new") {
        const senderId = event.user?.id;
        if (!open && senderId && senderId !== currentUserId) {
          setUnreadCount((count) => count + 1);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [channel, currentUserId, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setUnreadCount(0);
    void channel.markRead().catch(() => undefined);
  }, [channel, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const container = listRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages.length, open]);

  const visibleMessages = useMemo(() => {
    return messages.filter((message) => Boolean(message.text?.trim()));
  }, [messages]);

  const onSend = async () => {
    const text = draft.trim();
    if (!text || isSending) {
      return;
    }

    setIsSending(true);
    setChatError(null);

    try {
      await channel.sendMessage({ text });
      setDraft("");
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Could not send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <aside
      className={[
        "fixed top-5 right-4 bottom-30 z-30 w-[min(94vw,390px)] border border-white/10 bg-[#0d1118]/95 shadow-2xl backdrop-blur-md transition md:right-6 md:top-6",
        open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[110%] opacity-0",
      ].join(" ")}
      aria-hidden={!open}
    >
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/55">Meeting Chat</p>
          <p className="text-xs text-white/45">Powered by Stream Chat</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/20 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
          onClick={() => onOpenChange(false)}
        >
          Close
        </button>
      </header>

      <div ref={listRef} className="h-[calc(100%-132px)] overflow-y-auto px-3 py-3">
        {visibleMessages.length === 0 ? (
          <div className="grid h-full place-items-center text-center text-sm text-white/45">
            No messages yet.
          </div>
        ) : (
          <div className="space-y-3">
            {visibleMessages.map((message) => {
              const isMine = Boolean(currentUserId && message.user?.id === currentUserId);
              const authorName = message.user?.name || message.user?.id || "Guest";
              const authorImage = message.user?.image;

              return (
                <article
                  key={message.id}
                  className={["flex gap-2", isMine ? "justify-end" : "justify-start"].join(" ")}
                >
                  {!isMine ? (
                    <Avatar className="mt-1 size-8 border border-white/20">
                      {authorImage ? <AvatarImage src={authorImage} alt={authorName} /> : null}
                      <AvatarFallback className="bg-[#141924] text-[10px] text-white">
                        {initials(authorName)}
                      </AvatarFallback>
                    </Avatar>
                  ) : null}

                  <div
                    className={[
                      "max-w-[78%] rounded-2xl px-3 py-2",
                      isMine ? "bg-white text-black" : "border border-white/10 bg-[#151a23] text-white",
                    ].join(" ")}
                  >
                    <p className={["text-[11px]", isMine ? "text-black/65" : "text-white/55"].join(" ")}>
                      {authorName} • {formatMessageTime(message.created_at)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm">{message.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <footer className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void onSend();
              }
            }}
            placeholder="Type a message..."
            className="border-white/15 bg-[#0e131d] text-white placeholder:text-white/40"
            disabled={isSending}
          />
          <Button onClick={() => void onSend()} disabled={isSending || !draft.trim()}>
            Send
          </Button>
        </div>
        {chatError ? <p className="mt-2 text-xs text-rose-300">{chatError}</p> : null}
      </footer>
    </aside>
  );
}
