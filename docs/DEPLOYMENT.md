# Deployment and content release

The private `anandakevin/second-brain` repository owns the editable
`80-Public-Portfolio` source. Locally, check out both repositories as siblings
or set `PORTFOLIO_SOURCE_ROOT` to that folder. Production CI sparsely checks out the
folder with a read-only deploy key stored as `PORTFOLIO_VAULT_READ_KEY` in the
portfolio repository's Actions secrets. The workflow never commits private
records into the public site repository.

`npm run content:check` validates records, references, and `published.json`.
The production build includes only IDs listed there and only their referenced
media and sketches. The list starts empty until editorial release is approved.

## Production (GitHub Pages)

- **Workflow:** `.github/workflows/build-prod.yml` on push to `main` and daily at 03:17 UTC.
- **Content dispatch:** the Second Brain can dispatch this workflow on `main` when `80-Public-Portfolio/records/**`, `80-Public-Portfolio/public/**`, or `80-Public-Portfolio/published.json` changes. The dispatcher is disabled until this production architecture is promoted and its owner provisions the credential. It uses the native `workflow_dispatch` API; the portfolio workflow still retrieves and validates the source, renders, selects assets, and deploys.
- **Concurrency:** production runs share one queue (`portfolio-production-deploy`); they do not cancel an active deployment or replace queued builds.
- **Build:** private sparse checkout → `npm run lint` → `npm run content:check` → `npm test` → `npm run type-check` → `npm run build`.
- **Artifact:** static `dist/` deployed via GitHub Pages (`deploy-pages`).

The daily schedule picks up approved Second Brain content changes without a
public-site code commit and refreshes external content such as Medium. Content
dispatches provide an immediate build after relevant source changes. For
manual recovery or an intentional rebuild, run the production workflow on
`main`. Only the trusted `main` workflow receives the private
checkout key. Do not pass it to pull-request workflows.
Treat the static artifact and build logs as disclosure surfaces.

### Second Brain dispatch credential

The notifier in `anandakevin/second-brain` calls this workflow through GitHub's
native workflow dispatch endpoint using the existing
`PORTFOLIO_SYNC_TOKEN` Actions secret from that repository. The token must be
authorized for **Actions: write** on this portfolio repository; its current
scope and permissions have not been verified by this implementation. Confirm
them before enabling dispatch. This endpoint does not require contents-write
permission. The independent `PORTFOLIO_VAULT_READ_KEY` remains read-only and is
used only to retrieve the private portfolio source. Keep
`PORTFOLIO_DISPATCH_ENABLED` unset or false until this architecture is on
`main` and the existing token's permission is verified. Do not create, rotate,
or revoke credentials as part of this change. The dispatch step fails visibly
with GitHub's API error when a request is rejected.

### Local commands

| Command           | What it does                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `npm run deploy`  | Same checks and production build as CI; leaves `dist/` on disk. Use before merging to `main` when you want Actions to publish. |
| `npm run publish` | Runs `deploy:publish`, then pushes `dist/` to the remote **`gh-pages`** branch via the `gh-pages` CLI.                         |

### Manual publishing

`npm run build:publish` uses the same approved IDs and assets as production.
`npm run deploy:publish` runs checks and produces that artifact; `npm run publish`
also sends `dist/` through the configured `gh-pages` publisher.

**Default production path:** push/merge to **`main`** so `.github/workflows/build-prod.yml` runs (`deploy-pages`).

**`publish:laptop` only updates the live site if** GitHub Pages is set to publish from the **`gh-pages`** branch. If the repo uses **GitHub Actions** as the Pages source (this workflow), laptop publish updates `gh-pages` but not what visitors see — use `main` instead. Pick one source in the repo’s Pages settings; do not rely on both for the same environment.

## Staging / migration branch

- **Workflow:** `.github/workflows/build-stage.yml` on `develop` creates an empty source and runs `build:fixtures` for layout verification without editorial content or vault access.
- **Local editorial preview:** `npm run preview:staging` includes all records and referenced assets; do not deploy that artifact publicly.

## Retired legacy site

The former Bootstrap/jQuery/Vite entrypoint was removed from the working tree after the Astro cutover. Git history remains available for historical comparison; it is not a supported deployment path.

## Local production preview

```bash
npm run content:check
npm run build
npm run preview
```

Do not use `npm run dev` for launch review — dev includes the editorial backlog.

## External writing aggregation

Medium is fetched during the Astro build. DEV is fetched by the Writing page in the browser. Both
providers are supplementary: a refresh or provider failure omits only that provider's cards. The production workflow's
scheduled build refreshes Medium without a portfolio commit; a push-triggered build remains
available as well.

LinkedIn remains a manually maintained `80-Public-Portfolio/records/social/` catalogue. Its records declare
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
