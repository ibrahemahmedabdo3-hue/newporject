"use client";

import { useEffect, useState } from "react";

type Conversation = { id: string; title: string | null };
type Message = { id: string; senderId: string; body: string; createdAt: string };

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  async function loadConversations() {
    const res = await fetch("/api/chat/conversations").then((r) => r.json());
    setConversations(res.data ?? []);
    if (!activeId && res.data?.[0]) setActiveId(res.data[0].id);
  }
  useEffect(() => {
    loadConversations();
  }, []);

  async function loadMessages(id: string) {
    const res = await fetch(`/api/chat/conversations/${id}/messages`).then((r) => r.json());
    setMessages(res.data ?? []);
  }
  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId]);

  async function send() {
    if (!draft.trim() || !activeId) return;
    await fetch(`/api/chat/conversations/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    setDraft("");
    loadMessages(activeId);
  }

  return (
    <div className="flex h-[70vh] gap-4">
      <aside className="w-56 shrink-0 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Conversations</p>
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${activeId === c.id ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}
          >
            {c.title ?? "Untitled"}
          </button>
        ))}
        {conversations.length === 0 && <p className="text-xs text-slate-600">No conversations yet.</p>}
      </aside>
      <div className="flex flex-1 flex-col rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex-1 space-y-2 overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-sm text-slate-200">
              {m.body}
            </div>
          ))}
          {activeId && messages.length === 0 && <p className="text-sm text-slate-600">No messages yet.</p>}
          {!activeId && <p className="text-sm text-slate-600">Select or create a conversation.</p>}
        </div>
        {activeId && (
          <div className="mt-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Message…"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
            <button onClick={send} className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950">Send</button>
          </div>
        )}
      </div>
    </div>
  );
}
