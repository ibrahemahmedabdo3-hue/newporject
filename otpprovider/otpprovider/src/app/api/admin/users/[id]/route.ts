import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ status: z.enum(["ACTIVE", "SUSPENDED", "DISABLED"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const actorId = (session?.user as any)?.id;
  try {
    await requirePermission(actorId, "users.edit");
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { code: e.message } }, { status: e.message === "UNAUTHENTICATED" ? 401 : 403 });
  }
  const { status } = schema.parse(await req.json());
  const user = await prisma.user.update({ where: { id: params.id }, data: { status } });
  await prisma.auditLog.create({ data: { userId: actorId, action: "user.status_change", resource: "User", resourceId: user.id, metadata: { status } } });
  return NextResponse.json({ success: true, data: { id: user.id, status: user.status } });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const actorId = (session?.user as any)?.id;
  try {
    await requirePermission(actorId, "users.delete");
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { code: e.message } }, { status: e.message === "UNAUTHENTICATED" ? 401 : 403 });
  }
  await prisma.user.delete({ where: { id: params.id } });
  await prisma.auditLog.create({ data: { userId: actorId, action: "user.delete", resource: "User", resourceId: params.id } });
  return NextResponse.json({ success: true });
}
