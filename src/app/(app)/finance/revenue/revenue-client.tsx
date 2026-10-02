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
      <Input name="client" label="Client" required defaultValue={r?.client} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="projectId"
          label="Project"
          placeholder="Optional project"
          defaultValue={r?.projectId || ""}
          options={optionsFrom(projects)}
        />
        <Input
          name="projectLabel"
          label="Project / Website label"
          defaultValue={r?.projectLabel || ""}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="category"
          label="Category"
          defaultValue={r?.category || "WEBSITE"}
          options={REVENUE_CATEGORIES.map((c) => ({ value: c, label: labelize(c) }))}
        />
        <Input
          name="amount"
          label="Amount (€)"
          type="number"
          step="0.01"
          required
          defaultValue={r ? String(r.amount) : ""}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input name="date" label="Date" type="date" required defaultValue={r ? toDate(r.date) : ""} />
        <Select
          name="paymentStatus"
          label="Payment Status"
          defaultValue={r?.paymentStatus || "PENDING"}
          options={PAYMENT_STATUSES.map((s) => ({ value: s, label: labelize(s) }))}
        />
        <Select
          name="paymentMethod"
          label="Payment Method"
          placeholder="Select"
          defaultValue={r?.paymentMethod || ""}
          options={PAYMENT_METHODS.map((m) => ({ value: m, label: labelize(m) }))}
        />
      </div>
      <Textarea name="notes" label="Notes" defaultValue={r?.notes || ""} />
    </>
  );

  if (mode === "create") {
    return (
      <FormModal title="Add Revenue" triggerLabel="+ Add Revenue" wide>
        {(close) => (
          <ActionForm action={createRevenue} onSuccess={close} successMessage="Revenue recorded">
            {fields()}
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <FormModal title="Edit Revenue" triggerLabel="Edit" triggerVariant="ghost" triggerSize="sm" icon="edit" wide>
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
