# Production content review checklist

Use before merging public content or enabling the production GitHub Pages deployment. Aligns with **Public-Site-Implementation-Handoff** §10 (Definition of Done).

## Boundary

- [ ] `npm run content:check` passes on the direct `src/content/public` tree.
- [ ] `npm run content:check` passes in the portfolio repo.
- [ ] `npm run build` succeeds (no `PUBLIC_CONTENT_MODE=fixtures` — no fixture banner in output).
- [ ] `ready` and `published` ship through the production build; draft/review can ship through the explicitly manual `build:publish` path while remaining outside canonical Git history. All committed records are safe to inspect in Git.

## Content quality

- [ ] No placeholder employer names, unreviewed metrics, or prototype-only copy in public markdown.
- [ ] Homepage `pages/home` curation IDs resolve to exported records.
- [ ] Case studies follow [[CASE-STUDY-BODY-CONVENTIONS]] (`Context`, `Constraints`, `Approach`, `Trade-offs`).
- [ ] External writing uses catalog metadata + outbound links only (no full-body mirror).

## Privacy

- [ ] No `source_notes`, private paths, `[[wikilinks]]`, or `99-Private` references in public records.
- [ ] No secrets or internal-only URLs in front matter or body.

## Experience (spot-check)

- [ ] Primary routes load; work chronology and writing feed show synced records.
- [ ] Systems map deep links use contract throughline IDs (`?section=model-variation`, etc.).
- [ ] Light/dark theme, keyboard focus, and reduced-motion behaviour acceptable on home signature blocks.

## Sign-off

Document intentional deviations in the parity execution plan decision table before public cutover.
