"use client";

import { useActionState, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";

import { submitContact } from "../lib/actions";
import { HONEYPOT_FIELD, readContactForm, validateContact, type ContactField } from "../lib/schema";

import { FormField } from "./FormField";

type FieldErrors = Partial<Record<ContactField, string>>;

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(submitContact, null);
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);

  if (state?.status === "success") {
    return (
      <div role="status" className="rounded-lg border border-ink/15 bg-bg-top/60 p-8">
        <p className="font-display text-xs font-medium tracking-label text-ink-soft uppercase">Message sent</p>
        <p className="mt-4 text-xl font-light text-ink">{state.message}</p>
      </div>
    );
  }

  const serverError = state?.status === "error" ? state : null;
  const errors: FieldErrors = clientErrors ?? serverError?.fieldErrors ?? {};
  const values = serverError?.values ?? {};
  const hasErrors = Object.keys(errors).length > 0;

  // Same schema as the server: instant feedback, the action stays the authority.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const result = validateContact(readContactForm(new FormData(event.currentTarget)));
    if (result.success) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    setClientErrors(result.fieldErrors);
    const firstInvalid = (["name", "email", "company", "message"] as const).find((field) => result.fieldErrors[field]);
    if (firstInvalid) formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      className="space-y-8"
      aria-label="Contact form"
    >
      <div role="alert" className="min-h-0 text-sm text-red-800">
        {hasErrors && (serverError?.message ?? "Please fix the highlighted fields and try again.")}
      </div>

      <FormField
        id="contact-name"
        label="Name"
        error={errors.name}
        inputProps={{ name: "name", type: "text", autoComplete: "name", required: true, defaultValue: values.name }}
      />
      <FormField
        id="contact-email"
        label="Email"
        error={errors.email}
        inputProps={{ name: "email", type: "email", autoComplete: "email", required: true, defaultValue: values.email }}
      />
      <FormField
        id="contact-company"
        label="Company"
        optional
        error={errors.company}
        inputProps={{ name: "company", type: "text", autoComplete: "organization", defaultValue: values.company }}
      />
      <FormField
        id="contact-message"
        label="Tell us about your project"
        multiline
        error={errors.message}
        textareaProps={{ name: "message", required: true, defaultValue: values.message }}
      />

      {/* Honeypot: off-screen, unreachable by keyboard and hidden from assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" arrow disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
