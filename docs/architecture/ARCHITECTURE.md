# Architecture

Ravens is a statically prerendered Next.js (App Router) site. Routes are thin; each product area is a feature that owns its components, motion, styles and types. Shared code sits in a few small layers below the features.

## Layout

```text
src/
├── app/                 routes + metadata files only; each page composes one feature
│   ├── (site)/          about, contact, insights, services, work, home
│   └── layout, error, not-found, sitemap, robots, manifest, opengraph-image, globals.css
├── features/
│   ├── home/            the home page composition (Home.tsx) and the sections only it uses
│   │   └── sections/
│   │       ├── Hero/            scroll journey: components/, chapters/, animation/, scenes/, hooks/, styles/
│   │       └── Testimonials/    components/, hooks/, lib/, styles/
│   ├── process/         ProcessSection (home and /about): components/, animation/, hooks/, lib/, styles/
│   ├── services/        ServicesIndex (home and /services), ServiceDetail: components/, animation/, lib/, styles/
│   ├── work/            WorkIndex, ProjectDetail, ProjectCard, and selected-work/ (the home gallery)
│   ├── contact/         ContactCta, ContactSection, ContactForm: components/, actions/, schema.ts, styles/
│   ├── insights/        index, article, card
│   └── about/           intro, principles
├── components/          genuinely shared: ui/, layout/, brand/, motion/, providers/, seo/
├── webgl/               SharedCanvas, LazyCanvas, capabilities, quality
├── content/             WHAT the site says (typed data): services, projects, process, insights, testimonials, service panels
├── config/              site, navigation (client-safe), env (zod)
├── hooks/               global React hooks
├── lib/                 generic helpers: cn, math, url, dates, metadata, gsap, idle
├── styles/              tokens, typography, spacing, breakpoints
└── types/               shared domain types (types/domain) and vendor declarations
tests/                   unit (Vitest), e2e + visual (Playwright)
scripts/                 assets/ (icon generation), qa/ (bundle and image checks), dev/ (prod server, boundary proof)
docs/                    this file + decisions/ (ADRs)
public/                  images/{brand,services,work,insights}; icons at the root (favicon, PWA); hero/images (raven art)
```

A section that is used by exactly one page lives under that page's feature (`home/sections`). A section used by several routes (`process`, `services`, `contact`, `work/selected-work`) stays in its own feature and is composed by `Home` through that feature's `index.ts`.

## Layers

| Layer         | Path                      | May import                                                                                                          |
| ------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| app           | `src/app`                 | `features/*` (via `index.ts` only), `components`, `config`, `styles`, `lib`                                         |
| features      | `src/features/*`          | other features (via `index.ts` only), `components`, `webgl`, `hooks`, `lib`, `styles`, `content`, `config`, `types` |
| components    | `src/components`          | `hooks`, `lib`, `styles`, `config`, `types`                                                                         |
| webgl         | `src/webgl`               | `hooks`, `lib`, `config`, `types`                                                                                   |
| hooks         | `src/hooks`               | `lib`, `config`, `types`                                                                                            |
| lib           | `src/lib`                 | `config`, `types`                                                                                                   |
| content       | `src/content`             | `types`                                                                                                             |
| config        | `src/config`              | `types`                                                                                                             |
| styles, types | `src/styles`, `src/types` | nothing                                                                                                             |

Enforced in `eslint.config.mjs` (`default: "disallow"`); `pnpm prove:boundaries` demonstrates each rule failing against a real violating import. `pnpm cycles` guards against circular imports.

## Inside a feature

- `components/` UI. Server Components unless they need state, effects, GSAP or WebGL.
- `animation/` pure motion models and GSAP orchestration (`*.animation.ts`), with no content data.
- `hooks/` feature-only hooks. Global hooks live in `src/hooks`.
- `lib/` repository (`getX()` reads `src/content`), schemas, helpers.
- `styles/` the feature's CSS, imported by its entry component. Global CSS stays in `src/styles` (tokens only).
- `index.ts` the only module other layers may import.

## Rendering

- Every route is **statically prerendered** (`generateStaticParams` for slugs). Unknown slugs 404.
- Pages are Server Components. Client components are limited to interaction and motion.
- Motion is progressive: content is server-rendered visible; GSAP, ScrollTrigger and Lenis are code-split into lazy chunks so they never block first paint (see `components/motion/drivers.tsx` and ADR 0003).
- Client components import `config/navigation.ts`, never `config/site.ts` (which pulls in the zod env).
- WebGL: one shared canvas (ADR 0002). `pnpm qa:initial-js` fails if three.js leaks into a route's initial JS.

## Providers

```text
RootLayout (fonts, <html>)
└─ (site)/layout  →  <Providers>                      components/providers/Providers.tsx
                      └─ SmoothScrollProvider          Lenis ⇄ GSAP ticker ⇄ ScrollTrigger (idle-loaded)
                         ├─ ScrollProgress, Cursor      motion drivers (idle-loaded)
                         ├─ Header (+ MobileMenu)
                         ├─ <main><PageTransition>{page}</PageTransition></main>
                         └─ Footer
```

## Design tokens

`src/styles/tokens.css` is the single source for colour, radii, shadows, easing and z-index. `@theme static` both emits the CSS custom properties and generates Tailwind utilities. Typography, spacing and breakpoints follow the same pattern.

## Decisions

See [`../decisions/`](../decisions/).
