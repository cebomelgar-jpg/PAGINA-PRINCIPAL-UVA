"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function SubmitButton({
  children,
  pendingText,
  className = "btn-primary",
  disabled = false,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending || disabled}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingText ?? "Guardando…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
