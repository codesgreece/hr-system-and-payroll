"use client";

import { Input, Select, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm, optionsFrom } from "@/components/ui/form-modal";
import { createEmployee, updateEmployee, archiveEmployee } from "@/lib/actions";
import { EMPLOYEE_STATUSES, EMPLOYMENT_TYPES } from "@/lib/constants";
import { labelize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "@/components/ui/modal";

type Ref = { id: string; name?: string; firstName?: string; lastName?: string };

type Emp = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  emergencyContact: string | null;
  positionId: string | null;
  departmentId: string | null;
  teamLeaderId: string | null;
  employmentType: string;
  startDate: Date | string;
  status: string;
  performanceNotes: string | null;
};

function toDateInput(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

function EmployeeFields({
  employee,
  positions,
  departments,
  leaders,
}: {
  employee?: Emp;
  positions: Ref[];
  departments: Ref[];
  leaders: Ref[];
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="firstName" label="Όνομα" required defaultValue={employee?.firstName} />
        <Input name="lastName" label="Επώνυμο" required defaultValue={employee?.lastName} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="email" label="Email" type="email" required defaultValue={employee?.email} />
        <Input name="phone" label="Τηλέφωνο" defaultValue={employee?.phone || ""} />
      </div>
      <Input name="address" label="Διεύθυνση" defaultValue={employee?.address || ""} />
      <Input
        name="emergencyContact"
        label="Επαφή έκτακτης ανάγκης"
        defaultValue={employee?.emergencyContact || ""}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="positionId"
          label="Θέση"
          placeholder="Επιλέξτε θέση"
          defaultValue={employee?.positionId || ""}
          options={optionsFrom(positions)}
        />
        <Select
          name="departmentId"
          label="Τμήμα"
          placeholder="Επιλέξτε τμήμα"
          defaultValue={employee?.departmentId || ""}
          options={optionsFrom(departments)}
        />
      </div>
      <Select
        name="teamLeaderId"
        label="Υπεύθυνος ομάδας"
        placeholder="Επιλέξτε υπεύθυνο"
        defaultValue={employee?.teamLeaderId || ""}
        options={optionsFrom(leaders)}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          name="employmentType"
          label="Τύπος απασχόλησης"
          defaultValue={employee?.employmentType || "FULL_TIME"}
          options={EMPLOYMENT_TYPES.map((t) => ({ value: t, label: labelize(t) }))}
        />
        <Input
          name="startDate"
          label="Ημερομηνία έναρξης"
          type="date"
          defaultValue={employee ? toDateInput(employee.startDate) : ""}
        />
        <Select
          name="status"
          label="Κατάσταση"
          defaultValue={employee?.status || "ACTIVE"}
          options={EMPLOYEE_STATUSES.map((t) => ({ value: t, label: labelize(t) }))}
        />
      </div>
      <Textarea
        name="performanceNotes"
        label="Σημειώσεις απόδοσης"
        defaultValue={employee?.performanceNotes || ""}
      />
    </>
  );
}

export function EmployeesClient({
  mode,
  employee,
  positions,
  departments,
  leaders,
}: {
  mode: "create" | "edit";
  employee?: Emp;
  positions: Ref[];
  departments: Ref[];
  leaders: Ref[];
}) {
  if (mode === "create") {
    return (
      <FormModal title="Προσθήκη υπαλλήλου" triggerLabel="+ Προσθήκη υπαλλήλου" wide>
        {(close) => (
          <ActionForm action={createEmployee} onSuccess={close} successMessage="Ο υπάλληλος δημιουργήθηκε">
            <EmployeeFields
              positions={positions}
              departments={departments}
              leaders={leaders}
            />
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <FormModal title="Επεξεργασία υπαλλήλου" triggerLabel="Επεξεργασία" triggerVariant="ghost" triggerSize="sm" icon="edit" wide>
      {(close) => (
        <ActionForm action={updateEmployee} onSuccess={close} successMessage="Ο υπάλληλος ενημερώθηκε">
          <input type="hidden" name="id" value={employee!.id} />
          <EmployeeFields
            employee={employee}
            positions={positions}
            departments={departments}
            leaders={leaders}
          />
        </ActionForm>
      )}
    </FormModal>
  );
}

export function ArchiveButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Αρχειοθέτηση αυτού του υπαλλήλου;")) return;
        const fd = new FormData();
        fd.set("id", id);
        start(async () => {
          await archiveEmployee(fd);
          toast("Ο υπάλληλος αρχειοθετήθηκε");
        });
      }}
    >
      Αρχειοθέτηση
    </Button>
  );
}
