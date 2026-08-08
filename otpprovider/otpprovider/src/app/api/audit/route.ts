import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  try {
    await requirePermission(userId, "audit.view");
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { code: e.message } }, { status: e.message === "UNAUTHENTICATED" ? 401 : 403 });
  }
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });
  return NextResponse.json({ success: true, data: logs });
}
