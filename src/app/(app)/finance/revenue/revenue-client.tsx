"use client";

import { Input, Select, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm, ConfirmDelete, optionsFrom } from "@/components/ui/form-modal";
import { createRevenue, updateRevenue, deleteRevenue } from "@/lib/actions";
import { PAYMENT_METHODS, PAYMENT_STATUSES, REVENUE_CATEGORIES } from "@/lib/constants";
import { labelize } from "@/lib/utils";

type Project = { id: string; name: string; client: string | null };
type Revenue = {
  id: string;
  client: string;
  projectId: string | null;
  projectLabel: string | null;
  category: string;
  amount: unknown;
  date: Date | string;
  paymentStatus: string;
  paymentMethod: string | null;
  notes: string | null;
};

function toDate(d: Date | string) {
  return (typeof d === "string" ? new Date(d) : d).toISOString().slice(0, 10);
}

export function RevenueClient({
  mode,
  revenue,
  projects,
}: {
  mode: "create" | "edit";
  revenue?: Revenue;
  projects: Project[];
}) {
  const fields = (r?: Revenue) => (
    <>
      <Input name="client" label="Πελάτης" required defaultValue={r?.client} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="projectId"
          label="Έργο"
          placeholder="Προαιρετικό έργο"
          defaultValue={r?.projectId || ""}
          options={optionsFrom(projects)}
        />
        <Input
          name="projectLabel"
          label="Ετικέτα έργου / ιστοσελίδας"
          defaultValue={r?.projectLabel || ""}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="category"
          label="Κατηγορία"
          defaultValue={r?.category || "WEBSITE"}
          options={REVENUE_CATEGORIES.map((c) => ({ value: c, label: labelize(c) }))}
        />
        <Input
          name="amount"
          label="Ποσό (€)"
          type="number"
          step="0.01"
          required
          defaultValue={r ? String(r.amount) : ""}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input name="date" label="Ημερομηνία" type="date" required defaultValue={r ? toDate(r.date) : ""} />
        <Select
          name="paymentStatus"
          label="Κατάσταση πληρωμής"
          defaultValue={r?.paymentStatus || "PENDING"}
          options={PAYMENT_STATUSES.map((s) => ({ value: s, label: labelize(s) }))}
        />
        <Select
          name="paymentMethod"
          label="Τρόπος πληρωμής"
          placeholder="Επιλογή"
          defaultValue={r?.paymentMethod || ""}
          options={PAYMENT_METHODS.map((m) => ({ value: m, label: labelize(m) }))}
        />
      </div>
      <Textarea name="notes" label="Σημειώσεις" defaultValue={r?.notes || ""} />
    </>
  );

  if (mode === "create") {
    return (
      <FormModal title="Προσθήκη εσόδου" triggerLabel="+ Προσθήκη εσόδου" wide>
        {(close) => (
          <ActionForm action={createRevenue} onSuccess={close} successMessage="Το έσοδο καταχωρήθηκε">
            {fields()}
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <FormModal title="Επεξεργασία εσόδου" triggerLabel="Επεξεργασία" triggerVariant="ghost" triggerSize="sm" icon="edit" wide>
        {(close) => (
          <ActionForm action={updateRevenue} onSuccess={close}>
            <input type="hidden" name="id" value={revenue!.id} />
            {fields(revenue)}
          </ActionForm>
        )}
      </FormModal>
      <ConfirmDelete action={deleteRevenue} id={revenue!.id} />
    </div>
  );
}
