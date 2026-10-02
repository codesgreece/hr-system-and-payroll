"use client";

import { Input, Select, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm, optionsFrom } from "@/components/ui/form-modal";
import { createProject, updateProject } from "@/lib/actions";
import { PROJECT_STATUSES } from "@/lib/constants";
import { labelize } from "@/lib/utils";

type Emp = { id: string; firstName: string; lastName: string };
type Project = {
  id: string;
  name: string;
  client: string | null;
  description: string | null;
  status: string;
  startDate: Date | string | null;
  deadline: Date | string | null;
  teamLeaderId: string | null;
  memberIds?: string[];
};

function toDate(d: Date | string | null | undefined) {
  if (!d) return "";
  return (typeof d === "string" ? new Date(d) : d).toISOString().slice(0, 10);
}

export function ProjectsClient({
  mode,
  project,
  employees,
}: {
  mode: "create" | "edit";
  project?: Project;
  employees: Emp[];
}) {
  const fields = (p?: Project) => (
    <>
      <Input name="name" label="Όνομα έργου" required defaultValue={p?.name} />
      <Input name="client" label="Πελάτης" defaultValue={p?.client || ""} />
      <Textarea name="description" label="Περιγραφή" defaultValue={p?.description || ""} />
      <Select
        name="status"
        label="Κατάσταση"
        defaultValue={p?.status || "PLANNING"}
        options={PROJECT_STATUSES.map((s) => ({ value: s, label: labelize(s) }))}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="startDate" label="Ημερομηνία έναρξης" type="date" defaultValue={toDate(p?.startDate)} />
        <Input name="deadline" label="Προθεσμία" type="date" defaultValue={toDate(p?.deadline)} />
      </div>
      <Select
        name="teamLeaderId"
        label="Υπεύθυνος ομάδας"
        placeholder="Επιλέξτε υπεύθυνο"
        defaultValue={p?.teamLeaderId || ""}
        options={optionsFrom(employees)}
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-[var(--muted-fg)]">Μέλη</label>
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)] p-2">
          {employees.map((e) => (
            <label key={e.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-[var(--muted)]">
              <input
                type="checkbox"
                name="memberIds"
                value={e.id}
                defaultChecked={p?.memberIds?.includes(e.id)}
                className="accent-[var(--accent)]"
              />
              {e.firstName} {e.lastName}
            </label>
          ))}
        </div>
      </div>
    </>
  );

  if (mode === "create") {
    return (
      <FormModal title="Νέο έργο" triggerLabel="+ Προσθήκη έργου" wide>
        {(close) => (
          <ActionForm action={createProject} onSuccess={close} successMessage="Το έργο δημιουργήθηκε">
            {fields()}
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <FormModal title="Επεξεργασία έργου" triggerLabel="Επεξεργασία" triggerVariant="outline" triggerSize="sm" icon="edit" wide>
      {(close) => (
        <ActionForm action={updateProject} onSuccess={close}>
          <input type="hidden" name="id" value={project!.id} />
          {fields(project)}
        </ActionForm>
      )}
    </FormModal>
  );
}
