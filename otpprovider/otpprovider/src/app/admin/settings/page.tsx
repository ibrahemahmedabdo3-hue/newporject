"use client";

import { useEffect, useState } from "react";

type Setting = { key: string; value: string };

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch("/api/settings/system").then((r) => r.json());
    const map: Record<string, string> = {};
    for (const s of (res.data ?? []) as Setting[]) map[s.key] = s.value;
    setSettings(map);
  }
  useEffect(() => {
    load();
  }, []);

  async function save(key: string) {
    await fetch("/api/settings/system", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: settings[key] ?? "" }),
    });
    load();
  }

  const fields: { key: string; label: string }[] = [
    { key: "company_name", label: "Company Name" },
    { key: "company_country", label: "Country" },
    { key: "company_address", label: "Registered Address" },
    { key: "default_currency", label: "Default Currency" },
    { key: "default_locale", label: "Default Language (en/ar)" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">System Settings</h1>
      <div className="mt-6 max-w-xl space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{f.label}</label>
            <div className="flex gap-2">
              <input
                value={settings[f.key] ?? ""}
                onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
              <button onClick={() => save(f.key)} className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950">Save</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
