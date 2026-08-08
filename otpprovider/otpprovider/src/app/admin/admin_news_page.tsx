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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ titleEn: "", titleAr: "" });

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

  function startEdit(p: NewsPost) {
    setEditingId(p.id);
    setEditForm({ titleEn: p.titleEn, titleAr: p.titleAr ?? "" });
  }

  async function saveEdit(id: string) {
    await fetch(`/api/news/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this news post permanently?")) return;
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    load();
  }

  const pending = posts.filter((p) => p.status === "PENDING_APPROVAL");
  const others = posts.filter((p) => p.status !== "PENDING_APPROVAL");

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">News Ticker</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Admin, Support, and Marketing can submit news. Nothing appears on the public site-wide ticker until an Admin
        approves it here. Editing an approved post sends it back for re-approval.
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
          <div key={p.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            {editingId === p.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={editForm.titleEn}
                  onChange={(e) => setEditForm({ ...editForm, titleEn: e.target.value })}
                  className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
                />
                <input
                  value={editForm.titleAr}
                  onChange={(e) => setEditForm({ ...editForm, titleAr: e.target.value })}
                  dir="rtl"
                  className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
                />
                <button onClick={() => saveEdit(p.id)} className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950">Save</button>
                <button onClick={() => setEditingId(null)} className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-200">{p.titleEn}</span>
                <div className="flex gap-2">
                  <button onClick={() => approve(p.id)} className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">Approve</button>
                  <button onClick={() => reject(p.id)} className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-slate-950">Reject</button>
                  <button onClick={() => startEdit(p)} className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">Edit</button>
                  <button onClick={() => remove(p.id)} className="rounded-full bg-red-900 px-3 py-1 text-xs font-semibold text-red-200">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {pending.length === 0 && <p className="text-sm text-slate-600">Nothing pending.</p>}
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-slate-500">History</h2>
      <div className="mt-3 space-y-2">
        {others.map((p) => (
          <div key={p.id} className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-sm text-slate-400">
            {editingId === p.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={editForm.titleEn}
                  onChange={(e) => setEditForm({ ...editForm, titleEn: e.target.value })}
                  className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
                />
                <input
                  value={editForm.titleAr}
                  onChange={(e) => setEditForm({ ...editForm, titleAr: e.target.value })}
                  dir="rtl"
                  className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
                />
                <button onClick={() => saveEdit(p.id)} className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950">Save</button>
                <button onClick={() => setEditingId(null)} className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span>{p.titleEn}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase">{p.status}</span>
                  <button onClick={() => startEdit(p)} className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">Edit</button>
                  <button onClick={() => remove(p.id)} className="rounded-full bg-red-900 px-3 py-1 text-xs font-semibold text-red-200">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
