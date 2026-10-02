"use client";

import { Input, Select, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm, ConfirmDelete, optionsFrom } from "@/components/ui/form-modal";
import { createDepartment, updateDepartment, deleteDepartment } from "@/lib/actions";

type Emp = { id: string; firstName: string; lastName: string };
type Dept = {
  id: string;
  name: string;
  description: string | null;
  leadId: string | null;
};

export function DepartmentsClient({
  mode,
  department,
  employees,
}: {
  mode: "create" | "edit";
  department?: Dept;
  employees: Emp[];
}) {
  if (mode === "create") {
    return (
      <FormModal title="Προσθήκη τμήματος" triggerLabel="+ Προσθήκη τμήματος">
        {(close) => (
          <ActionForm action={createDepartment} onSuccess={close}>
            <Input name="name" label="Όνομα" required />
            <Textarea name="description" label="Περιγραφή" />
            <Select
              name="leadId"
              label="Υπεύθυνος τμήματος"
              placeholder="Επιλέξτε υπεύθυνο"
              options={optionsFrom(employees)}
            />
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <FormModal title="Επεξεργασία τμήματος" triggerLabel="Επεξεργασία" triggerVariant="ghost" triggerSize="sm" icon="edit">
        {(close) => (
          <ActionForm action={updateDepartment} onSuccess={close}>
            <input type="hidden" name="id" value={department!.id} />
            <Input name="name" label="Όνομα" required defaultValue={department!.name} />
            <Textarea name="description" label="Περιγραφή" defaultValue={department!.description || ""} />
            <Select
              name="leadId"
              label="Υπεύθυνος τμήματος"
              placeholder="Επιλέξτε υπεύθυνο"
              defaultValue={department!.leadId || ""}
              options={optionsFrom(employees)}
            />
          </ActionForm>
        )}
      </FormModal>
      <ConfirmDelete action={deleteDepartment} id={department!.id} />
    </div>
  );
}
