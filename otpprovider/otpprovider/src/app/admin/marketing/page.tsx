"use client";

import { useEffect, useState } from "react";

type Campaign = { id: string; name: string; channel: string; status: string; budget: number | null };

export default function AdminMarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  async function load() {
    const res = await fetch("/api/marketing/campaigns").then((r) => r.json());
    setCampaigns(res.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    await fetch(`/api/marketing/campaigns/${id}/approve`, { method: "POST" });
    load();
  }
  async function reject(id: string) {
    await fetch(`/api/marketing/campaigns/${id}/reject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    load();
  }

  const pending = campaigns.filter((c) => c.status === "PENDING_APPROVAL");

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Marketing Hub — Approvals</h1>
      <div className="mt-6 space-y-2">
        {pending.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm">
            <div>
              <p className="text-slate-100">{c.name}</p>
              <p className="text-xs text-slate-500">{c.channel} {c.budget ? `· $${c.budget}` : ""}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approve(c.id)} className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">Approve</button>
              <button onClick={() => reject(c.id)} className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-slate-950">Reject</button>
            </div>
          </div>
        ))}
        {pending.length === 0 && <p className="text-sm text-slate-600">Nothing pending approval.</p>}
      </div>
    </div>
  );
}
