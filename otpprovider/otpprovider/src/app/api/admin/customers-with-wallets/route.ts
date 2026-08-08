import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  try {
    await requirePermission((session?.user as any)?.id, "wallet.view");
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { code: e.message } }, { status: e.message === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const customers = await prisma.customer.findMany({
    include: { user: { select: { name: true, email: true } }, wallet: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    success: true,
    data: customers.map((c) => ({
      id: c.id,
      companyName: c.companyName,
      user: c.user,
      wallet: c.wallet ? { balance: c.wallet.balance.toString() } : null,
    })),
  });
}
