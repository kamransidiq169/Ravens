import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CanvasSmoke, Hero } from "@/features/hero";

export const metadata: Metadata = { title: "Hero lab", robots: { index: false, follow: false } };

/** Dev-only playground: the hero in isolation, plus a smoke test for the shared WebGL canvas. */
export default function HeroLabPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main>
      <Hero />
      <CanvasSmoke />
    </main>
  );
}
