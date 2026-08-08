import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS } from "../src/lib/rbac";

const prisma = new PrismaClient();

const ROLE_DEFS: { key: string; name: string; permissions: string[] }[] = [
  { key: "SUPER_ADMIN", name: "Super Admin", permissions: [...PERMISSIONS] },
  { key: "ADMIN", name: "Admin", permissions: [...PERMISSIONS] }, // scope further via RolePermission edits later
  { key: "SUPPORT", name: "Support", permissions: ["support.view", "support.manage", "customers.view", "diagnostics.run", "chat.send", "news.create"] },
  { key: "SALES", name: "Sales", permissions: ["sales.view", "sales.manage", "customers.view", "meetings.create", "chat.send"] },
  { key: "MARKETING", name: "Marketing", permissions: ["marketing.view", "marketing.manage", "campaigns.create", "emails.campaign", "news.create"] },
  { key: "FINANCE", name: "Finance", permissions: ["wallet.view", "pricing.view", "audit.view"] },
  { key: "DEVELOPER", name: "Developer", permissions: ["providers.view", "routing.view"] },
  { key: "OPERATIONS", name: "Operations", permissions: ["providers.view", "routing.view", "diagnostics.run"] },
  { key: "CLIENT", name: "Client", permissions: [] },
];

async function main() {
  // --- Permissions ---
  for (const key of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, group: key.split(".")[0] },
    });
  }

  // --- Roles + role-permission links ---
  for (const def of ROLE_DEFS) {
    const role = await prisma.role.upsert({
      where: { key: def.key },
      update: { name: def.name },
      create: { key: def.key, name: def.name },
    });
    for (const permKey of def.permissions) {
      const permission = await prisma.permission.findUnique({ where: { key: permKey } });
      if (!permission) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  // --- Super Admin (idempotent, credentials from env only) ---
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME ?? "Super Admin";

  if (email && password) {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(password, 12);
      const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { key: "SUPER_ADMIN" } });
      await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          passwordHash,
          emailVerified: new Date(),
          roles: { create: [{ roleId: superAdminRole.id }] },
        },
      });
      console.log(`Super Admin created: ${email}`);
    } else {
      console.log("Super Admin already exists — skipping.");
    }
  } else {
    console.warn("SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD not set — skipping Super Admin creation.");
  }

  // --- Contact settings defaults (registered address: Hong Kong) ---
  const contactDefaults = [
    { department: "support", displayName: "Customer Support", email: "support@otpprovider.com" },
    { department: "admin", displayName: "Administration", email: "admin@otpprovider.com" },
    { department: "marketing", displayName: "Marketing", email: "marketing@otpprovider.com" },
    { department: "sales", displayName: "Sales", email: "sales@otpprovider.com" },
  ];
  for (const c of contactDefaults) {
    await prisma.contactSetting.upsert({
      where: { department: c.department },
      update: {},
      create: { ...c, whatsapp: null, visible: true }, // WhatsApp left empty — never invented
    });
  }

  // --- System settings defaults ---
  const systemDefaults: Record<string, string> = {
    company_name: "OTPProvider",
    company_country: "Hong Kong",
    company_address: "Set your full registered Hong Kong address in Admin → System Settings",
    default_currency: "USD",
    default_locale: "en",
  };
  for (const [key, value] of Object.entries(systemDefaults)) {
    await prisma.systemSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  // --- Sample manual payment gateway (always-available, zero external deps) ---
  await prisma.paymentGateway.upsert({
    where: { key: "manual_bank_transfer" },
    update: {},
    create: { key: "manual_bank_transfer", displayName: "Manual Bank Transfer", enabled: false, mode: "LIVE" },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
