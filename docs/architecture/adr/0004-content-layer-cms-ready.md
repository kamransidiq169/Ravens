# 0004 — CMS-ready content layer

**Status:** accepted

## Context

Content is placeholder today but will move to a CMS. Components should not have to change when it does.

## Decision

Typed domain models live in `src/types/domain/`. Placeholder data lives in `src/content/` (clearly marked). Each feature owns an **async repository** (`features/<name>/lib/repository.ts`) — `getProjects()`, `getProject(slug)` … — re-exported from its `index.ts`. Pages and sitemap call repositories; components receive plain props. Navigation is configuration, not content, and lives in `src/config/navigation.ts` (config cannot import content under the layer rules, and client components need it without the zod env).

## Consequences

- Swapping to a CMS means rewriting repository bodies only; the async signatures already fit network calls.
- `app/` cannot import `content/` (enforced by lint).
