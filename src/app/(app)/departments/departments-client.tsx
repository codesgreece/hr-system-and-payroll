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
      <FormModal title="Add Department" triggerLabel="+ Add Department">
        {(close) => (
          <ActionForm action={createDepartment} onSuccess={close}>
            <Input name="name" label="Name" required />
            <Textarea name="description" label="Description" />
            <Select
              name="leadId"
              label="Department Lead"
              placeholder="Select lead"
              options={optionsFrom(employees)}
            />
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <FormModal title="Edit Department" triggerLabel="Edit" triggerVariant="ghost" triggerSize="sm" icon="edit">
        {(close) => (
          <ActionForm action={updateDepartment} onSuccess={close}>
            <input type="hidden" name="id" value={department!.id} />
            <Input name="name" label="Name" required defaultValue={department!.name} />
            <Textarea name="description" label="Description" defaultValue={department!.description || ""} />
            <Select
              name="leadId"
              label="Department Lead"
              placeholder="Select lead"
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
