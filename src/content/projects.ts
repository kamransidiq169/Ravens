import type { Project } from "@/types/domain/project";

const covers = [
  {
    src: "/selectedwork/thm.png",
    alt: "Premium underfloor heating website for The Heating Store",
    width: 1600,
    height: 1000,
  },
  {
    src: "/selectedwork/tripoday.png",
    alt: "Travel CRM interface and digital experience for Tripoday",
    width: 1600,
    height: 1000,
  },
  {
    src: "/selectedwork/prowarm.png",
    alt: "Premium brand website experience for ProWarm",
    width: 1600,
    height: 1000,
  },
  {
    src: "/selectedwork/wowtherm.png",
    alt: "Modern heating brand website experience for Wowtherm",
    width: 1600,
    height: 1000,
  },
  {
    src: "/selectedwork/landaim.png",
    alt: "Premium real estate website experience for Landa Im Reality",
    width: 1600,
    height: 1000,
  },
];

export const projects: Project[] = [
  {
    slug: "the-heating-store",
    title: "The Heating Store",
    client: "The Heating Store",
    year: 2026,
    summary: "A premium digital experience for a specialist underfloor heating brand.",
    body: [
      "A refined digital presence built to communicate premium heating technology, products and installation expertise with clarity.",
    ],
    disciplines: ["Underfloor Heating / Website"],
    cover: covers[0],
    websiteUrl: "https://theheatingstore.in",
    seo: {
      title: "The Heating Store — Ravens",
      description: "A premium digital experience for a specialist underfloor heating brand.",
    },
  },

  {
    slug: "tripoday",
    title: "Tripoday",
    client: "Tripoday",
    year: 2026,
    summary: "A complete travel CRM designed to manage modern travel operations.",
    body: [
      "A powerful travel-focused CRM experience bringing enquiries, customers, trips and operational workflows into one connected system.",
    ],
    disciplines: ["Travel / CRM"],
    cover: covers[1],
    websiteUrl: "https://crm.tripoday.com",
    seo: {
      title: "Tripoday — Ravens",
      description: "A complete travel CRM designed to manage modern travel operations.",
    },
  },

  {
    slug: "prowarm",
    title: "ProWarm",
    client: "ProWarm",
    year: 2026,
    summary: "A premium digital brand experience for a leading underfloor heating brand.",
    body: [
      "A focused brand experience designed to present ProWarm's heating technology, products and positioning through a refined digital interface.",
    ],
    disciplines: ["Heating / Brand Website"],
    cover: covers[2],
    websiteUrl: "https://prowarm.in",
    seo: {
      title: "ProWarm — Ravens",
      description: "A premium digital brand experience for a leading underfloor heating brand.",
    },
  },

  {
    slug: "wowtherm",
    title: "Wowtherm",
    client: "Wowtherm",
    year: 2026,
    summary: "A modern digital presence created for a specialist heating brand.",
    body: [
      "A premium brand-led website experience designed to present Wowtherm's products and heating solutions with clarity and confidence.",
    ],
    disciplines: ["Heating / Brand Website"],
    cover: covers[3],
    websiteUrl: "https://wowtherm.com",
    seo: {
      title: "Wowtherm — Ravens",
      description: "A modern digital presence created for a specialist heating brand.",
    },
  },

  {
    slug: "landa-im-reality",
    title: "Landaim Reality",
    client: "Landa Im Reality",
    year: 2026,
    summary: "A premium real estate website designed to showcase properties and build trust.",
    body: [
      "A polished digital experience for a real estate brand, combining property presentation with a clear and confident browsing experience.",
    ],
    disciplines: ["Real Estate / Website"],
    cover: covers[4],
    websiteUrl: "https://landaimreality.in",
    seo: {
      title: "Landa Im Reality — Ravens",
      description: "A premium real estate website designed to showcase properties and build trust.",
    },
  },
];
