"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Modal, toast } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function FormModal({
  title,
  triggerLabel,
  triggerVariant = "primary",
  triggerSize = "md",
  icon,
  children,
  wide,
}: {
  title: string;
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  triggerSize?: "sm" | "md" | "lg";
  icon?: "plus" | "edit";
  children: (close: () => void) => React.ReactNode;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => setOpen(true)}
      >
        {icon === "plus" || (!icon && triggerLabel?.startsWith("+")) ? (
          <Plus className="h-4 w-4" />
        ) : null}
        {icon === "edit" ? <Pencil className="h-3.5 w-3.5" /> : null}
        {triggerLabel}
      </Button>
      <Modal open={open} onClose={close} title={title} wide={wide}>
        {children(close)}
      </Modal>
    </>
  );
}

export function ActionForm({
  action,
  onSuccess,
  children,
  successMessage = "Saved",
  className,
}: {
  action: (form: FormData) => Promise<void>;
  onSuccess?: () => void;
  children: React.ReactNode;
  successMessage?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      action={(formData) => {
        startTransition(async () => {
          try {
            await action(formData);
            toast(successMessage);
            onSuccess?.();
          } catch (e) {
            // Next.js redirect() throws; rethrow so navigation works
            if (
              e &&
              typeof e === "object" &&
              "digest" in e &&
              String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
            ) {
              onSuccess?.();
              throw e;
            }
            const msg = e instanceof Error ? e.message : "Something went wrong";
            toast(msg, "error");
          }
        });
      }}
    >
      <fieldset disabled={pending} className="space-y-4">
        {children}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

export function ConfirmDelete({
  action,
  id,
  label = "Delete",
}: {
  action: (form: FormData) => Promise<void>;
  id: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        if (!confirm("Are you sure?")) return;
        startTransition(async () => {
          try {
            await action(fd);
            toast("Deleted");
          } catch {
            toast("Failed to delete", "error");
          }
        });
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending} aria-label={label}>
        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
      </Button>
    </form>
  );
}

export function optionsFrom(
  items: { id: string; name?: string; label?: string; firstName?: string; lastName?: string }[]
) {
  return items.map((i) => ({
    value: i.id,
    label:
      i.label ||
      i.name ||
      (i.firstName && i.lastName ? `${i.firstName} ${i.lastName}` : i.id),
  }));
}
