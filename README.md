# Ravens

Website for **Ravens**, an independent design and development studio. Next.js (App Router) · TypeScript · Tailwind CSS 4 · GSAP + Lenis · React Three Fiber (shared canvas).

> This repository is the production **foundation**. The WebGL hero is built separately and plugs into `src/features/hero/`, `src/webgl/canvas/` and `assets-src/hero/` — see [Where the hero plugs in](#where-the-hero-plugs-in).

## Prerequisites

- **Node.js** — the version in [`.nvmrc`](.nvmrc) (`nvm use`)
- **pnpm** — the version pinned in `package.json#packageManager` (`corepack enable`)
- **Docker** (optional) — for the VPS image

## Setup

```bash
corepack enable
pnpm install            # also installs the husky git hooks
cp .env.example .env.local
pnpm dev                # http://localhost:3000 (Turbopack)
pnpm exec playwright install chromium   # once, for e2e / visual tests
```

### Environment

Validated with zod in [`src/config/env.ts`](src/config/env.ts); invalid values fail `next dev` / `next build` immediately.

| Variable                 | Required | Purpose                                                                                                     |
| ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | prod     | Public origin (no trailing slash). Canonical URLs, sitemap, OG. Defaults to `http://localhost:3000` in dev. |
| `CONTACT_TO_EMAIL`       | optional | Recipient of contact-form submissions (once an email provider is wired).                                    |
| `EMAIL_PROVIDER_API_KEY` | optional | Provider key (see the `TODO(email-provider)` in `features/contact/lib/actions.ts`).                         |

`NEXT_PUBLIC_*` values are inlined at **build** time — set them before `pnpm build` / `docker build`.

## Scripts

| Script                         | What it does                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `pnpm dev`                     | Dev server (Turbopack)                                                                 |
| `pnpm build` / `start`         | Production build / server                                                              |
| `pnpm typecheck`               | `next typegen` + `tsc --noEmit`                                                        |
| `pnpm lint` / `lint:fix`       | ESLint (Next core-web-vitals, import order, **architecture boundaries**)               |
| `pnpm format` / `format:check` | Prettier (with the Tailwind class-sorting plugin)                                      |
| `pnpm test` / `test:watch`     | Vitest unit tests (`tests/unit`)                                                       |
| `pnpm test:e2e`                | Playwright e2e against a production build (`tests/e2e`)                                |
| `pnpm test:visual`             | Playwright screenshot specs vs stored baselines (`tests/visual`, 1440×900 and 390×844) |
| `pnpm knip`                    | Unused files / exports / dependencies                                                  |
| `pnpm cycles`                  | Circular-dependency check (madge)                                                      |
| `pnpm check`                   | typecheck + lint + knip + unit tests                                                   |
| `pnpm assets:hero`             | `assets-src/hero/*` → responsive AVIF/WebP + LQIP + `public/hero/manifest.json`        |
| `pnpm assets:icons`            | Regenerates favicon / PNG icons in `public/`                                           |
| `pnpm prove:boundaries`        | Writes violating imports, asserts ESLint rejects each, cleans up                       |
| `pnpm qa:initial-js`           | After a build: asserts no route ships three.js in its initial JS                       |
| `pnpm qa:compare a b`          | Pixel-diffs two images (build screenshot vs a mockup in `docs/design/reference`)       |

Playwright starts the production server itself (`scripts/dev/serve-prod.mjs`, building first if needed).

**Visual baselines** live in `tests/visual/__baselines__/<project>/` and are shared across platforms with a 2% pixel tolerance for font anti-aliasing. Regenerate after intentional UI changes with `pnpm exec playwright test --project=visual-desktop --project=visual-mobile --update-snapshots` (delete the folder first if a change is subtler than the tolerance), preferably on Linux/CI so they match CI rendering.

## Folder structure

```
.github/workflows/ci.yml   CI: typecheck → lint → format → knip → cycles → unit → build → e2e + visual
.husky/                    pre-commit (lint-staged) and commit-msg (commitlint)
docs/architecture/         ARCHITECTURE.md + ADRs
docs/design/reference/     mockups — never shipped
assets-src/hero/           raw hero art → processed into public/hero
public/                    static files; hero/ is generated output only
scripts/{assets,qa,dev}/   asset pipelines · QA tools · dev tooling
src/app/                   routes only — (site) pages, (dev) hero-lab, metadata files
src/features/<name>/       one folder per product feature (see below)
src/components/            shared UI: ui, layout, brand, motion, seo, providers
src/webgl/                 the single shared R3F canvas + WebGL utils
src/hooks/                 shared React hooks
src/content/               typed placeholder content (CMS-ready data source)
src/config/                site.ts (metadata source of truth), env.ts (zod), navigation.ts (client-safe)
src/lib/                   pure helpers: cn, math, dates, urls, metadata, gsap
src/styles/                design tokens, typography, spacing, breakpoints
src/types/                 domain types + vendor declarations
tests/{unit,e2e,visual}/   Vitest · Playwright
```

## Architecture rules

Enforced by `eslint-plugin-boundaries` + `no-restricted-imports` (violations fail `pnpm lint`):

1. `app/` imports `features/*` (only via `index.ts`), `components/`, `config/`, `styles/`, `lib/`.
2. Dependencies flow one way: `app → features → components / webgl / hooks / lib / styles / content / config / types`.
3. Shared layers never import from `features/`.
4. Features never deep-import another feature — only its `index.ts`.

Data reaches pages through each feature's repository (`features/<name>/lib/repository.ts`, re-exported from `index.ts`), so `app/` never touches `content/` directly. Details: [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md).

## Adding a feature

1. `src/features/<name>/` with `components/`, optional `lib/` (schemas, repository), optional `<name>.config.ts` (only for tunables). Omit empty folders.
2. Export the public surface from `src/features/<name>/index.ts` — the **only** entry other layers may import.
3. Need data? Add types in `src/types/domain/`, placeholder content in `src/content/`, and a `lib/repository.ts` that reads it.
4. Add the route under `src/app/(site)/<name>/page.tsx`; derive metadata with `createMetadata()` from `@/lib/metadata`; use `generateStaticParams` + `notFound()` for dynamic routes.
5. Add the route to `src/app/sitemap.ts` (via the feature's getters) and nav items to `src/config/navigation.ts` if needed.
6. Add unit tests for pure logic, an e2e spec for behaviour, and a case in `tests/visual/routes.spec.ts`.
7. `pnpm check && pnpm build && pnpm test:e2e`.

## Hero asset pipeline

Drop raw art (PNG/JPG/WebP/TIFF/AVIF) into `assets-src/hero/`, then `pnpm assets:hero`. For each file it writes `public/hero/<name>-<width>.{avif,webp}` at 1280 / 1920 / 2560 / 3840 px (never upscaled), a 24px blurred LQIP, and `public/hero/manifest.json`:

```json
{
  "<name>": {
    "width": 4000,
    "height": 2250,
    "lqip": "data:image/webp;base64,…",
    "sources": [{ "width": 1280, "format": "avif", "src": "/hero/<name>-1280.avif" }]
  }
}
```

`public/hero/` is generated output — edit sources, not outputs.

## Where the hero plugs in

- `src/features/hero/` — `Hero.tsx` is a DOM placeholder (headline as real text). Replace its internals but **keep the export signature**. Subfolders `scene/{layers,shaders}`, `hooks/`, `lib/`, `dev/` are ready (`.gitkeep`). `*.glsl` imports are typed in `src/types/vendor/shaders.d.ts` (add the bundler loader when shaders land).
- `src/webgl/canvas/` — `SharedCanvas` (one fixed R3F canvas, drei `View` tunnel, DPR ≤ 1.75, `PerformanceMonitor`) and `LazySharedCanvas` (`next/dynamic`, `ssr: false`). Mount `LazySharedCanvas` only on routes that render WebGL, and import any file that uses drei/three **lazily** (see `features/hero/dev/CanvasSmoke.tsx`) so three.js stays out of initial JS. `pnpm qa:initial-js` guards this.
- `src/app/(dev)/hero-lab` — playground (`notFound()` in production) with a canvas smoke test.
- `assets-src/hero/` → `pnpm assets:hero` → `public/hero/`.

## Deployment

### Vercel

Import the repo, framework preset _Next.js_, set `NEXT_PUBLIC_SITE_URL` for each environment. Nothing else is required (`output: 'standalone'` is only enabled for Docker builds).

### Docker (VPS)

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://ravens.studio -t ravens .
docker run -d --restart unless-stopped -p 3000:3000 --name ravens ravens
```

Multi-stage build (deps → build with `BUILD_STANDALONE=1` → minimal non-root runtime running `node server.js`). Put a TLS-terminating reverse proxy (Caddy/nginx) in front; HSTS and the other security headers are set by the app (`next.config.ts`).

## Security headers

`next.config.ts` sets CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy` and `Permissions-Policy`. Fonts are self-hosted by `next/font`, so no Google Fonts origin is allowed. `script-src` needs `'unsafe-inline'` for Next's bootstrap scripts (nonce-based CSP would force dynamic rendering); `'unsafe-eval'` is dev-only. `blob:` / `worker-src` are open for troika text workers.
