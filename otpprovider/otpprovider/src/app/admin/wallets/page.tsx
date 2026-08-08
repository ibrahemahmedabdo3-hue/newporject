"use client";

import { useEffect, useState } from "react";

type CustomerRow = { id: string; companyName: string | null; user: { name: string; email: string }; wallet: { balance: string } | null };

export default function AdminWalletsPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch("/api/admin/customers-with-wallets").then((r) => r.json()).catch(() => ({ data: [] }));
    setCustomers(res.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function adjust(customerId: string) {
    const amount = Number(amounts[customerId]);
    if (!amount) return;
    await fetch("/api/wallet/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, amount, note: "Manual admin adjustment" }),
    });
    setAmounts({ ...amounts, [customerId]: "" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Wallets</h1>
      <p className="mt-2 text-sm text-slate-500">Every adjustment writes a ledger entry — balances are never edited directly.</p>
      <div className="mt-6 space-y-2">
        {customers.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm">
            <div>
              <p className="text-slate-100">{c.user.name} <span className="text-slate-500">— {c.user.email}</span></p>
              <p className="text-xs text-slate-500">Balance: {c.wallet?.balance ?? "0"}</p>
            </div>
            <div className="flex gap-2">
              <input
                value={amounts[c.id] ?? ""}
                onChange={(e) => setAmounts({ ...amounts, [c.id]: e.target.value })}
                placeholder="+/- amount"
                className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
              />
              <button onClick={() => adjust(c.id)} className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950">Adjust</button>
            </div>
          </div>
        ))}
        {customers.length === 0 && <p className="text-sm text-slate-600">No customers yet.</p>}
      </div>
    </div>
  );
}
