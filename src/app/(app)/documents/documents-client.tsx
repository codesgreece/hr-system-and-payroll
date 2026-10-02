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
    <FormModal title="Upload Document" triggerLabel="+ Upload">
      {(close) => (
        <ActionForm action={createDocument} onSuccess={close} successMessage="Document uploaded">
          <Select
            name="employeeId"
            label="Employee"
            required
            options={optionsFrom(employees)}
          />
          <Input name="name" label="Document Name" required />
          <Select
            name="category"
            label="Category"
            defaultValue="CONTRACT"
            options={DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: labelize(c) }))}
          />
          <Input name="file" label="File" type="file" />
          <Input name="expirationDate" label="Expiration Date" type="date" />
          <Textarea name="notes" label="Notes" />
        </ActionForm>
      )}
    </FormModal>
  );
}
