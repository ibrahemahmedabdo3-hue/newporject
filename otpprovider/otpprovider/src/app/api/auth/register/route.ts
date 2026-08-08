import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }
  const { name, email, password, companyName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json(
      { success: false, error: { code: "EMAIL_TAKEN", message: "Email already registered" } },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const clientRole = await prisma.role.findUnique({ where: { key: "CLIENT" } });

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      roles: clientRole ? { create: [{ roleId: clientRole.id }] } : undefined,
      customer: {
        create: {
          companyName,
          wallet: { create: { balance: 0 } },
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: { id: user.id, email: user.email } });
}
