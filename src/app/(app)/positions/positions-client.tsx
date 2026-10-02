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
      <FormModal title="Προσθήκη θέσης" triggerLabel="+ Προσθήκη θέσης">
        {(close) => (
          <ActionForm action={createPosition} onSuccess={close}>
            <Input name="name" label="Όνομα" required />
            <Textarea name="description" label="Περιγραφή" />
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <FormModal title="Επεξεργασία θέσης" triggerLabel="Επεξεργασία" triggerVariant="ghost" triggerSize="sm" icon="edit">
        {(close) => (
          <ActionForm action={updatePosition} onSuccess={close}>
            <input type="hidden" name="id" value={position!.id} />
            <Input name="name" label="Όνομα" required defaultValue={position!.name} />
            <Textarea name="description" label="Περιγραφή" defaultValue={position!.description || ""} />
          </ActionForm>
        )}
      </FormModal>
      <ConfirmDelete action={deletePosition} id={position!.id} />
    </div>
  );
}
