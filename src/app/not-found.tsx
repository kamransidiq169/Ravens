import { RavensLogo } from "@/components/brand/RavensLogo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";

import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col bg-bg [background-image:var(--gradient-atmosphere)]">
      <Container className="flex h-(--header-height) items-center">
        <Link href="/" aria-label={`${siteConfig.name} — home`} className="text-ink">
          <RavensLogo className="h-5 w-auto" aria-hidden="true" role="presentation" title="" />
        </Link>
      </Container>
      <Container className="flex flex-1 flex-col justify-center pb-24">
        <p className="mb-6 font-display text-xs font-medium tracking-label text-ink-soft uppercase">Error 404</p>
        <h1 className="text-display-lg leading-none font-extralight text-ink uppercase">Lost in flight</h1>
        <p className="mt-8 max-w-md text-lg text-ink-soft">The page you&apos;re looking for has flown elsewhere.</p>
        <div className="mt-12">
          <Button href="/" arrow>
            Back home
          </Button>
        </div>
      </Container>
    </main>
  );
}
