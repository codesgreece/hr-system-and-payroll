"use client";

import { Input, Select, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm, ConfirmDelete } from "@/components/ui/form-modal";
import {
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
} from "@/lib/actions";
import { EXPENSE_CATEGORIES, RECURRING_FREQUENCIES } from "@/lib/constants";
import { labelize } from "@/lib/utils";

type Item = {
  id: string;
  provider: string;
  amount: unknown;
  frequency: string;
  nextPaymentDate: Date | string;
  category: string;
  active: boolean;
  notes: string | null;
};

function toDate(d: Date | string) {
  return (typeof d === "string" ? new Date(d) : d).toISOString().slice(0, 10);
}

export function RecurringClient({
  mode,
  item,
}: {
  mode: "create" | "edit";
  item?: Item;
}) {
  const fields = (r?: Item) => (
    <>
      <Input name="provider" label="Πάροχος" required defaultValue={r?.provider} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          name="amount"
          label="Ποσό (€)"
          type="number"
          step="0.01"
          required
          defaultValue={r ? String(r.amount) : ""}
        />
        <Select
          name="frequency"
          label="Συχνότητα"
          defaultValue={r?.frequency || "MONTHLY"}
          options={RECURRING_FREQUENCIES.map((f) => ({ value: f, label: labelize(f) }))}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          name="nextPaymentDate"
          label="Επόμενη ημερομηνία πληρωμής"
          type="date"
          required
          defaultValue={r ? toDate(r.nextPaymentDate) : ""}
        />
        <Select
          name="category"
          label="Κατηγορία"
          defaultValue={r?.category || "SOFTWARE"}
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: labelize(c) }))}
        />
      </div>
      <Select
        name="active"
        label="Κατάσταση"
        defaultValue={r ? String(r.active) : "true"}
        options={[
          { value: "true", label: "Ενεργό" },
          { value: "false", label: "Ανενεργό" },
        ]}
      />
      <Textarea name="notes" label="Σημειώσεις" defaultValue={r?.notes || ""} />
    </>
  );

  if (mode === "create") {
    return (
      <FormModal title="Προσθήκη επαναλαμβανόμενου" triggerLabel="+ Προσθήκη">
        {(close) => (
          <ActionForm action={createRecurringExpense} onSuccess={close}>
            {fields()}
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <FormModal title="Επεξεργασία" triggerLabel="Επεξεργασία" triggerVariant="ghost" triggerSize="sm" icon="edit">
        {(close) => (
          <ActionForm action={updateRecurringExpense} onSuccess={close}>
            <input type="hidden" name="id" value={item!.id} />
            {fields(item)}
          </ActionForm>
        )}
      </FormModal>
      <ConfirmDelete action={deleteRecurringExpense} id={item!.id} />
    </div>
  );
}
