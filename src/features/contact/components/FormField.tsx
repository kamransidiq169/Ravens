import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  multiline?: boolean;
  inputProps?: Omit<ComponentPropsWithoutRef<"input">, "id">;
  textareaProps?: Omit<ComponentPropsWithoutRef<"textarea">, "id">;
}

export function FormField({ id, label, error, optional, multiline, inputProps, textareaProps }: FormFieldProps) {
  const errorId = `${id}-error`;
  const shared = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: cn(
      "w-full border-0 border-b bg-transparent py-3 text-lg text-ink placeholder:text-ink-soft/60 focus-visible:outline-offset-4",
      error ? "border-red-800" : "border-ink/30 focus:border-ink",
    ),
  } as const;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block font-display text-xs font-medium tracking-label text-ink-soft uppercase"
      >
        {label}
        {optional && <span className="ml-2 tracking-normal normal-case">(optional)</span>}
      </label>
      {multiline ? <textarea rows={5} {...shared} {...textareaProps} /> : <input {...shared} {...inputProps} />}
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
