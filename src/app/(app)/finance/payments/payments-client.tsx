"use client";

import { Input, Select, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm, ConfirmDelete, optionsFrom } from "@/components/ui/form-modal";
import { createPayment, updatePayment, deletePayment } from "@/lib/actions";
import { PAYROLL_STATUSES, PAYROLL_TYPES } from "@/lib/constants";
import { labelize } from "@/lib/utils";

type Emp = { id: string; firstName: string; lastName: string };
type Payment = {
  id: string;
  employeeId: string;
  type: string;
  amount: unknown;
  date: Date | string;
  period: string | null;
  status: string;
  notes: string | null;
};

function toDate(d: Date | string) {
  return (typeof d === "string" ? new Date(d) : d).toISOString().slice(0, 10);
}

export function PaymentsClient({
  mode,
  payment,
  employees,
}: {
  mode: "create" | "edit";
  payment?: Payment;
  employees: Emp[];
}) {
  const fields = (p?: Payment) => (
    <>
      <Select
        name="employeeId"
        label="Employee"
        required
        defaultValue={p?.employeeId}
        options={optionsFrom(employees)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="type"
          label="Type"
          defaultValue={p?.type || "SALARY"}
          options={PAYROLL_TYPES.map((t) => ({ value: t, label: labelize(t) }))}
        />
        <Input
          name="amount"
          label="Amount (€)"
          type="number"
          step="0.01"
          required
          defaultValue={p ? String(p.amount) : ""}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input name="date" label="Date" type="date" required defaultValue={p ? toDate(p.date) : ""} />
        <Input name="period" label="Period" defaultValue={p?.period || ""} placeholder="e.g. Oct 2026" />
        <Select
          name="status"
          label="Status"
          defaultValue={p?.status || "PENDING"}
          options={PAYROLL_STATUSES.map((s) => ({ value: s, label: labelize(s) }))}
        />
      </div>
      <Textarea name="notes" label="Notes" defaultValue={p?.notes || ""} />
    </>
  );

  if (mode === "create") {
    return (
      <FormModal title="Add Payment" triggerLabel="+ Add Payment">
        {(close) => (
          <ActionForm action={createPayment} onSuccess={close}>
            {fields()}
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <FormModal title="Edit Payment" triggerLabel="Edit" triggerVariant="ghost" triggerSize="sm" icon="edit">
        {(close) => (
          <ActionForm action={updatePayment} onSuccess={close}>
            <input type="hidden" name="id" value={payment!.id} />
            {fields(payment)}
          </ActionForm>
        )}
      </FormModal>
      <ConfirmDelete action={deletePayment} id={payment!.id} />
    </div>
  );
}
