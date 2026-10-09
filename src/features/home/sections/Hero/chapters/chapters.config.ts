/**
 * Third chapter of the home sequence. PLACEHOLDER COPY: there is no matching case study in `content/projects.ts` yet,
 * so this lives here until one exists.
 */
export const interactiveChapter = {
  title: "Made to move you.",
  summary:
    "A collectible fan experience that brought Web 3 to the court, built for one night and made to be revisited.",
} as const;

/** Fourth chapter. Same caveat: no matching case study yet. */
export const enterpriseChapter = {
  title: "Everything, connected.",
  summary:
    "Enterprise website design using interactive 3D elements to visualize Salesforce AI ecosystem. Glassy 3D tiles, modular UX, and spatial storytelling make complex enterprise platforms accessible for CIOs, developers, and architects.",
} as const;

/** Fifth chapter. Same caveat: no matching case study yet. */
export const bespokeChapter = {
  title: "The next is yours.",
  summary: "Your next digital chapter starts here. Let’s build something that moves your brand forward.",
  actions: [
    { label: "Start a project", href: "/contact", variant: "primary" },
    { label: "View our work", href: "/work", variant: "outline" },
  ],
} as const;
