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

  const ownerHash = await bcrypt.hash("owner123!", 12);
  const hrHash = await bcrypt.hash("hr123!", 12);

  const positions = await Promise.all(
    [
      "Developer",
      "Senior Developer",
      "Frontend Developer",
      "Backend Developer",
      "Designer",
      "Marketing Specialist",
      "HR Manager",
      "Team Leader",
      "Sales Representative",
    ].map((name) => prisma.position.create({ data: { name } }))
  );

  const pos = Object.fromEntries(positions.map((p) => [p.name, p]));

  const charis = await prisma.employee.create({
    data: {
      firstName: "Charis",
      lastName: "Nexus",
      email: "charis@nexus.gr",
      phone: "+30 690 000 0001",
      positionId: pos["Team Leader"].id,
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      startDate: new Date("2022-01-15"),
    },
  });

  const maria = await prisma.employee.create({
    data: {
      firstName: "Maria",
      lastName: "Papadopoulou",
      email: "maria@nexus.gr",
      phone: "+30 690 000 0002",
      positionId: pos["HR Manager"].id,
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      startDate: new Date("2023-03-01"),
      teamLeaderId: charis.id,
    },
  });

  const nikos = await prisma.employee.create({
    data: {
      firstName: "Nikos",
      lastName: "Georgiou",
      email: "nikos@nexus.gr",
      phone: "+30 690 000 0003",
      positionId: pos["Senior Developer"].id,
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      startDate: new Date("2023-06-12"),
      teamLeaderId: charis.id,
    },
  });

  const elena = await prisma.employee.create({
    data: {
      firstName: "Elena",
      lastName: "Kostas",
      email: "elena@nexus.gr",
      phone: "+30 690 000 0004",
      positionId: pos["Designer"].id,
      employmentType: "FULL_TIME",
      status: "ON_LEAVE",
      startDate: new Date("2024-01-08"),
      teamLeaderId: charis.id,
    },
  });

  const alex = await prisma.employee.create({
    data: {
      firstName: "Alex",
      lastName: "Dimitriou",
      email: "alex@nexus.gr",
      phone: "+30 690 000 0005",
      positionId: pos["Frontend Developer"].id,
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      startDate: new Date("2025-09-01"),
      teamLeaderId: nikos.id,
    },
  });

  const departments = await Promise.all([
    prisma.department.create({
      data: { name: "Management", description: "Leadership & strategy", leadId: charis.id },
    }),
    prisma.department.create({
      data: { name: "Development", description: "Engineering & product", leadId: nikos.id },
    }),
    prisma.department.create({
      data: { name: "Design", description: "UI/UX & brand", leadId: elena.id },
    }),
    prisma.department.create({
      data: { name: "Marketing", description: "Growth & content" },
    }),
    prisma.department.create({
      data: { name: "Sales", description: "Client acquisition" },
    }),
    prisma.department.create({
      data: { name: "HR", description: "People operations", leadId: maria.id },
    }),
    prisma.department.create({
      data: { name: "Support", description: "Client support" },
    }),
  ]);

  const dept = Object.fromEntries(departments.map((d) => [d.name, d]));

  await Promise.all([
    prisma.employee.update({ where: { id: charis.id }, data: { departmentId: dept.Management.id } }),
    prisma.employee.update({ where: { id: maria.id }, data: { departmentId: dept.HR.id } }),
    prisma.employee.update({ where: { id: nikos.id }, data: { departmentId: dept.Development.id } }),
    prisma.employee.update({ where: { id: elena.id }, data: { departmentId: dept.Design.id } }),
    prisma.employee.update({ where: { id: alex.id }, data: { departmentId: dept.Development.id } }),
  ]);

  const owner = await prisma.user.create({
    data: {
      email: "owner@nexus.gr",
      passwordHash: ownerHash,
      name: "Charis",
      role: "OWNER",
      employeeId: charis.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "hr@nexus.gr",
      passwordHash: hrHash,
      name: "Maria Papadopoulou",
      role: "HR",
      employeeId: maria.id,
    },
  });

  const hellas = await prisma.project.create({
    data: {
      name: "Hellas Brokers Website",
      client: "Hellas Brokers",
      description: "Real estate website redesign",
      status: "ACTIVE",
      startDate: new Date("2026-08-01"),
      deadline: new Date("2026-11-15"),
      teamLeaderId: nikos.id,
      members: {
        create: [{ employeeId: nikos.id }, { employeeId: alex.id }, { employeeId: elena.id }],
      },
    },
  });

  const jadora = await prisma.project.create({
    data: {
      name: "Jadora Girls Store",
      client: "Jadora Girls",
      description: "E-commerce storefront",
      status: "ACTIVE",
      startDate: new Date("2026-09-01"),
      deadline: new Date("2026-10-20"),
      teamLeaderId: alex.id,
      members: {
        create: [{ employeeId: alex.id }, { employeeId: elena.id }],
      },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Homepage hero redesign",
        projectId: hellas.id,
        assigneeId: elena.id,
        priority: "HIGH",
        status: "IN_PROGRESS",
        dueDate: new Date("2026-10-10"),
      },
      {
        title: "Property listing API",
        projectId: hellas.id,
        assigneeId: nikos.id,
        priority: "URGENT",
        status: "IN_PROGRESS",
        dueDate: new Date("2026-10-08"),
      },
      {
        title: "Checkout flow",
        projectId: jadora.id,
        assigneeId: alex.id,
        priority: "HIGH",
        status: "TODO",
        dueDate: new Date("2026-10-12"),
      },
      {
        title: "Product card polish",
        projectId: jadora.id,
        assigneeId: elena.id,
        priority: "MEDIUM",
        status: "REVIEW",
        dueDate: new Date("2026-10-05"),
      },
      {
        title: "Onboarding checklist",
        assigneeId: maria.id,
        priority: "LOW",
        status: "TODO",
        dueDate: new Date("2026-10-18"),
      },
    ],
  });

  await prisma.leave.createMany({
    data: [
      {
        employeeId: elena.id,
        type: "ANNUAL",
        startDate: new Date("2026-10-01"),
        endDate: new Date("2026-10-07"),
        status: "APPROVED",
        notes: "Autumn break",
      },
      {
        employeeId: alex.id,
        type: "SICK",
        startDate: new Date("2026-10-15"),
        endDate: new Date("2026-10-16"),
        status: "PLANNED",
      },
    ],
  });

  await prisma.candidate.createMany({
    data: [
      {
        name: "Sofia Ioannou",
        email: "sofia@example.com",
        phone: "+30 690 111 1111",
        positionId: pos["Backend Developer"].id,
        status: "INTERVIEW",
        notes: "Strong NestJS background",
      },
      {
        name: "Yannis Markou",
        email: "yannis@example.com",
        positionId: pos["Marketing Specialist"].id,
        status: "NEW",
      },
    ],
  });

  await prisma.revenue.createMany({
    data: [
      {
        client: "Hellas Brokers",
        projectId: hellas.id,
        projectLabel: "Real Estate Website",
        category: "WEBSITE",
        amount: 300,
        date: new Date("2026-10-01"),
        paymentStatus: "PAID",
        paymentMethod: "BANK_TRANSFER",
      },
      {
        client: "Jadora Girls",
        projectId: jadora.id,
        projectLabel: "E-commerce",
        category: "ECOMMERCE",
        amount: 250,
        date: new Date("2026-09-20"),
        paymentStatus: "PAID",
        paymentMethod: "CARD",
      },
      {
        client: "Local Cafe",
        projectLabel: "Landing Page",
        category: "LANDING_PAGE",
        amount: 180,
        date: new Date("2026-09-05"),
        paymentStatus: "PENDING",
      },
    ],
  });

  await prisma.expense.createMany({
    data: [
      {
        provider: "Cursor",
        description: "AI coding subscription",
        category: "SOFTWARE",
        amount: 20,
        date: new Date("2026-10-01"),
        recurring: true,
        paymentMethod: "CARD",
      },
      {
        provider: "ChatGPT",
        description: "Plus plan",
        category: "AI_TOOLS",
        amount: 23,
        date: new Date("2026-10-01"),
        recurring: true,
        paymentMethod: "CARD",
      },
      {
        provider: "Vercel",
        description: "Pro hosting",
        category: "HOSTING",
        amount: 20,
        date: new Date("2026-10-01"),
        recurring: true,
        paymentMethod: "CARD",
      },
      {
        provider: "Namecheap",
        description: "Domain renewal",
        category: "DOMAINS",
        amount: 15,
        date: new Date("2026-09-12"),
        paymentMethod: "CARD",
      },
      {
        provider: "Stock photos",
        description: "Jadora assets",
        category: "MARKETING",
        amount: 20,
        date: new Date("2026-09-18"),
        projectId: jadora.id,
      },
    ],
  });

  await prisma.recurringExpense.createMany({
    data: [
      {
        provider: "Cursor",
        amount: 20,
        frequency: "MONTHLY",
        nextPaymentDate: new Date("2026-11-01"),
        category: "SOFTWARE",
        active: true,
      },
      {
        provider: "ChatGPT",
        amount: 23,
        frequency: "MONTHLY",
        nextPaymentDate: new Date("2026-11-01"),
        category: "AI_TOOLS",
        active: true,
      },
      {
        provider: "Vercel",
        amount: 20,
        frequency: "MONTHLY",
        nextPaymentDate: new Date("2026-11-01"),
        category: "HOSTING",
        active: true,
      },
    ],
  });

  await prisma.salary.createMany({
    data: [
      {
        employeeId: nikos.id,
        amount: 2200,
        frequency: "MONTHLY",
        effectiveDate: new Date("2025-01-01"),
      },
      {
        employeeId: maria.id,
        amount: 1800,
        frequency: "MONTHLY",
        effectiveDate: new Date("2024-06-01"),
      },
      {
        employeeId: alex.id,
        amount: 1600,
        frequency: "MONTHLY",
        effectiveDate: new Date("2025-09-01"),
      },
    ],
  });

  await prisma.payment.create({
    data: {
      employeeId: nikos.id,
      type: "SALARY",
      amount: 2200,
      date: new Date("2026-09-30"),
      period: "September 2026",
      status: "PAID",
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: owner.id,
        action: "created",
        entity: "Employee",
        entityId: alex.id,
        details: "Alex Dimitriou",
      },
      {
        userId: owner.id,
        action: "created",
        entity: "Project",
        entityId: hellas.id,
        details: "Hellas Brokers Website",
      },
      {
        userId: owner.id,
        action: "added",
        entity: "Revenue",
        details: "Hellas Brokers €300",
      },
      {
        userId: owner.id,
        action: "added",
        entity: "Expense",
        details: "Cursor €20",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Owner: owner@nexus.gr / owner123!");
  console.log("HR:    hr@nexus.gr / hr123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
