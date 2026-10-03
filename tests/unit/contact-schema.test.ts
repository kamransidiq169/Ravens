import { describe, expect, it } from "vitest";

import { submitContact } from "@/features/contact/lib/actions";
import { contactSchema, HONEYPOT_FIELD, validateContact } from "@/features/contact/lib/schema";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "",
  message: "We would like to talk about a new brand and website.",
};

describe("contactSchema", () => {
  it("accepts a valid submission", () => {
    expect(contactSchema.safeParse({ ...valid, company: undefined }).success).toBe(true);
  });

  it("rejects a short name, bad email and short message with field-level messages", () => {
    const result = validateContact({ name: "A", email: "nope", company: "", message: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(result.fieldErrors).sort()).toEqual(["email", "message", "name"]);
      expect(result.fieldErrors.email).toMatch(/valid email/i);
    }
  });

  it("treats a blank optional company as absent", () => {
    const result = validateContact(valid);
    expect(result.success && result.data.company).toBeFalsy();
  });

  it("caps message length", () => {
    expect(validateContact({ ...valid, message: "x".repeat(4001) }).success).toBe(false);
  });
});

describe("submitContact server action", () => {
  const form = (fields: Record<string, string>) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    return data;
  };

  it("returns success for valid input", async () => {
    expect(await submitContact(null, form(valid))).toMatchObject({ status: "success" });
  });

  it("returns typed field errors and echoes values for invalid input", async () => {
    const result = await submitContact(null, form({ ...valid, email: "bad" }));
    expect(result).toMatchObject({
      status: "error",
      fieldErrors: { email: expect.any(String) },
      values: { name: valid.name },
    });
  });

  it("silently succeeds when the honeypot is filled, without validating", async () => {
    const result = await submitContact(null, form({ name: "", [HONEYPOT_FIELD]: "http://spam.example" }));
    expect(result.status).toBe("success");
  });
});
