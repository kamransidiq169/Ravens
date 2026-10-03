"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section intro className="min-h-svh">
      <SectionHeader
        as="h1"
        eyebrow="Something went wrong"
        title="That didn't go to plan"
        description="An unexpected error interrupted this page. Try again, or head back to the start."
      />
      <div className="mt-12 flex flex-wrap gap-4">
        <Button onClick={reset} arrow>
          Try again
        </Button>
        <Button href="/" variant="outline">
          Home
        </Button>
      </div>
    </Section>
  );
}
