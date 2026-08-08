import Link from "next/link";

export default function AdminSupportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Support</h1>
      <p className="mt-2 text-sm text-slate-500">
        Admins share the same ticket queue as Support agents.
      </p>
      <Link href="/support" className="mt-4 inline-block rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950">
        Open Ticket Queue
      </Link>
    </div>
  );
}
