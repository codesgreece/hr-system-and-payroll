"use client";

import { Input, Select } from "@/components/ui/input";
import { FormModal, ActionForm, optionsFrom } from "@/components/ui/form-modal";
import { createHrUser } from "@/lib/actions";

type Emp = { id: string; firstName: string; lastName: string };

export function SettingsClient({ employees }: { employees: Emp[] }) {
  return (
    <FormModal title="Προσθήκη χρήστη HR" triggerLabel="+ Προσθήκη χρήστη HR">
      {(close) => (
        <ActionForm action={createHrUser} onSuccess={close} successMessage="Ο χρήστης HR δημιουργήθηκε">
          <Input name="name" label="Όνομα" required />
          <Input name="email" label="Email" type="email" required />
          <Input name="password" label="Κωδικός" type="password" required minLength={8} />
          <Select
            name="employeeId"
            label="Συνδεδεμένος υπάλληλος (για Οι εργασίες μου)"
            placeholder="Προαιρετικό"
            options={optionsFrom(employees)}
          />
        </ActionForm>
      )}
    </FormModal>
  );
}
