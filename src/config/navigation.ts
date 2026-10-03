import type { NavItem } from "@/types/domain/nav";

/**
 * Client-safe site constants. Client components import this instead of `site.ts`,
 * which pulls in the zod-validated env and must stay out of browser bundles.
 */
export const publicSite = {
  name: "Ravens",
  email: "hello@ravens.studio",
  nav: [
    { label: "Work", href: "/work" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Insights", href: "/insights" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavItem[],
  footerNav: [
    {
      heading: "Studio",
      items: [
        { label: "About", href: "/about" },
        { label: "Insights", href: "/insights" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      heading: "Explore",
      items: [
        { label: "Selected work", href: "/work" },
        { label: "Services", href: "/services" },
      ],
    },
  ] satisfies { heading: string; items: NavItem[] }[],
  socials: [
    { label: "Instagram", href: "https://instagram.com/ravens.studio" },
    { label: "LinkedIn", href: "https://linkedin.com/company/ravens-studio" },
    { label: "Dribbble", href: "https://dribbble.com/ravens" },
  ] satisfies NavItem[],
} as const;
