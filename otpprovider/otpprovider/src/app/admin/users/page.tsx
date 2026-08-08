"use client";

import { useEffect, useState } from "react";

type User = { id: string; name: string; email: string; status: string; roles: string[] };

const ROLES = ["ADMIN", "SUPPORT", "SALES", "MARKETING", "FINANCE", "DEVELOPER", "OPERATIONS", "CLIENT"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: "", email: "", roleKey: "SUPPORT" });
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", roleKey: "SUPPORT" });

  async function load() {
    const res = await fetch("/api/admin/users").then((r) => r.json());
    setUsers(res.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!form.name || !form.email) return;
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then((r) => r.json());
    if (res.success) setTempPassword(res.data.temporaryPassword);
    setForm({ name: "", email: "", roleKey: "SUPPORT" });
    load();
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  function startEdit(u: User) {
    setEditingId(u.id);
    setEditForm({ name: u.name, roleKey: u.roles.find((r) => r !== "SUPER_ADMIN") ?? "SUPPORT" });
  }

  async function saveEdit(id: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    load();
  }

  async function remove(id: string, email: string) {
    if (!confirm(`Delete ${email} permanently? This cannot be undone.`)) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Users</h1>

      {tempPassword && (
        <div className="mt-4 rounded-lg border border-amber-700 bg-amber-950/30 p-3 text-sm text-amber-300">
          Temporary password (shown once): <code className="font-mono">{tempPassword}</code>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
        <select value={form.roleKey} onChange={(e) => setForm({ ...form, roleKey: e.target.value })} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
          {ROLES.filter((r) => r !== "CLIENT").map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={create} className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950">Create Employee</button>
      </div>

      <div className="mt-6 space-y-2">
        {users.map((u) => (
          <div key={u.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm">
            {editingId === u.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="min-w-[160px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
                />
                {u.roles.includes("SUPER_ADMIN") ? (
                  <span className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-500">SUPER_ADMIN role can't be changed here</span>
                ) : (
                  <select
                    value={editForm.roleKey}
                    onChange={(e) => setEditForm({ ...editForm, roleKey: e.target.value })}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
                <button onClick={() => saveEdit(u.id)} className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950">Save</button>
                <button onClick={() => setEditingId(null)} className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-100">{u.name} <span className="text-slate-500">— {u.email}</span></p>
                  <p className="text-xs text-slate-500">{u.roles.join(", ") || "no role"} · {u.status}</p>
                </div>
                <div className="flex gap-2">
                  {u.status === "ACTIVE" ? (
                    <button onClick={() => setStatus(u.id, "SUSPENDED")} className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-slate-950">Suspend</button>
                  ) : (
                    <button onClick={() => setStatus(u.id, "ACTIVE")} className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">Activate</button>
                  )}
                  <button onClick={() => startEdit(u)} className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">Edit</button>
                  {!u.roles.includes("SUPER_ADMIN") && (
                    <button onClick={() => remove(u.id, u.email)} className="rounded-full bg-red-900 px-3 py-1 text-xs font-semibold text-red-200">Delete</button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
