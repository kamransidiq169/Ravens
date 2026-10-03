import { z } from "zod";

/** Shared by the client form (instant feedback) and the Server Action (the real gate). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name."),
  email: z.email("Enter a valid email address."),
  company: z.string().trim().max(120, "Keep this under 120 characters.").optional(),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a little more — at least 20 characters.")
    .max(4000, "Please keep your message under 4,000 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;

/** Name of the hidden spam-trap field. Real users never see or fill it. */
export const HONEYPOT_FIELD = "website";

export type ContactResult =
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<ContactField, string>>;
      values: Partial<Record<ContactField, string>>;
    };

const FIELDS: ContactField[] = ["name", "email", "company", "message"];

/** Reads the known fields out of FormData as trimmed-or-empty strings. */
export function readContactForm(formData: FormData): Record<ContactField, string> {
  return Object.fromEntries(
    FIELDS.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value : ""];
    }),
  ) as Record<ContactField, string>;
}

/** Validates raw form values; empty optional fields are treated as absent. */
export function validateContact(values: Record<ContactField, string>) {
  const result = contactSchema.safeParse({ ...values, company: values.company.trim() || undefined });
  if (result.success) return { success: true as const, data: result.data };

  const fieldErrors: Partial<Record<ContactField, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ContactField | undefined;
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return { success: false as const, fieldErrors };
}
