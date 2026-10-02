import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Nexus Control Center…");

  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.recurringExpense.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.revenue.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.document.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.position.deleteMany();
  await prisma.department.deleteMany();

  const passwordHash = await bcrypt.hash("AdminNexus2026!", 12);

  await prisma.user.create({
    data: {
      email: "nexusdevstudio@outlook.com",
      passwordHash,
      name: "Χαράλαμπος Χριστόπουλος",
      role: "OWNER",
    },
  });

  console.log("Seed complete.");
  console.log("Owner: nexusdevstudio@outlook.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
