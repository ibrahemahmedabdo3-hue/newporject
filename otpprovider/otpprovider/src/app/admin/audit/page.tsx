"use client";

import { useEffect, useState } from "react";

type LogEntry = {
  id: string;
  action: string;
  resource: string | null;
  resourceId: string | null;
  result: string;
  createdAt: string;
  user?: { name: string; email: string } | null;
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    fetch("/api/audit").then((r) => r.json()).then((res) => setLogs(res.data ?? []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Result</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-slate-800">
                <td className="px-4 py-2 text-slate-400">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-slate-300">{l.user?.email ?? "system"}</td>
                <td className="px-4 py-2 text-slate-100">{l.action}</td>
                <td className="px-4 py-2 text-slate-500">{l.resource ?? "—"} {l.resourceId ? `#${l.resourceId.slice(0, 8)}` : ""}</td>
                <td className="px-4 py-2">
                  <span className={l.result === "success" ? "text-emerald-400" : "text-red-400"}>{l.result}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="p-4 text-sm text-slate-600">No audit entries yet.</p>}
      </div>
    </div>
  );
}
