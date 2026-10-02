"use client";

import { Input, Select } from "@/components/ui/input";
import { FormModal, ActionForm, ConfirmDelete, optionsFrom } from "@/components/ui/form-modal";
import { createTask, updateTask, deleteTask } from "@/lib/actions";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { labelize } from "@/lib/utils";

type Ref = { id: string; name?: string; firstName?: string; lastName?: string };
type Task = {
  id: string;
  title: string;
  projectId: string | null;
  assigneeId: string | null;
  priority: string;
  status: string;
  dueDate: Date | string | null;
};

function toDate(d: Date | string | null) {
  if (!d) return "";
  return (typeof d === "string" ? new Date(d) : d).toISOString().slice(0, 10);
}

export function TasksClient({
  mode,
  task,
  projects,
  employees,
}: {
  mode: "create" | "edit";
  task?: Task;
  projects: Ref[];
  employees: Ref[];
}) {
  const fields = (t?: Task) => (
    <>
      <Input name="title" label="Τίτλος" required defaultValue={t?.title} />
      <Select
        name="projectId"
        label="Έργο"
        placeholder="Χωρίς έργο"
        defaultValue={t?.projectId || ""}
        options={optionsFrom(projects)}
      />
      <Select
        name="assigneeId"
        label="Υπεύθυνος υπάλληλος"
        placeholder="Μη ανατεθειμένο"
        defaultValue={t?.assigneeId || ""}
        options={optionsFrom(employees)}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          name="priority"
          label="Προτεραιότητα"
          defaultValue={t?.priority || "MEDIUM"}
          options={TASK_PRIORITIES.map((p) => ({ value: p, label: labelize(p) }))}
        />
        <Select
          name="status"
          label="Κατάσταση"
          defaultValue={t?.status || "TODO"}
          options={TASK_STATUSES.map((s) => ({ value: s, label: labelize(s) }))}
        />
        <Input name="dueDate" label="Προθεσμία" type="date" defaultValue={toDate(t?.dueDate || null)} />
      </div>
    </>
  );

  if (mode === "create") {
    return (
      <FormModal title="Νέα εργασία" triggerLabel="+ Προσθήκη εργασίας">
        {(close) => (
          <ActionForm action={createTask} onSuccess={close}>
            {fields()}
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <FormModal title="Επεξεργασία εργασίας" triggerLabel="Επεξεργασία" triggerVariant="ghost" triggerSize="sm" icon="edit">
        {(close) => (
          <ActionForm action={updateTask} onSuccess={close}>
            <input type="hidden" name="id" value={task!.id} />
            {fields(task)}
          </ActionForm>
        )}
      </FormModal>
      <ConfirmDelete action={deleteTask} id={task!.id} />
    </div>
  );
}
