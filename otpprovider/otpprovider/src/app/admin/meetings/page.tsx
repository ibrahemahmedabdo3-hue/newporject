"use client";

import { useEffect, useState } from "react";

type Meeting = { id: string; title: string; description: string | null; startTime: string; meetingUrl: string | null; status: string };

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [form, setForm] = useState({ title: "", startTime: "", meetingUrl: "" });

  async function load() {
    const res = await fetch("/api/meetings").then((r) => r.json());
    setMeetings(res.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!form.title || !form.startTime) return;
    await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, meetingUrl: form.meetingUrl || undefined, startTime: new Date(form.startTime).toISOString() }),
    });
    setForm({ title: "", startTime: "", meetingUrl: "" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Meetings</h1>
      <p className="mt-2 text-sm text-slate-500">
        Add a real external meeting URL (Zoom/Meet/Teams) if you use one — no fake video conferencing is generated.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
        <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
        <input value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} placeholder="Meeting URL (optional)" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
        <button onClick={create} className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950">Schedule</button>
      </div>

      <div className="mt-6 space-y-2">
        {meetings.map((m) => (
          <div key={m.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm">
            <p className="text-slate-100">{m.title}</p>
            <p className="text-xs text-slate-500">{new Date(m.startTime).toLocaleString()}</p>
            {m.meetingUrl && <a href={m.meetingUrl} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 underline">Join link</a>}
          </div>
        ))}
        {meetings.length === 0 && <p className="text-sm text-slate-600">No meetings scheduled.</p>}
      </div>
    </div>
  );
}
