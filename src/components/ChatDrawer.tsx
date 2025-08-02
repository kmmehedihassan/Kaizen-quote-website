// src/components/ChatDrawer.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/navigation";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

export function ChatDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const sessionId = useRef<string>("");

  // Ref to the end-of-list sentinel
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load or create session ID and fetch history
  useEffect(() => {
    let id = localStorage.getItem("sessionId");
    if (!id) {
      id = uuid();
      localStorage.setItem("sessionId", id);
    }
    sessionId.current = id;

    fetch(`/api/messages?sessionId=${id}`)
      .then((res) => res.json())
      .then((history: Msg[]) => {
        setMsgs(history);
      })
      .catch(console.error);
  }, []);

  // Whenever msgs change *or* the drawer opens, scroll to bottom
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [msgs, open]);

  const send = async () => {
    if (!input.trim()) return;

    const userMsg: Msg = { role: "user", content: input };
    setMsgs((prev) => [...prev, userMsg]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionId.current,
        message: userMsg.content,
      }),
    });
    const data = (await res.json()) as { assistantMsg: string; route?: string };

    const assistantMsg: Msg = {
      role: "assistant",
      content: data.assistantMsg,
    };
    setMsgs((prev) => [...prev, assistantMsg]);

    if (data.route) {
      router.push(data.route);
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-3 rounded-full bg-blue-600 text-white shadow-lg"
      >
        💬
      </button>

      {open && (
        <div className="mt-2 w-80 h-96 bg-white shadow-xl rounded-xl flex flex-col">
          {/* Message list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded ${
                  m.role === "user"
                    ? "bg-blue-100 self-end"
                    : "bg-gray-100 self-start"
                }`}
              >
                {m.content}
              </div>
            ))}
            {/* Sentinel div to scroll into view */}
            <div ref={bottomRef} />
          </div>

          {/* Input box */}
          <div className="p-2 border-t flex">
            <input
              className="flex-1 border rounded px-2 py-1 mr-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
