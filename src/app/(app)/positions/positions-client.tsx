"use client";

import { Input, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm, ConfirmDelete } from "@/components/ui/form-modal";
import { createPosition, updatePosition, deletePosition } from "@/lib/actions";

type Pos = { id: string; name: string; description: string | null };

export function PositionsClient({
  mode,
  position,
}: {
  mode: "create" | "edit";
  position?: Pos;
}) {
  if (mode === "create") {
    return (
      <FormModal title="Add Position" triggerLabel="+ Add Position">
        {(close) => (
          <ActionForm action={createPosition} onSuccess={close}>
            <Input name="name" label="Name" required />
            <Textarea name="description" label="Description" />
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <FormModal title="Edit Position" triggerLabel="Edit" triggerVariant="ghost" triggerSize="sm" icon="edit">
        {(close) => (
          <ActionForm action={updatePosition} onSuccess={close}>
            <input type="hidden" name="id" value={position!.id} />
            <Input name="name" label="Name" required defaultValue={position!.name} />
            <Textarea name="description" label="Description" defaultValue={position!.description || ""} />
          </ActionForm>
        )}
      </FormModal>
      <ConfirmDelete action={deletePosition} id={position!.id} />
    </div>
  );
}
