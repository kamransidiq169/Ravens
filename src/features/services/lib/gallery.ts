/** Service gallery content: label, alt text and source photograph per panel, in display order. */
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=1200&q=80`;

export const panels = [
  { label: "Web Development", alt: "Laptop glowing in a dark room", src: "/services/webdev.jpg" },
  {
    label: "App Development",
    alt: "Sweeping curved architecture against the sky",
    src: "/services/appdev.jpg",
  },
  {
    label: "Digital Experiences",
    alt: "Long minimal corridor with glass partitions",
    src: unsplash("1497366216548-37526070297c"),
  },
  {
    label: "Business Systems",
    alt: "Modern meeting room with a long timber table",
    src: "/services/bm.png",
  },
  {
    label: "CRM Development",
    alt: "Designer lounge chairs and a black floor lamp",
    src: "/services/crm.jpg",
  },
];
