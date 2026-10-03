"use server";

import { HONEYPOT_FIELD, readContactForm, validateContact, type ContactResult } from "./schema";

const SUCCESS: ContactResult = {
  status: "success",
  message: "Thank you — your message is in. We'll reply within two working days.",
};

export async function submitContact(_previous: ContactResult | null, formData: FormData): Promise<ContactResult> {
  // Honeypot: bots fill every field. Pretend success so they learn nothing.
  const trap = formData.get(HONEYPOT_FIELD);
  if (typeof trap === "string" && trap.length > 0) return SUCCESS;

  const values = readContactForm(formData);
  const result = validateContact(values);

  if (!result.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: result.fieldErrors,
      values,
    };
  }

  // TODO(email-provider): deliver `result.data` to CONTACT_TO_EMAIL via the chosen provider
  // (Resend, Postmark, SES…) using EMAIL_PROVIDER_API_KEY, and add rate limiting (per IP) here.
  return SUCCESS;
}
