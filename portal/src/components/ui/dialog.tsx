"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    }

    if (!open && dialog.open) {
      dialog.close();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const widths = {
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  } as const;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={`m-auto max-h-[92dvh] w-[calc(100vw-2rem)] ${widths[size]} overflow-y-auto rounded-3xl border-0 bg-paper p-0 text-ink shadow-soft backdrop:bg-deep/65 backdrop:backdrop-blur-sm`}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink/10 bg-paper/95 px-5 py-4 backdrop-blur sm:px-7">
        <div>
          <h2 id={titleId} className="text-xl text-ink">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="mt-1 text-xs leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-muted transition hover:bg-ink/5 hover:text-ink"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="px-5 py-6 sm:px-7">{children}</div>
    </dialog>
  );
}
