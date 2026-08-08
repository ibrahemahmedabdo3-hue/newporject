import { prisma } from "@/lib/prisma";

async function safeCount(fn: () => Promise<number>) {
  try {
    return await fn();
  } catch {
    return 0;
  }
}

export default async function AdminDashboard() {
  const [customers, tickets, providers, gateways, pendingNews] = await Promise.all([
    safeCount(() => prisma.customer.count()),
    safeCount(() => prisma.ticket.count({ where: { status: { in: ["OPEN", "PENDING", "ESCALATED"] } } })),
    safeCount(() => prisma.provider.count({ where: { enabled: true } })),
    safeCount(() => prisma.paymentGateway.count({ where: { enabled: true } })),
    safeCount(() => prisma.newsPost.count({ where: { status: "PENDING_APPROVAL" } })),
 
  const cards = [
    { label: "Customers", value: customers },
    { label: "Open Tickets", value: tickets },
    { label: "Active Providers", value: providers },
    { label: "Active Payment Gateways", value: gateways },
    { label: "News Pending Approval", value: pendingNews },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Command Center</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-3xl font-bold text-cyan-400">{c.value}</p>
            <p className="mt-1 text-xs text-slate-400">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
