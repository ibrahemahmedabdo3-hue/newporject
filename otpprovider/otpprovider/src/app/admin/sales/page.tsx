import Link from "next/link";

export default function AdminSalesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Sales CRM</h1>
      <p className="mt-2 text-sm text-slate-500">Admins share the same pipeline as Sales.</p>
      <div className="mt-4 flex gap-3">
        <Link href="/sales" className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950">Open Pipeline</Link>
        <Link href="/sales/leads" className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200">Open Leads</Link>
      </div>
    </div>
  );
}
