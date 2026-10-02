# Deployment and cutover

## Production (GitHub Pages)

- **Workflow:** `.github/workflows/build-prod.yml` on push to `main` and daily at 03:17 UTC.
- **Build:** `npm run lint` → `npm run content:check` → `npm test` → `npm run type-check` → `npm run build` (production-visible direct public collections).
- **Artifact:** static `dist/` deployed via GitHub Pages (`deploy-pages`).

The production build reads production-visible `src/content/public/` records. The
manual review-publish build may read draft and review records from the local
working tree; CI never reads the private vault and no export or generated-content
step runs in CI.

### Local commands

| Command           | What it does                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `npm run deploy`  | Same checks and production build as CI; leaves `dist/` on disk. Use before merging to `main` when you want Actions to publish. |
| `npm run publish` | Runs `deploy:publish`, then pushes `dist/` to the remote **`gh-pages`** branch via the `gh-pages` CLI.                         |

### Manual review publishing

The local publishing path is separate from canonical Git history. `npm run build:publish`
includes `draft`, `review`, `ready`, and `published` public records from the current working
tree without staging or committing them. `npm run deploy:publish` runs the checks and produces
that artifact; `npm run publish` additionally sends `dist/` through the configured `gh-pages`
publisher. Publishing makes content public and potentially indexable, but does not make it
canonical in Git.

**Default production path:** push/merge to **`main`** so `.github/workflows/build-prod.yml` runs (`deploy-pages`).

**`publish:laptop` only updates the live site if** GitHub Pages is set to publish from the **`gh-pages`** branch. If the repo uses **GitHub Actions** as the Pages source (this workflow), laptop publish updates `gh-pages` but not what visitors see — use `main` instead. Pick one source in the repo’s Pages settings; do not rely on both for the same environment.

## Staging / migration branch

- **Workflow:** `.github/workflows/build-stage.yml` on `develop` runs `build:fixtures` for layout verification without reviewed content.

## Retired legacy site

The former Bootstrap/jQuery/Vite entrypoint was removed from the working tree after the Astro cutover. Git history remains available for historical comparison; it is not a supported deployment path.

## Local production preview

```bash
npm run content:check
npm run build
npm run preview
```

Do not use `npm run dev` for launch review — dev defaults to fixture mode.

## External writing aggregation

Medium is fetched during the Astro build. DEV is fetched by the Writing page in the browser. Both
providers are supplementary: a refresh or provider failure omits only that provider's cards. The production workflow's
scheduled build refreshes Medium without a portfolio commit; a push-triggered build remains
available as well.

LinkedIn remains a manually maintained `src/content/public/social/` catalogue. Its records declare
`authorship: self` or `authorship: third-party`; only self-authored records appear in Writing, while
third-party announcements remain relationship evidence on the relevant public record.

The portfolio-owned overlay in `src/data/external-writing.ts` contains only stable provider IDs and
relationships/curation. It does not copy titles, descriptions, dates, tags, or bodies. Related
portfolio records are shown as local context on the relevant external cards.

Self-authored Medium and DEV cards also offer an on-site reader. Medium body HTML is fetched at
build time; DEV fetches the selected article in the browser. The reader keeps the original link
prominent, declares the provider URL canonical, and renders only an explicit HTML allowlist. It
removes scripts, event handlers, forms, embeds, styles, and unsafe URLs; HTTPS remote images are
lazy-loaded. LinkedIn and third-party material remain link-out only.

The portfolio's `content:refresh-adplist` command updates the public ADPList contribution snapshot.
Private notes record the contribution and profile URL, not a second statistics registry.
