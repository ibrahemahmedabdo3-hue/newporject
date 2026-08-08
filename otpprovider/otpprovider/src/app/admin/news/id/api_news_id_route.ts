import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  titleEn: z.string().min(3).optional(),
  titleAr: z.string().optional(),
  priority: z.number().optional(),
});

// Admin edits an existing post. Editing an already-approved post sends it
// back to PENDING_APPROVAL so nothing changes on the public ticker without
// re-review.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const actorId = (session?.user as any)?.id;
  try {
    await requirePermission(actorId, "news.approve");
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { code: e.message } }, { status: e.message === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const body = updateSchema.parse(await req.json());
  const existing = await prisma.newsPost.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success: false, error: { code: "NOT_FOUND" } }, { status: 404 });

  const post = await prisma.newsPost.update({
    where: { id: params.id },
    data: {
      ...body,
      status: existing.status === "APPROVED" ? "PENDING_APPROVAL" : existing.status,
    },
  });

  await prisma.auditLog.create({
    data: { userId: actorId, action: "news.edit", resource: "NewsPost", resourceId: post.id },
  });

  return NextResponse.json({ success: true, data: post });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const actorId = (session?.user as any)?.id;
  try {
    await requirePermission(actorId, "news.approve");
  } catch (e: any) {
    return NextResponse.json({ success: false, error: { code: e.message } }, { status: e.message === "UNAUTHENTICATED" ? 401 : 403 });
  }

  await prisma.newsPost.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: { userId: actorId, action: "news.delete", resource: "NewsPost", resourceId: params.id },
  });

  return NextResponse.json({ success: true });
}
