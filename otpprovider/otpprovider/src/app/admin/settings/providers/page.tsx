"use client";

import { useEffect, useState } from "react";

type Provider = {
  id: string;
  kind: string;
  name: string;
  enabled: boolean;
  priority: number;
  healthStatus: string;
  hasCredentials: boolean;
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);

  async function load() {
    const res = await fetch("/api/settings/providers").then((r) => r.json());
    setProviders(res.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggle(id: string, enabled: boolean) {
    await fetch("/api/settings/providers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Communication Providers</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Providers are ordered by priority — the routing engine tries them top to bottom with automatic failover.
        Add credentials via the .env / secure config, then enable here.
      </p>
      <div className="mt-6 space-y-3">
        {providers.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div>
              <p className="font-semibold text-slate-100">{p.name} <span className="text-slate-500">({p.kind})</span></p>
              <p className="text-xs text-slate-500">
                Priority {p.priority} · Health: {p.healthStatus} · {p.hasCredentials ? "Credentials set" : "No credentials — configure before enabling"}
              </p>
            </div>
            <button
              onClick={() => toggle(p.id, !p.enabled)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${p.enabled ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-slate-200"}`}
            >
              {p.enabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
        {providers.length === 0 && <p className="text-sm text-slate-600">No providers added yet — add rows via Prisma Studio or extend this page with a create form.</p>}
      </div>
    </div>
  );
}
