import type { NavItem } from "@/types/domain/nav";

import { env } from "./env";

export const siteConfig = {
  name: "Ravens",
  url: env.NEXT_PUBLIC_SITE_URL,
  tagline: "Design that elevates your digital presence",
  description:
    "Ravens is an independent design and development studio crafting considered brands, websites and digital products.",
  locale: "en_US",
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
  themeColor: "#C8D1EC",
} as const;
