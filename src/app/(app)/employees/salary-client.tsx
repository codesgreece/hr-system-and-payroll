"use client";

import { Input, Select, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm } from "@/components/ui/form-modal";
import { createSalary } from "@/lib/actions";
import { SALARY_FREQUENCIES } from "@/lib/constants";
import { labelize } from "@/lib/utils";

export function SalaryClient({ employeeId }: { employeeId: string }) {
  return (
    <FormModal title="Add Salary Record" triggerLabel="+ Salary" triggerSize="sm">
      {(close) => (
        <ActionForm action={createSalary} onSuccess={close} successMessage="Salary recorded">
          <input type="hidden" name="employeeId" value={employeeId} />
          <Input name="amount" label="Amount (€)" type="number" step="0.01" required />
          <Select
            name="frequency"
            label="Frequency"
            defaultValue="MONTHLY"
            options={SALARY_FREQUENCIES.map((f) => ({ value: f, label: labelize(f) }))}
          />
          <Input name="effectiveDate" label="Effective Date" type="date" required />
          <Textarea name="notes" label="Notes" />
        </ActionForm>
      )}
    </FormModal>
  );
}
