# 0001 — Feature-based structure with enforced layer boundaries

**Status:** accepted

## Context

The site mixes marketing pages, a contact flow and a heavy WebGL hero that will be built by a separate effort. We need areas that can change independently and a structure that stays legible as it grows.

## Decision

Organise by **feature** (`src/features/<name>/`) on top of a small set of shared layers (`components`, `webgl`, `hooks`, `lib`, `styles`, `content`, `config`, `types`). Each feature exposes a single public API, `index.ts`. Dependencies flow `app → features → shared`. The rules are enforced in ESLint (`eslint-plugin-boundaries` with `default: "disallow"` plus `no-restricted-imports`), so they fail CI rather than relying on review.

## Consequences

- The hero can be rewritten without touching other code, as long as `Hero` keeps its export.
- `app/` cannot read `content/` or feature internals; data flows through feature repositories.
- Slightly more ceremony (an `index.ts` per feature) in exchange for explicit, checkable boundaries.
