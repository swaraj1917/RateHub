require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

async function main() {
  const email = "admin@ratehub.local";

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("Admin account already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@RateHub1", 12);

  const admin = await prisma.user.create({
    data: {
      name: "RateHub System Administrator",
      email,
      password: hashedPassword,
      address: "RateHub Administration",
      role: "ADMIN",
    },
  });

  console.log("Admin account created successfully:");
  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });