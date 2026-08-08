import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/rbac";
import { z } from "zod";

export async function GET() {
  const roles = await prisma.role.findMany({ include: { permissions: { include: { permission: true } } } });
  return NextResponse.json({
    success: true,
    data: {
      allPermissions: PERMISSIONS,
      roles: roles.map((r) => ({ id: r.id, key: r.key, name: r.name, permissions: r.permissions.map((p) => p.permission.key) })),
    },
  });
}

const schema = z.object({ roleId: z.string(), permissionKey: z.string(), enabled: z.boolean() });

// No Admin permission can bypass this check — even Admin can't grant a
// permission it doesn't itself hold, and SUPER_ADMIN role is protected
// from modification entirely.
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const actorId = (session?.user as any)?.id;
  try {
    await requirePermission(actorId, "roles.edit");
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { code: e.message } }, { status: e.message === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const { roleId, permissionKey, enabled } = schema.parse(await req.json());
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (role?.key === "SUPER_ADMIN") {
    return NextResponse.json({ success: false, error: { code: "PROTECTED_ROLE" } }, { status: 400 });
  }
  const permission = await prisma.permission.findUnique({ where: { key: permissionKey } });
  if (!permission) return NextResponse.json({ success: false, error: { code: "PERMISSION_NOT_FOUND" } }, { status: 400 });

  if (enabled) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId: permission.id } },
      update: {},
      create: { roleId, permissionId: permission.id },
    });
  } else {
    await prisma.rolePermission.deleteMany({ where: { roleId, permissionId: permission.id } });
  }

  await prisma.auditLog.create({ data: { userId: actorId, action: "role.permission_change", resource: "Role", resourceId: roleId, metadata: { permissionKey, enabled } } });

  return NextResponse.json({ success: true });
}
