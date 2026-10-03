# 0005 — No root `loading.tsx`; unknown slugs via `notFound()`

**Status:** accepted (deviates from the original task outline, which listed `(site)/loading.tsx`)

## Context

Every `(site)` route is statically prerendered. Adding `(site)/loading.tsx` makes Next wrap each page in a Suspense boundary and emit the real content inside a `<template>` revealed by an inline `$RC` script — even for static output. Measured on the production build (Lighthouse mobile, home page): Performance 90 with the boundary vs 97 without (LCP 3.6 s → 2.4 s), and page content is invisible until that script runs.

## Decision

Do not ship a root `loading.tsx`. `error.tsx` and `not-found.tsx` stay. Dynamic routes use `generateStaticParams` and `notFound()`, which returns a real 404 status. If a route later becomes genuinely dynamic, add a `loading.tsx` **at that route's segment**, not at `(site)`.

## Consequences

- Fast, content-first HTML for crawlers and users.
- No loading UI between navigations today; all targets are prerendered, so transitions are near-instant.
