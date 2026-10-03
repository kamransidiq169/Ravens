import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .url({ message: "NEXT_PUBLIC_SITE_URL must be an absolute URL, e.g. https://ravens.studio" })
    .default("http://localhost:3000")
    .transform((value) => value.replace(/\/+$/, "")),
  CONTACT_TO_EMAIL: z.email().optional(),
  EMAIL_PROVIDER_API_KEY: z.string().min(1).optional(),
});

const parsed = schema.safeParse({
  // Referenced literally so Next.js can inline NEXT_PUBLIC_* values into the client bundle.
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL || undefined,
  EMAIL_PROVIDER_API_KEY: process.env.EMAIL_PROVIDER_API_KEY || undefined,
});

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new Error(`Invalid environment variables:\n${details}`);
}

export const env = parsed.data;
