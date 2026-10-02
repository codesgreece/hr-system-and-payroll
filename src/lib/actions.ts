"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, requireFinanceAccess, requireSalaryAccess, requireOwner } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { canAccessFinance } from "@/lib/permissions";

function str(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function optStr(form: FormData, key: string) {
  const v = str(form, key);
  return v || null;
}

function dateVal(form: FormData, key: string) {
  const v = str(form, key);
  return v ? new Date(v) : null;
}

function num(form: FormData, key: string) {
  return parseFloat(str(form, key) || "0");
}

function bool(form: FormData, key: string) {
  return form.get(key) === "on" || form.get(key) === "true" || form.get(key) === "1";
}

// ─── Departments ───────────────────────────────────────────

export async function createDepartment(form: FormData) {
  const user = await requireUser();
  const dept = await prisma.department.create({
    data: {
      name: str(form, "name"),
      description: optStr(form, "description"),
      leadId: optStr(form, "leadId"),
    },
  });
  await audit(user.id, "created", "Department", dept.id, dept.name);
  revalidatePath("/departments");
}

export async function updateDepartment(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  const dept = await prisma.department.update({
    where: { id },
    data: {
      name: str(form, "name"),
      description: optStr(form, "description"),
      leadId: optStr(form, "leadId"),
    },
  });
  await audit(user.id, "updated", "Department", dept.id, dept.name);
  revalidatePath("/departments");
}

export async function deleteDepartment(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  const dept = await prisma.department.delete({ where: { id } });
  await audit(user.id, "deleted", "Department", id, dept.name);
  revalidatePath("/departments");
}

// ─── Positions ─────────────────────────────────────────────

export async function createPosition(form: FormData) {
  const user = await requireUser();
  const pos = await prisma.position.create({
    data: { name: str(form, "name"), description: optStr(form, "description") },
  });
  await audit(user.id, "created", "Position", pos.id, pos.name);
  revalidatePath("/positions");
}

export async function updatePosition(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  const pos = await prisma.position.update({
    where: { id },
    data: { name: str(form, "name"), description: optStr(form, "description") },
  });
  await audit(user.id, "updated", "Position", pos.id, pos.name);
  revalidatePath("/positions");
}

export async function deletePosition(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  const pos = await prisma.position.delete({ where: { id } });
  await audit(user.id, "deleted", "Position", id, pos.name);
  revalidatePath("/positions");
}

// ─── Employees ─────────────────────────────────────────────

export async function createEmployee(form: FormData) {
  const user = await requireUser();
  const emp = await prisma.employee.create({
    data: {
      firstName: str(form, "firstName"),
      lastName: str(form, "lastName"),
      email: str(form, "email").toLowerCase(),
      phone: optStr(form, "phone"),
      address: optStr(form, "address"),
      emergencyContact: optStr(form, "emergencyContact"),
      positionId: optStr(form, "positionId"),
      departmentId: optStr(form, "departmentId"),
      teamLeaderId: optStr(form, "teamLeaderId"),
      employmentType: (optStr(form, "employmentType") as "FULL_TIME") || "FULL_TIME",
      startDate: dateVal(form, "startDate") || new Date(),
      status: (optStr(form, "status") as "ACTIVE") || "ACTIVE",
      performanceNotes: optStr(form, "performanceNotes"),
    },
  });
  await audit(user.id, "created", "Employee", emp.id, `${emp.firstName} ${emp.lastName}`);
  revalidatePath("/employees");
  redirect(`/employees/${emp.id}`);
}

export async function updateEmployee(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  const emp = await prisma.employee.update({
    where: { id },
    data: {
      firstName: str(form, "firstName"),
      lastName: str(form, "lastName"),
      email: str(form, "email").toLowerCase(),
      phone: optStr(form, "phone"),
      address: optStr(form, "address"),
      emergencyContact: optStr(form, "emergencyContact"),
      positionId: optStr(form, "positionId"),
      departmentId: optStr(form, "departmentId"),
      teamLeaderId: optStr(form, "teamLeaderId"),
      employmentType: (optStr(form, "employmentType") as "FULL_TIME") || "FULL_TIME",
      startDate: dateVal(form, "startDate") || undefined,
      status: (optStr(form, "status") as "ACTIVE") || "ACTIVE",
      performanceNotes: optStr(form, "performanceNotes"),
    },
  });
  await audit(user.id, "updated", "Employee", emp.id, `${emp.firstName} ${emp.lastName}`);
  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
}

export async function archiveEmployee(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  const emp = await prisma.employee.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  await audit(user.id, "archived", "Employee", emp.id, `${emp.firstName} ${emp.lastName}`);
  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
}

// ─── Leave ─────────────────────────────────────────────────

export async function createLeave(form: FormData) {
  const user = await requireUser();
  const leave = await prisma.leave.create({
    data: {
      employeeId: str(form, "employeeId"),
      type: str(form, "type") as "ANNUAL",
      startDate: dateVal(form, "startDate")!,
      endDate: dateVal(form, "endDate")!,
      status: (optStr(form, "status") as "PLANNED") || "PLANNED",
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "recorded", "Leave", leave.id);
  revalidatePath("/leave");
  revalidatePath("/dashboard");
}

export async function updateLeave(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  await prisma.leave.update({
    where: { id },
    data: {
      employeeId: str(form, "employeeId"),
      type: str(form, "type") as "ANNUAL",
      startDate: dateVal(form, "startDate")!,
      endDate: dateVal(form, "endDate")!,
      status: str(form, "status") as "PLANNED",
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "updated", "Leave", id);
  revalidatePath("/leave");
}

export async function deleteLeave(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  await prisma.leave.delete({ where: { id } });
  await audit(user.id, "deleted", "Leave", id);
  revalidatePath("/leave");
}

// ─── Documents ─────────────────────────────────────────────

export async function createDocument(form: FormData) {
  const user = await requireUser();
  const file = form.get("file") as File | null;
  let fileName = optStr(form, "fileName") || "document";
  let filePath = optStr(form, "filePath") || "";
  let mimeType: string | null = null;

  if (file && file.size > 0) {
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safe), buffer);
    fileName = file.name;
    filePath = `/uploads/${safe}`;
    mimeType = file.type || null;
  }

  if (!filePath) filePath = "/uploads/placeholder.txt";

  const doc = await prisma.document.create({
    data: {
      employeeId: str(form, "employeeId"),
      name: str(form, "name"),
      category: str(form, "category") as "CONTRACT",
      fileName,
      filePath,
      mimeType,
      expirationDate: dateVal(form, "expirationDate"),
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "uploaded", "Document", doc.id, doc.name);
  revalidatePath("/documents");
}

export async function deleteDocument(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  await prisma.document.delete({ where: { id } });
  await audit(user.id, "deleted", "Document", id);
  revalidatePath("/documents");
}

// ─── Candidates ────────────────────────────────────────────

export async function createCandidate(form: FormData) {
  const user = await requireUser();
  const c = await prisma.candidate.create({
    data: {
      name: str(form, "name"),
      email: str(form, "email").toLowerCase(),
      phone: optStr(form, "phone"),
      positionId: optStr(form, "positionId"),
      status: (optStr(form, "status") as "NEW") || "NEW",
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "created", "Candidate", c.id, c.name);
  revalidatePath("/recruitment");
}

export async function updateCandidate(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  const c = await prisma.candidate.update({
    where: { id },
    data: {
      name: str(form, "name"),
      email: str(form, "email").toLowerCase(),
      phone: optStr(form, "phone"),
      positionId: optStr(form, "positionId"),
      status: str(form, "status") as "NEW",
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "updated", "Candidate", c.id, c.name);
  revalidatePath("/recruitment");
}

export async function hireCandidate(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) return;

  const [firstName, ...rest] = candidate.name.split(" ");
  const lastName = rest.join(" ") || firstName;

  const emp = await prisma.employee.create({
    data: {
      firstName,
      lastName,
      email: candidate.email,
      phone: candidate.phone,
      positionId: candidate.positionId,
      status: "ACTIVE",
      startDate: new Date(),
    },
  });

  await prisma.candidate.update({
    where: { id },
    data: { status: "HIRED" },
  });

  await audit(user.id, "hired", "Candidate", id, `Converted to employee ${emp.firstName} ${emp.lastName}`);
  revalidatePath("/recruitment");
  revalidatePath("/employees");
  redirect(`/employees/${emp.id}`);
}

export async function deleteCandidate(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  await prisma.candidate.delete({ where: { id } });
  await audit(user.id, "deleted", "Candidate", id);
  revalidatePath("/recruitment");
}

// ─── Projects ──────────────────────────────────────────────

export async function createProject(form: FormData) {
  const user = await requireUser();
  const memberIds = form.getAll("memberIds").map(String).filter(Boolean);
  const project = await prisma.project.create({
    data: {
      name: str(form, "name"),
      client: optStr(form, "client"),
      description: optStr(form, "description"),
      status: (optStr(form, "status") as "PLANNING") || "PLANNING",
      startDate: dateVal(form, "startDate"),
      deadline: dateVal(form, "deadline"),
      teamLeaderId: optStr(form, "teamLeaderId"),
      members: {
        create: memberIds.map((employeeId) => ({ employeeId })),
      },
    },
  });
  await audit(user.id, "created", "Project", project.id, project.name);
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  const memberIds = form.getAll("memberIds").map(String).filter(Boolean);
  await prisma.projectMember.deleteMany({ where: { projectId: id } });
  const project = await prisma.project.update({
    where: { id },
    data: {
      name: str(form, "name"),
      client: optStr(form, "client"),
      description: optStr(form, "description"),
      status: str(form, "status") as "PLANNING",
      startDate: dateVal(form, "startDate"),
      deadline: dateVal(form, "deadline"),
      teamLeaderId: optStr(form, "teamLeaderId"),
      members: {
        create: memberIds.map((employeeId) => ({ employeeId })),
      },
    },
  });
  await audit(user.id, "updated", "Project", project.id, project.name);
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
}

export async function deleteProject(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  const project = await prisma.project.delete({ where: { id } });
  await audit(user.id, "deleted", "Project", id, project.name);
  revalidatePath("/projects");
  redirect("/projects");
}

// ─── Tasks ─────────────────────────────────────────────────

export async function createTask(form: FormData) {
  const user = await requireUser();
  const task = await prisma.task.create({
    data: {
      title: str(form, "title"),
      projectId: optStr(form, "projectId"),
      assigneeId: optStr(form, "assigneeId"),
      priority: (optStr(form, "priority") as "MEDIUM") || "MEDIUM",
      status: (optStr(form, "status") as "TODO") || "TODO",
      dueDate: dateVal(form, "dueDate"),
    },
  });
  await audit(user.id, "created", "Task", task.id, task.title);
  revalidatePath("/tasks");
}

export async function updateTask(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  const task = await prisma.task.update({
    where: { id },
    data: {
      title: str(form, "title"),
      projectId: optStr(form, "projectId"),
      assigneeId: optStr(form, "assigneeId"),
      priority: str(form, "priority") as "MEDIUM",
      status: str(form, "status") as "TODO",
      dueDate: dateVal(form, "dueDate"),
    },
  });
  await audit(user.id, "updated", "Task", task.id, task.title);
  revalidatePath("/tasks");
}

export async function deleteTask(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  await prisma.task.delete({ where: { id } });
  await audit(user.id, "deleted", "Task", id);
  revalidatePath("/tasks");
}

// ─── Finance ───────────────────────────────────────────────

export async function createRevenue(form: FormData) {
  const user = await requireFinanceAccess();
  const rev = await prisma.revenue.create({
    data: {
      client: str(form, "client"),
      projectId: optStr(form, "projectId"),
      projectLabel: optStr(form, "projectLabel"),
      category: str(form, "category") as "WEBSITE",
      amount: num(form, "amount"),
      date: dateVal(form, "date") || new Date(),
      paymentStatus: (optStr(form, "paymentStatus") as "PENDING") || "PENDING",
      paymentMethod: optStr(form, "paymentMethod") as "CARD" | null,
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "added", "Revenue", rev.id, `${rev.client} €${rev.amount}`);
  revalidatePath("/finance");
  revalidatePath("/finance/revenue");
}

export async function updateRevenue(form: FormData) {
  const user = await requireFinanceAccess();
  const id = str(form, "id");
  const rev = await prisma.revenue.update({
    where: { id },
    data: {
      client: str(form, "client"),
      projectId: optStr(form, "projectId"),
      projectLabel: optStr(form, "projectLabel"),
      category: str(form, "category") as "WEBSITE",
      amount: num(form, "amount"),
      date: dateVal(form, "date") || new Date(),
      paymentStatus: str(form, "paymentStatus") as "PENDING",
      paymentMethod: optStr(form, "paymentMethod") as "CARD" | null,
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "updated", "Revenue", rev.id, `${rev.client} €${rev.amount}`);
  revalidatePath("/finance/revenue");
}

export async function deleteRevenue(form: FormData) {
  const user = await requireFinanceAccess();
  const id = str(form, "id");
  await prisma.revenue.delete({ where: { id } });
  await audit(user.id, "deleted", "Revenue", id);
  revalidatePath("/finance/revenue");
}

export async function createExpense(form: FormData) {
  const user = await requireFinanceAccess();
  const exp = await prisma.expense.create({
    data: {
      provider: str(form, "provider"),
      description: optStr(form, "description"),
      category: str(form, "category") as "SOFTWARE",
      amount: num(form, "amount"),
      date: dateVal(form, "date") || new Date(),
      paymentMethod: optStr(form, "paymentMethod") as "CARD" | null,
      recurring: bool(form, "recurring"),
      projectId: optStr(form, "projectId"),
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "added", "Expense", exp.id, `${exp.provider} €${exp.amount}`);
  revalidatePath("/finance");
  revalidatePath("/finance/expenses");
}

export async function updateExpense(form: FormData) {
  const user = await requireFinanceAccess();
  const id = str(form, "id");
  const exp = await prisma.expense.update({
    where: { id },
    data: {
      provider: str(form, "provider"),
      description: optStr(form, "description"),
      category: str(form, "category") as "SOFTWARE",
      amount: num(form, "amount"),
      date: dateVal(form, "date") || new Date(),
      paymentMethod: optStr(form, "paymentMethod") as "CARD" | null,
      recurring: bool(form, "recurring"),
      projectId: optStr(form, "projectId"),
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "updated", "Expense", exp.id, `${exp.provider} €${exp.amount}`);
  revalidatePath("/finance/expenses");
}

export async function deleteExpense(form: FormData) {
  const user = await requireFinanceAccess();
  const id = str(form, "id");
  await prisma.expense.delete({ where: { id } });
  await audit(user.id, "deleted", "Expense", id);
  revalidatePath("/finance/expenses");
}

export async function createRecurringExpense(form: FormData) {
  const user = await requireFinanceAccess();
  const r = await prisma.recurringExpense.create({
    data: {
      provider: str(form, "provider"),
      amount: num(form, "amount"),
      frequency: (optStr(form, "frequency") as "MONTHLY") || "MONTHLY",
      nextPaymentDate: dateVal(form, "nextPaymentDate") || new Date(),
      category: str(form, "category") as "SOFTWARE",
      active: form.get("active") !== "false",
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "created", "RecurringExpense", r.id, r.provider);
  revalidatePath("/finance/recurring");
}

export async function updateRecurringExpense(form: FormData) {
  const user = await requireFinanceAccess();
  const id = str(form, "id");
  const r = await prisma.recurringExpense.update({
    where: { id },
    data: {
      provider: str(form, "provider"),
      amount: num(form, "amount"),
      frequency: str(form, "frequency") as "MONTHLY",
      nextPaymentDate: dateVal(form, "nextPaymentDate") || new Date(),
      category: str(form, "category") as "SOFTWARE",
      active: form.get("active") !== "false" && form.get("active") !== null
        ? bool(form, "active") || str(form, "active") === "true"
        : true,
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "updated", "RecurringExpense", r.id, r.provider);
  revalidatePath("/finance/recurring");
}

export async function deleteRecurringExpense(form: FormData) {
  const user = await requireFinanceAccess();
  const id = str(form, "id");
  await prisma.recurringExpense.delete({ where: { id } });
  await audit(user.id, "deleted", "RecurringExpense", id);
  revalidatePath("/finance/recurring");
}

// ─── Salary / Payments (Owner only) ────────────────────────

export async function createSalary(form: FormData) {
  const user = await requireSalaryAccess();
  const s = await prisma.salary.create({
    data: {
      employeeId: str(form, "employeeId"),
      amount: num(form, "amount"),
      frequency: (optStr(form, "frequency") as "MONTHLY") || "MONTHLY",
      effectiveDate: dateVal(form, "effectiveDate") || new Date(),
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "changed salary", "Salary", s.id, `Employee ${s.employeeId}`);
  revalidatePath(`/employees/${s.employeeId}`);
  revalidatePath("/finance/payments");
}

export async function createPayment(form: FormData) {
  const user = await requireSalaryAccess();
  const p = await prisma.payment.create({
    data: {
      employeeId: str(form, "employeeId"),
      type: (optStr(form, "type") as "SALARY") || "SALARY",
      amount: num(form, "amount"),
      date: dateVal(form, "date") || new Date(),
      period: optStr(form, "period"),
      status: (optStr(form, "status") as "PENDING") || "PENDING",
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "created", "Payment", p.id);
  revalidatePath("/finance/payments");
}

export async function updatePayment(form: FormData) {
  const user = await requireSalaryAccess();
  const id = str(form, "id");
  await prisma.payment.update({
    where: { id },
    data: {
      employeeId: str(form, "employeeId"),
      type: str(form, "type") as "SALARY",
      amount: num(form, "amount"),
      date: dateVal(form, "date") || new Date(),
      period: optStr(form, "period"),
      status: str(form, "status") as "PENDING",
      notes: optStr(form, "notes"),
    },
  });
  await audit(user.id, "updated", "Payment", id);
  revalidatePath("/finance/payments");
}

export async function deletePayment(form: FormData) {
  const user = await requireSalaryAccess();
  const id = str(form, "id");
  await prisma.payment.delete({ where: { id } });
  await audit(user.id, "deleted", "Payment", id);
  revalidatePath("/finance/payments");
}

// ─── Settings / Users ──────────────────────────────────────

export async function createHrUser(form: FormData) {
  const user = await requireOwner();
  const { hashPassword } = await import("@/lib/auth");
  const passwordHash = await hashPassword(str(form, "password"));
  const u = await prisma.user.create({
    data: {
      email: str(form, "email").toLowerCase(),
      name: str(form, "name"),
      passwordHash,
      role: "HR",
      employeeId: optStr(form, "employeeId"),
    },
  });
  await audit(user.id, "created", "User", u.id, u.email);
  revalidatePath("/settings");
}

export async function assertFinanceOrThrow(userId?: string) {
  const user = await requireUser();
  if (!canAccessFinance(user)) {
    throw new Error("Απαγορεύεται");
  }
  return user;
}
