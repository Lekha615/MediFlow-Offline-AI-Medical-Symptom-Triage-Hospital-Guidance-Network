import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // =========================================================
  // 1. SEED ROLES
  // =========================================================

  const roles = [
    {
      name: "SUPER_ADMIN",
      description: "Global system administrator",
    },
    {
      name: "HOSPITAL_ADMIN",
      description: "Hospital level administrator",
    },
    {
      name: "DOCTOR",
      description: "Medical practitioner",
    },
    {
      name: "RECEPTIONIST",
      description: "Front desk reception staff",
    },
    {
      name: "LAB_TECHNICIAN",
      description: "Laboratory operator",
    },
    {
      name: "PATIENT",
      description: "Healthcare seeker",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {},
      create: role,
    });
  }

  console.log("✅ Roles seeded");

  // =========================================================
  // 2. SEED DEFAULT LOCATION
  // =========================================================

  const state = await prisma.state.upsert({
    where: {
      code: "MH",
    },
    update: {},
    create: {
      name: "Maharashtra",
      code: "MH",
    },
  });

  await prisma.city.upsert({
    where: {
      name_stateId: {
        name: "Mumbai",
        stateId: state.id,
      },
    },
    update: {},
    create: {
      name: "Mumbai",
      stateId: state.id,
    },
  });

  console.log(
    "✅ Location data (States & Cities) seeded"
  );

  // =========================================================
  // 3. SEED SUPER ADMIN
  // =========================================================

  const superAdminRole =
    await prisma.role.findUnique({
      where: {
        name: "SUPER_ADMIN",
      },
    });

  if (!superAdminRole) {
    throw new Error(
      "SUPER_ADMIN role was not found."
    );
  }

  const adminPassword = "Admin@12345";

  const passwordHash =
    await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: {
      email: "admin@mediflow.com",
    },

    update: {
      roleId: superAdminRole.id,
      passwordHash,
      status: "ACTIVE",
    },

    create: {
      email: "admin@mediflow.com",
      phoneNumber: "9999999999",
      passwordHash,
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
  });

  console.log(
    "✅ Super Admin seeded"
  );

  console.log(
    "📧 Admin email: admin@mediflow.com"
  );

  console.log(
    "🔑 Admin password: Admin@12345"
  );

  console.log(
    "🎉 Seeding completed successfully!"
  );
}

main()
  .catch((e) => {
    console.error(
      "❌ Seeding failed:",
      e
    );

    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });