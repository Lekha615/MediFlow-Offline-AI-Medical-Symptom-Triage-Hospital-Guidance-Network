import { PrismaClient, HospitalType, SpecialityType, EntityStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // =========================================================
  // 1. SEED ROLES
  // =========================================================

  const roles = [
    { name: "SUPER_ADMIN", description: "Global system administrator" },
    { name: "HOSPITAL_ADMIN", description: "Hospital level administrator" },
    { name: "DOCTOR", description: "Medical practitioner" },
    { name: "RECEPTIONIST", description: "Front desk reception staff" },
    { name: "LAB_TECHNICIAN", description: "Laboratory operator" },
    { name: "PATIENT", description: "Healthcare seeker" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log("✅ Roles seeded");

  // =========================================================
  // 2. SEED INDIAN STATES & CITIES (CHHATTISGARH & EXPANSION)
  // =========================================================

  const stateData = [
    {
      code: "CG",
      name: "Chhattisgarh",
      cities: [
        "Raipur",
        "Bilaspur",
        "Bhilai",
        "Durg",
        "Korba",
        "Rajnandgaon",
        "Jagdalpur",
        "Raigarh",
        "Ambikapur",
        "Dhamtari",
      ],
    },
    {
      code: "MH",
      name: "Maharashtra",
      cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad"],
    },
    {
      code: "DL",
      name: "Delhi",
      cities: ["New Delhi", "North Delhi", "South Delhi"],
    },
    {
      code: "KA",
      name: "Karnataka",
      cities: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
    },
    {
      code: "TN",
      name: "Tamil Nadu",
      cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    },
    {
      code: "TG",
      name: "Telangana",
      cities: ["Hyderabad", "Warangal", "Nizamabad"],
    },
    {
      code: "GJ",
      name: "Gujarat",
      cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    },
    {
      code: "UP",
      name: "Uttar Pradesh",
      cities: ["Lucknow", "Kanpur", "Varanasi", "Noida", "Agra"],
    },
    {
      code: "MP",
      name: "Madhya Pradesh",
      cities: ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
    },
    {
      code: "WB",
      name: "West Bengal",
      cities: ["Kolkata", "Siliguri", "Asansol", "Durgapur"],
    },
    {
      code: "KL",
      name: "Kerala",
      cities: ["Thiruvananthapuram", "Kochi", "Kozhikode"],
    },
    {
      code: "RJ",
      name: "Rajasthan",
      cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
    },
    {
      code: "OD",
      name: "Odisha",
      cities: ["Bhubaneswar", "Cuttack", "Rourkela"],
    },
    {
      code: "BR",
      name: "Bihar",
      cities: ["Patna", "Gaya", "Muzaffarpur"],
    },
    {
      code: "PB",
      name: "Punjab",
      cities: ["Chandigarh", "Ludhiana", "Amritsar"],
    },
    {
      code: "AP",
      name: "Andhra Pradesh",
      cities: ["Visakhapatnam", "Vijayawada", "Guntur"],
    },
  ];

  for (const s of stateData) {
    const stateRecord = await prisma.state.upsert({
      where: { code: s.code },
      update: { name: s.name },
      create: { name: s.name, code: s.code },
    });

    for (const cityName of s.cities) {
      await prisma.city.upsert({
        where: {
          name_stateId: {
            name: cityName,
            stateId: stateRecord.id,
          },
        },
        update: {},
        create: {
          name: cityName,
          stateId: stateRecord.id,
        },
      });
    }
  }

  console.log("✅ Location data (Chhattisgarh & other Indian states) seeded");

  // =========================================================
  // 3. SEED SUPER ADMIN
  // =========================================================

  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role was not found.");
  }

  const doctorRole = await prisma.role.findUnique({
    where: { name: "DOCTOR" },
  });

  const adminPassword = "Admin@12345";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: "admin@mediflow.com" },
    update: {
      roleId: superAdminRole.id,
      passwordHash,
      status: EntityStatus.ACTIVE,
    },
    create: {
      email: "admin@mediflow.com",
      phoneNumber: "9999999999",
      passwordHash,
      roleId: superAdminRole.id,
      status: EntityStatus.ACTIVE,
    },
  });

  console.log("✅ Super Admin seeded (admin@mediflow.com / Admin@12345)");

  // =========================================================
  // 4. SEED VERIFIED CHHATTISGARH DOCTORS FOR IMPORTED HOSPITALS
  // =========================================================

  if (doctorRole) {
    const aiims = await prisma.hospital.findUnique({ where: { code: "AIIMS-RPR" } });
    if (aiims) {
      // Ensure Cardiology department
      const deptCardio = await prisma.department.upsert({
        where: { hospitalId_code: { hospitalId: aiims.id, code: "CARDIO" } },
        update: {},
        create: {
          hospitalId: aiims.id,
          name: "Cardiology",
          code: "CARDIO",
          description: "Department of Cardiovascular Sciences",
        },
      });

      const deptPed = await prisma.department.upsert({
        where: { hospitalId_code: { hospitalId: aiims.id, code: "PED" } },
        update: {},
        create: {
          hospitalId: aiims.id,
          name: "Pediatrics",
          code: "PED",
          description: "Department of Pediatric Medicine",
        },
      });

      // Doctor 1: Dr. Vivek Agrawal
      const docUser1 = await prisma.user.upsert({
        where: { email: "dr.agrawal@aiimsrpr.mediflow.in" },
        update: { hospitalId: aiims.id },
        create: {
          email: "dr.agrawal@aiimsrpr.mediflow.in",
          phoneNumber: "9826011111",
          passwordHash,
          roleId: doctorRole.id,
          hospitalId: aiims.id,
        },
      });

      await prisma.doctor.upsert({
        where: { licenseNumber: "CG-MC-1001" },
        update: {
          isAvailable: true,
          hospitalId: aiims.id,
          departmentId: deptCardio.id,
        },
        create: {
          userId: docUser1.id,
          hospitalId: aiims.id,
          departmentId: deptCardio.id,
          licenseNumber: "CG-MC-1001",
          firstName: "Vivek",
          lastName: "Agrawal",
          qualification: "MD, DM (Cardiology), AIIMS",
          consultationFee: 0,
          isAvailable: true,
        },
      });

      // Doctor 2: Dr. Sunita Verma
      const docUser2 = await prisma.user.upsert({
        where: { email: "dr.verma@aiimsrpr.mediflow.in" },
        update: { hospitalId: aiims.id },
        create: {
          email: "dr.verma@aiimsrpr.mediflow.in",
          phoneNumber: "9826022222",
          passwordHash,
          roleId: doctorRole.id,
          hospitalId: aiims.id,
        },
      });

      await prisma.doctor.upsert({
        where: { licenseNumber: "CG-MC-1002" },
        update: {
          isAvailable: true,
          hospitalId: aiims.id,
          departmentId: deptPed.id,
        },
        create: {
          userId: docUser2.id,
          hospitalId: aiims.id,
          departmentId: deptPed.id,
          licenseNumber: "CG-MC-1002",
          firstName: "Sunita",
          lastName: "Verma",
          qualification: "MBBS, MD (Pediatrics)",
          consultationFee: 0,
          isAvailable: true,
        },
      });
    }

    const apolloBsp = await prisma.hospital.findUnique({ where: { code: "APOLLO-BSP" } });
    if (apolloBsp) {
      const deptOrtho = await prisma.department.upsert({
        where: { hospitalId_code: { hospitalId: apolloBsp.id, code: "ORTHO" } },
        update: {},
        create: {
          hospitalId: apolloBsp.id,
          name: "Orthopedics & Joint Replacement",
          code: "ORTHO",
        },
      });

      const docUser3 = await prisma.user.upsert({
        where: { email: "dr.chandrakar@apollobsp.mediflow.in" },
        update: { hospitalId: apolloBsp.id },
        create: {
          email: "dr.chandrakar@apollobsp.mediflow.in",
          phoneNumber: "9826033333",
          passwordHash,
          roleId: doctorRole.id,
          hospitalId: apolloBsp.id,
        },
      });

      await prisma.doctor.upsert({
        where: { licenseNumber: "CG-MC-2001" },
        update: {
          isAvailable: true,
          hospitalId: apolloBsp.id,
          departmentId: deptOrtho.id,
        },
        create: {
          userId: docUser3.id,
          hospitalId: apolloBsp.id,
          departmentId: deptOrtho.id,
          licenseNumber: "CG-MC-2001",
          firstName: "Rajesh",
          lastName: "Chandrakar",
          qualification: "MS (Orthopedics), MCh",
          consultationFee: 800,
          isAvailable: true,
        },
      });
    }

    const bramh = await prisma.hospital.findUnique({ where: { code: "BRAMH-RPR" } });
    if (bramh) {
      const deptMed = await prisma.department.upsert({
        where: { hospitalId_code: { hospitalId: bramh.id, code: "MED" } },
        update: {},
        create: {
          hospitalId: bramh.id,
          name: "General Medicine",
          code: "MED",
        },
      });

      const docUser4 = await prisma.user.upsert({
        where: { email: "dr.sahu@bramh.mediflow.in" },
        update: { hospitalId: bramh.id },
        create: {
          email: "dr.sahu@bramh.mediflow.in",
          phoneNumber: "9826044444",
          passwordHash,
          roleId: doctorRole.id,
          hospitalId: bramh.id,
        },
      });

      await prisma.doctor.upsert({
        where: { licenseNumber: "CG-MC-3001" },
        update: {
          isAvailable: false,
          hospitalId: bramh.id,
          departmentId: deptMed.id,
        },
        create: {
          userId: docUser4.id,
          hospitalId: bramh.id,
          departmentId: deptMed.id,
          licenseNumber: "CG-MC-3001",
          firstName: "Anjali",
          lastName: "Sahu",
          qualification: "MBBS, MD (Internal Medicine)",
          consultationFee: 50,
          isAvailable: false,
        },
      });
    }

    console.log("✅ Verified Doctors seeded for Chhattisgarh hospitals");
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });