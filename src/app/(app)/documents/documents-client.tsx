"use client";

import { Input, Select, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm, ConfirmDelete, optionsFrom } from "@/components/ui/form-modal";
import { createDocument, deleteDocument } from "@/lib/actions";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { labelize } from "@/lib/utils";

type Emp = { id: string; firstName: string; lastName: string };

export function DocumentsClient({
  employees,
  deleteId,
}: {
  employees: Emp[];
  deleteId?: string;
}) {
  if (deleteId) {
    return <ConfirmDelete action={deleteDocument} id={deleteId} />;
  }

  return (
    <FormModal title="Ανέβασμα εγγράφου" triggerLabel="+ Ανέβασμα">
      {(close) => (
        <ActionForm action={createDocument} onSuccess={close} successMessage="Το έγγραφο ανέβηκε">
          <Select
            name="employeeId"
            label="Υπάλληλος"
            required
            options={optionsFrom(employees)}
          />
          <Input name="name" label="Όνομα εγγράφου" required />
          <Select
            name="category"
            label="Κατηγορία"
            defaultValue="CONTRACT"
            options={DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: labelize(c) }))}
          />
          <Input name="file" label="Αρχείο" type="file" />
          <Input name="expirationDate" label="Ημερομηνία λήξης" type="date" />
          <Textarea name="notes" label="Σημειώσεις" />
        </ActionForm>
      )}
    </FormModal>
  );
}
