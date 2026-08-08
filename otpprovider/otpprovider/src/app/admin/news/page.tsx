"use client";

import { useEffect, useState } from "react";

type NewsPost = {
  id: string;
  titleEn: string;
  titleAr: string | null;
  status: string;
  createdAt: string;
};

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [form, setForm] = useState({ titleEn: "", titleAr: "" });

  async function load() {
    const res = await fetch("/api/news").then((r) => r.json());
    setPosts(res.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function submit() {
    if (!form.titleEn) return;
    await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ titleEn: "", titleAr: "" });
    load();
  }

  async function approve(id: string) {
    await fetch(`/api/news/${id}/approve`, { method: "POST" });
    load();
  }
  async function reject(id: string) {
    await fetch(`/api/news/${id}/reject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    load();
  }

  const pending = posts.filter((p) => p.status === "PENDING_APPROVAL");
  const others = posts.filter((p) => p.status !== "PENDING_APPROVAL");

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">News Ticker</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Admin, Support, and Marketing can submit news. Nothing appears on the public site-wide ticker until an Admin
        approves it here.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <input
          value={form.titleEn}
          onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
          placeholder="Headline (English)"
          className="min-w-[240px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        />
        <input
          value={form.titleAr}
          onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
          placeholder="العنوان (عربي - اختياري)"
          className="min-w-[240px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          dir="rtl"
        />
        <button onClick={submit} className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950">
          Submit for Approval
        </button>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-amber-400">
        Pending Approval ({pending.length})
      </h2>
      <div className="mt-3 space-y-2">
        {pending.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <span className="text-sm text-slate-200">{p.titleEn}</span>
            <div className="flex gap-2">
              <button onClick={() => approve(p.id)} className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">Approve</button>
              <button onClick={() => reject(p.id)} className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-slate-950">Reject</button>
            </div>
          </div>
        ))}
        {pending.length === 0 && <p className="text-sm text-slate-600">Nothing pending.</p>}
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-slate-500">History</h2>
      <div className="mt-3 space-y-2">
        {others.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-sm text-slate-400">
            <span>{p.titleEn}</span>
            <span className="text-xs uppercase">{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
