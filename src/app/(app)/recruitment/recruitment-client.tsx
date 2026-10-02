"use client";

import { useTransition } from "react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FormModal, ActionForm, ConfirmDelete, optionsFrom } from "@/components/ui/form-modal";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/modal";
import {
  createCandidate,
  updateCandidate,
  deleteCandidate,
  hireCandidate,
} from "@/lib/actions";
import { CANDIDATE_STATUSES } from "@/lib/constants";
import { labelize } from "@/lib/utils";

type Pos = { id: string; name: string };
type Cand = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  positionId: string | null;
  status: string;
  notes: string | null;
};

export function RecruitmentClient({
  mode,
  candidate,
  positions,
}: {
  mode: "create" | "edit";
  candidate?: Cand;
  positions: Pos[];
}) {
  const fields = (c?: Cand) => (
    <>
      <Input name="name" label="Όνομα" required defaultValue={c?.name} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="email" label="Email" type="email" required defaultValue={c?.email} />
        <Input name="phone" label="Τηλέφωνο" defaultValue={c?.phone || ""} />
      </div>
      <Select
        name="positionId"
        label="Θέση"
        placeholder="Επιλέξτε θέση"
        defaultValue={c?.positionId || ""}
        options={optionsFrom(positions)}
      />
      <Select
        name="status"
        label="Κατάσταση"
        defaultValue={c?.status || "NEW"}
        options={CANDIDATE_STATUSES.map((s) => ({ value: s, label: labelize(s) }))}
      />
      <Textarea name="notes" label="Σημειώσεις" defaultValue={c?.notes || ""} />
    </>
  );

  if (mode === "create") {
    return (
      <FormModal title="Προσθήκη υποψηφίου" triggerLabel="+ Προσθήκη υποψηφίου">
        {(close) => (
          <ActionForm action={createCandidate} onSuccess={close}>
            {fields()}
          </ActionForm>
        )}
      </FormModal>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {candidate!.status !== "HIRED" ? <HireButton id={candidate!.id} /> : null}
      <FormModal title="Επεξεργασία υποψηφίου" triggerLabel="Επεξεργασία" triggerVariant="ghost" triggerSize="sm" icon="edit">
        {(close) => (
          <ActionForm action={updateCandidate} onSuccess={close}>
            <input type="hidden" name="id" value={candidate!.id} />
            {fields(candidate)}
          </ActionForm>
        )}
      </FormModal>
      <ConfirmDelete action={deleteCandidate} id={candidate!.id} />
    </div>
  );
}

function HireButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Μετατροπή αυτού του υποψηφίου σε υπάλληλο;")) return;
        const fd = new FormData();
        fd.set("id", id);
        start(async () => {
          try {
            await hireCandidate(fd);
            toast("Ο υποψήφιος προσλήφθηκε");
          } catch (e) {
            if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
              toast("Ο υποψήφιος προσλήφθηκε");
              return;
            }
            toast("Αποτυχία πρόσληψης", "error");
          }
        });
      }}
    >
      Πρόσληψη
    </Button>
  );
}
