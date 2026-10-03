import { env } from "./env";
import { publicSite } from "./navigation";

export const siteConfig = {
  ...publicSite,
  url: env.NEXT_PUBLIC_SITE_URL,
  tagline: "Design that elevates your digital presence",
  description:
    "Ravens is an independent design and development studio crafting considered brands, websites and digital products.",
  locale: "en_US",
  themeColor: "#C8D1EC",
} as const;
