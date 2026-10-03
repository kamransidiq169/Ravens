import { siteConfig } from "@/config/site";

import { RavenAccent } from "../brand/RavenAccent";
import { RavensLogo } from "../brand/RavensLogo";
import { Container } from "../ui/Container";
import { Link } from "../ui/Link";

export function Footer() {
  return (
    <footer className="relative z-(--z-content) border-t border-ink/15 py-section-sm">
      <Container className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col items-start gap-6">
          <RavensLogo className="h-6 w-auto text-ink" title="Ravens" />
          <p className="max-w-xs text-sm text-ink-soft">{siteConfig.description}</p>
          <RavenAccent className="size-8 text-ink/60" />
        </div>

        {siteConfig.footerNav.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2 className="mb-5 font-display text-xs font-medium tracking-label text-ink-soft uppercase">
              {group.heading}
            </h2>
            <ul className="space-y-3 text-sm">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink hover:text-ink-soft">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="mb-5 font-display text-xs font-medium tracking-label text-ink-soft uppercase">Connect</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href={`mailto:${siteConfig.email}`} className="text-ink hover:text-ink-soft">
                {siteConfig.email}
              </Link>
            </li>
            {siteConfig.socials.map((social) => (
              <li key={social.href}>
                <Link href={social.href} className="text-ink hover:text-ink-soft">
                  {social.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <Container className="mt-16 text-xs text-ink-soft">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
