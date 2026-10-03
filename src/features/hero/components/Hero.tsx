// Placeholder — replaced by the hero build prompt. Keep this file's export signature.

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

import { heroConfig } from "../hero.config";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-bg [background-image:var(--gradient-atmosphere)]"
    >
      <Container className="relative z-(--z-content) pt-(--header-height)">
        <p className="mb-8 font-display text-xs font-medium tracking-label text-ink-soft uppercase">
          {heroConfig.eyebrow}
        </p>
        <h1
          id="hero-heading"
          className="text-display-xl leading-(--leading-display) font-extralight tracking-display text-ink uppercase"
        >
          {heroConfig.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <div className="mt-12">
          <Button href={heroConfig.cta.href} arrow>
            {heroConfig.cta.label}
          </Button>
        </div>
      </Container>
      <p
        aria-hidden="true"
        className="absolute inset-x-0 bottom-8 text-center font-display text-xs tracking-label text-ink-soft uppercase"
      >
        {heroConfig.scrollCue}
      </p>
    </section>
  );
}
