"use client";

import { Input, Select, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm, ConfirmDelete, optionsFrom } from "@/components/ui/form-modal";
import { createExpense, updateExpense, deleteExpense } from "@/lib/actions";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import { labelize } from "@/lib/utils";

type Project = { id: string; name: string };
type Expense = {
  id: string;
  provider: string;
  description: string | null;
  category: string;
  amount: unknown;
  date: Date | string;
  paymentMethod: string | null;
  recurring: boolean;
  projectId: string | null;
  notes: string | null;
};

function toDate(d: Date | string) {
  return (typeof d === "string" ? new Date(d) : d).toISOString().slice(0, 10);
}

export function ExpensesClient({
  mode,
  expense,
  projects,
}: {
  mode: "create" | "edit";
  expense?: Expense;
  projects: Project[];
}) {
  const fields = (e?: Expense) => (
    <>
      <Input name="provider" label="Πάροχος" required defaultValue={e?.provider} />
      <Input name="description" label="Περιγραφή" defaultValue={e?.description || ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="category"
          label="Κατηγορία"
          defaultValue={e?.category || "SOFTWARE"}
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: labelize(c) }))}
        />
        <Input
          name="amount"
          label="Ποσό (€)"
          type="number"
          step="0.01"
          required
          defaultValue={e ? String(e.amount) : ""}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="date" label="Ημερομηνία" type="date" required defaultValue={e ? toDate(e.date) : ""} />
        <Select
          name="paymentMethod"
          label="Τρόπος πληρωμής"
          placeholder="Επιλογή"
          defaultValue={e?.paymentMethod || ""}
          options={PAYMENT_METHODS.map((m) => ({ value: m, label: labelize(m) }))}
        />
      </div>
      <Select
        name="projectId"
        label="Έργο (προαιρετικό)"
        placeholder="Χωρίς έργο"
        defaultValue={e?.projectId || ""}
        options={optionsFrom(projects)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="recurring"
          defaultChecked={e?.recurring}
          className="accent-[var(--accent)]"
        />
        Επαναλαμβανόμενο έξοδο
      </label>
      <Textarea name="notes" label="Σημειώσεις" defaultValue={e?.notes || ""} />
    </>
  );

  if (mode === "create") {
    return (
      <FormModal title="Προσθήκη εξόδου" triggerLabel="+ Προσθήκη εξόδου" wide>
        {(close) => (
          <ActionForm action={createExpense} onSuccess={close} successMessage="Το έξοδο καταχωρήθηκε">
            {fields()}
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <FormModal title="Επεξεργασία εξόδου" triggerLabel="Επεξεργασία" triggerVariant="ghost" triggerSize="sm" icon="edit" wide>
        {(close) => (
          <ActionForm action={updateExpense} onSuccess={close}>
            <input type="hidden" name="id" value={expense!.id} />
            {fields(expense)}
          </ActionForm>
        )}
      </FormModal>
      <ConfirmDelete action={deleteExpense} id={expense!.id} />
    </div>
  );
}
