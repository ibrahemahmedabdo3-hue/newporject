import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

export async function GET() {
  const users = await prisma.user.findMany({
    include: { roles: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({
    success: true,
    data: users.map((u) => ({ id: u.id, name: u.name, email: u.email, status: u.status, roles: u.roles.map((r) => r.role.key) })),
  });
}

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  roleKey: z.enum(["ADMIN", "SUPPORT", "SALES", "MARKETING", "FINANCE", "DEVELOPER", "OPERATIONS"]),
});

// Admin creates internal employee accounts. A random temporary password is
// generated and returned once — never stored in plaintext, never logged.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const actorId = (session?.user as any)?.id;
  try {
    await requirePermission(actorId, "users.create");
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { code: e.message } }, { status: e.message === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const { name, email, roleKey } = schema.parse(await req.json());
  const role = await prisma.role.findUnique({ where: { key: roleKey } });
  if (!role) return NextResponse.json({ success: false, error: { code: "ROLE_NOT_FOUND" } }, { status: 400 });

  const tempPassword = crypto.randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), passwordHash, roles: { create: [{ roleId: role.id }] } },
  });

  await prisma.auditLog.create({ data: { userId: actorId, action: "user.create", resource: "User", resourceId: user.id, metadata: { roleKey } } });

  return NextResponse.json({ success: true, data: { id: user.id, email: user.email, temporaryPassword: tempPassword } });
}
