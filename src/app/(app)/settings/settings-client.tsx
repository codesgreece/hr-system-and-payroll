"use client";

import { Input, Select } from "@/components/ui/input";
import { FormModal, ActionForm, optionsFrom } from "@/components/ui/form-modal";
import { createHrUser } from "@/lib/actions";

type Emp = { id: string; firstName: string; lastName: string };

export function SettingsClient({ employees }: { employees: Emp[] }) {
  return (
    <FormModal title="Add HR User" triggerLabel="+ Add HR User">
      {(close) => (
        <ActionForm action={createHrUser} onSuccess={close} successMessage="HR user created">
          <Input name="name" label="Name" required />
          <Input name="email" label="Email" type="email" required />
          <Input name="password" label="Password" type="password" required minLength={8} />
          <Select
            name="employeeId"
            label="Linked employee (for My Tasks)"
            placeholder="Optional"
            options={optionsFrom(employees)}
          />
        </ActionForm>
      )}
    </FormModal>
  );
}
