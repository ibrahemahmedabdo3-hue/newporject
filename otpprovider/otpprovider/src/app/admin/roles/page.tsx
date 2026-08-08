"use client";

import { useEffect, useState } from "react";

type Role = { id: string; key: string; name: string; permissions: string[] };

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPerms, setAllPerms] = useState<string[]>([]);

  async function load() {
    const res = await fetch("/api/admin/roles").then((r) => r.json());
    setRoles(res.data?.roles ?? []);
    setAllPerms(res.data?.allPermissions ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggle(roleId: string, permissionKey: string, enabled: boolean) {
    await fetch("/api/admin/roles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, permissionKey, enabled }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
      <p className="mt-2 text-sm text-slate-500">SUPER_ADMIN is protected and cannot be modified here.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-slate-950 px-3 py-2 text-slate-400">Permission</th>
              {roles.map((r) => (
                <th key={r.id} className="px-3 py-2 text-slate-300">{r.key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allPerms.map((perm) => (
              <tr key={perm} className="border-t border-slate-800">
                <td className="sticky left-0 bg-slate-950 px-3 py-2 text-slate-400">{perm}</td>
                {roles.map((r) => {
                  const checked = r.permissions.includes(perm);
                  const disabled = r.key === "SUPER_ADMIN";
                  return (
                    <td key={r.id} className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={(e) => toggle(r.id, perm, e.target.checked)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
