"use client";

import { useEffect, useState } from "react";

type ContactSetting = {
  department: string;
  displayName: string;
  email: string | null;
  whatsapp: string | null;
  visible: boolean;
};

const DEPARTMENTS = ["support", "admin", "marketing", "sales"] as const;

export default function ContactSettingsPage() {
  const [rows, setRows] = useState<Record<string, ContactSetting>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/contact")
      .then((r) => r.json())
      .then((res) => {
        const map: Record<string, ContactSetting> = {};
        for (const d of DEPARTMENTS) {
          const existing = res.data?.find((x: ContactSetting) => x.department === d);
          map[d] = existing ?? { department: d, displayName: `${d[0].toUpperCase()}${d.slice(1)}`, email: `${d}@otpprovider.com`, whatsapp: "", visible: true };
        }
        setRows(map);
      });
  }, []);

  async function save(dep: string) {
    setSaving(dep);
    await fetch("/api/settings/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows[dep]),
    });
    setSaving(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Contact & Communication Settings</h1>
      <p className="mt-2 text-sm text-slate-500">
        Registered address: Hong Kong (edit in System Settings → Company Info). WhatsApp numbers are left empty until you set them here — none are invented.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {DEPARTMENTS.map((dep) => {
          const row = rows[dep];
          if (!row) return null;
          return (
            <div key={dep} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <h2 className="font-semibold capitalize text-cyan-400">{dep}</h2>
              <div className="mt-3 space-y-2">
                <input
                  value={row.displayName}
                  onChange={(e) => setRows({ ...rows, [dep]: { ...row, displayName: e.target.value } })}
                  placeholder="Display name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
                <input
                  value={row.email ?? ""}
                  onChange={(e) => setRows({ ...rows, [dep]: { ...row, email: e.target.value } })}
                  placeholder="Email"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
                <input
                  value={row.whatsapp ?? ""}
                  onChange={(e) => setRows({ ...rows, [dep]: { ...row, whatsapp: e.target.value } })}
                  placeholder="WhatsApp (+852XXXXXXXX)"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={row.visible}
                    onChange={(e) => setRows({ ...rows, [dep]: { ...row, visible: e.target.checked } })}
                  />
                  Visible on public website
                </label>
                <button
                  onClick={() => save(dep)}
                  disabled={saving === dep}
                  className="mt-2 rounded-full bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950"
                >
                  {saving === dep ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
