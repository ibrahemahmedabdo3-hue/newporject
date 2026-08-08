"use client";

import { useEffect, useState } from "react";

type Gateway = {
  id: string;
  key: string;
  displayName: string;
  enabled: boolean;
  mode: "SANDBOX" | "LIVE";
  hasConfig: boolean;
};

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [form, setForm] = useState({ key: "", displayName: "" });
  const [creating, setCreating] = useState(false);

  async function load() {
    const res = await fetch("/api/settings/payments").then((r) => r.json());
    setGateways(res.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!form.key || !form.displayName) return;
    setCreating(true);
    await fetch("/api/settings/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: form.key, displayName: form.displayName }),
    });
    setForm({ key: "", displayName: "" });
    setCreating(false);
    load();
  }

  async function toggle(id: string, enabled: boolean) {
    await fetch("/api/settings/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Payment Gateways</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Add any payment gateway you accept — no name is hardcoded. Enter its credentials once, then switch it on/off
        anytime. A gateway is only "live" for customers when you enable it here.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <input
          value={form.key}
          onChange={(e) => setForm({ ...form, key: e.target.value })}
          placeholder="key (e.g. stripe, paymob, bank_transfer)"
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        />
        <input
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          placeholder="Display name"
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        />
        <button
          onClick={create}
          disabled={creating}
          className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950"
        >
          {creating ? "Adding…" : "Add Gateway"}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {gateways.map((g) => (
          <div key={g.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div>
              <p className="font-semibold text-slate-100">{g.displayName} <span className="text-slate-500">({g.key})</span></p>
              <p className="text-xs text-slate-500">
                {g.mode} · {g.hasConfig ? "Configured" : "No credentials set — configure before enabling"}
              </p>
            </div>
            <button
              onClick={() => toggle(g.id, !g.enabled)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${g.enabled ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-slate-200"}`}
            >
              {g.enabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
        {gateways.length === 0 && <p className="text-sm text-slate-600">No payment gateways added yet.</p>}
      </div>
    </div>
  );
}
