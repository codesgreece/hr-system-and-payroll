"use client";

import { Input, Select, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm, ConfirmDelete, optionsFrom } from "@/components/ui/form-modal";
import { createLeave, updateLeave, deleteLeave } from "@/lib/actions";
import { LEAVE_TYPES, LEAVE_STATUSES } from "@/lib/constants";
import { labelize } from "@/lib/utils";

type Emp = { id: string; firstName: string; lastName: string };
type Leave = {
  id: string;
  employeeId: string;
  type: string;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  notes: string | null;
};

function toDate(d: Date | string) {
  return (typeof d === "string" ? new Date(d) : d).toISOString().slice(0, 10);
}

export function LeaveClient({
  mode,
  leave,
  employees,
}: {
  mode: "create" | "edit";
  leave?: Leave;
  employees: Emp[];
}) {
  const fields = (l?: Leave) => (
    <>
      <Select
        name="employeeId"
        label="Υπάλληλος"
        required
        defaultValue={l?.employeeId}
        options={optionsFrom(employees)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="type"
          label="Τύπος"
          defaultValue={l?.type || "ANNUAL"}
          options={LEAVE_TYPES.map((t) => ({ value: t, label: labelize(t) }))}
        />
        <Select
          name="status"
          label="Κατάσταση"
          defaultValue={l?.status || "PLANNED"}
          options={LEAVE_STATUSES.map((t) => ({ value: t, label: labelize(t) }))}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="startDate" label="Ημερομηνία έναρξης" type="date" required defaultValue={l ? toDate(l.startDate) : ""} />
        <Input name="endDate" label="Ημερομηνία λήξης" type="date" required defaultValue={l ? toDate(l.endDate) : ""} />
      </div>
      <Textarea name="notes" label="Σημειώσεις" defaultValue={l?.notes || ""} />
    </>
  );

  if (mode === "create") {
    return (
      <FormModal title="Καταχώρηση άδειας" triggerLabel="+ Προσθήκη άδειας">
        {(close) => (
          <ActionForm action={createLeave} onSuccess={close} successMessage="Η άδεια καταχωρήθηκε">
            {fields()}
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <FormModal title="Επεξεργασία άδειας" triggerLabel="Επεξεργασία" triggerVariant="ghost" triggerSize="sm" icon="edit">
        {(close) => (
          <ActionForm action={updateLeave} onSuccess={close}>
            <input type="hidden" name="id" value={leave!.id} />
            {fields(leave)}
          </ActionForm>
        )}
      </FormModal>
      <ConfirmDelete action={deleteLeave} id={leave!.id} />
    </div>
  );
}
