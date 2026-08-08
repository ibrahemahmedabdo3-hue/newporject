import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "DISABLED"]).optional(),
  name: z.string().min(1).optional(),
  roleKey: z.enum(["ADMIN", "SUPPORT", "SALES", "MARKETING", "FINANCE", "DEVELOPER", "OPERATIONS", "CLIENT"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const actorId = (session?.user as any)?.id;
  try {
    await requirePermission(actorId, "users.edit");
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { code: e.message } }, { status: e.message === "UNAUTHENTICATED" ? 401 : 403 });
  }
  const { status, name, roleKey } = schema.parse(await req.json());

  if (roleKey) {
    const role = await prisma.role.findUnique({ where: { key: roleKey } });
    if (!role) return NextResponse.json({ success: false, error: { code: "ROLE_NOT_FOUND" } }, { status: 400 });
    await prisma.userRole.deleteMany({ where: { userId: params.id } });
    await prisma.userRole.create({ data: { userId: params.id, roleId: role.id } });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { ...(status ? { status } : {}), ...(name ? { name } : {}) },
    include: { roles: { include: { role: true } } },
  });

  await prisma.auditLog.create({ data: { userId: actorId, action: "user.edit", resource: "User", resourceId: user.id, metadata: { status, name, roleKey } } });
  return NextResponse.json({
    success: true,
    data: { id: user.id, name: user.name, status: user.status, roles: user.roles.map((r) => r.role.key) },
  });
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
