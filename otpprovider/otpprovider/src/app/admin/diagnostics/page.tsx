"use client";

import { useEffect, useState } from "react";

type Issue = { id: string; component: string; severity: string; description: string; autoFixable: boolean; status: string };
type Run = { id: string; startedAt: string; summary: string | null; issues: Issue[] };

const SEVERITY_COLOR: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-slate-500",
};

export default function DiagnosticsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [running, setRunning] = useState(false);

  async function load() {
    const res = await fetch("/api/diagnostics").then((r) => r.json());
    setRuns(res.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function discover() {
    setRunning(true);
    await fetch("/api/diagnostics/run", { method: "POST" });
    setRunning(false);
    load();
  }

  async function fixNow(issueId: string) {
    await fetch(`/api/diagnostics/${issueId}/fix`, { method: "POST" });
    load();
  }

  const latest = runs[0];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Diagnostics</h1>
        <button
          onClick={discover}
          disabled={running}
          className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {running ? "Scanning…" : "Discover Errors"}
        </button>
      </div>

      {latest && (
        <div className="mt-6 space-y-2">
          {latest.issues.length === 0 && (
            <p className="rounded-lg border border-emerald-800 bg-emerald-950/30 p-4 text-sm text-emerald-400">
              🟢 All checks passed — no issues found.
            </p>
          )}
          {latest.issues.map((issue) => (
            <div key={issue.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${SEVERITY_COLOR[issue.severity] ?? "bg-slate-500"}`} />
                  <span className="text-sm font-medium text-slate-100">{issue.component}</span>
                  <span className="text-xs uppercase text-slate-500">{issue.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{issue.description}</p>
              </div>
              {issue.autoFixable && issue.status !== "RESOLVED" && (
                <button onClick={() => fixNow(issue.id)} className="rounded-full bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950">
                  FIX NOW
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {!latest && <p className="mt-6 text-sm text-slate-600">No diagnostic runs yet — click "Discover Errors".</p>}
    </div>
  );
}
