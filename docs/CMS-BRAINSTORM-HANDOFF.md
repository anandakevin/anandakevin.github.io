# CMS brainstorm handoff

Status: planning
Cleanup condition: archive or delete this handoff after the CMS direction and first implementation slice are accepted.

## Context and current state

The portfolio site is `anandakevin/anandakevin.github.io`; its editable public-facing source is in the private `anandakevin/second-brain` repository under `80-Public-Portfolio/`. The Astro repository owns presentation, schemas, validation, asset staging, and deployment. The private vault owns portfolio records, drafts, and referenced media.

Read the repositories directly before proposing changes. Start with:

- Public site: `docs/PUBLIC-CONTENT.md`, `docs/DEPLOYMENT.md`, `src/content.config.ts`, `src/lib/content/publication.ts`, `scripts/check-public-content.mjs`, `.github/workflows/build-prod.yml`, `.github/workflows/build-stage.yml`.
- Private source: `80-Public-Portfolio/README.md`, `80-Public-Portfolio/published.json`, `80-Public-Portfolio/records/`, `80-Public-Portfolio/drafts/`, `AGENTS.md`, and `00-System/Workspace-Map.md`.

Current release boundary:

- Every portfolio record declares `publication_status: draft | review | ready | published`.
- `draft` and `review` appear in local preview only.
- `ready` and `published` are production-eligible only when their IDs are also in `80-Public-Portfolio/published.json`.
- `published.json` is currently empty.
- Private owner notes remain in their normal Second Brain folders. A public candidate is manually extracted into `80-Public-Portfolio/records/`; private notes are never Astro or CMS inputs.

The public architecture was merged through PR #11: <https://github.com/anandakevin/anandakevin.github.io/pull/11>. This handoff is the only change in follow-up draft PR #12: <https://github.com/anandakevin/anandakevin.github.io/pull/12>. Do not publish records as part of the brainstorm.

## Design and boundaries

The CMS must edit the private vault source, not the public Astro repository. It needs to respect the existing Markdown frontmatter, collection-specific fields, relationships, media paths, publication status, and final release allowlist. It must support safe editing from mobile or tablet devices without exposing private owner notes or credentials.

Compare two directions:

1. An existing Git-backed CMS such as Sveltia/Decap or another suitable option, including its hosting, authentication, repository/branch behavior, media handling, custom field support, draft/PR workflow, and mobile usability.
2. A small custom CMS or editor for this schema, including the minimum surface needed, auth and GitHub integration, validation reuse, media upload behavior, preview/review flow, maintenance cost, and where a custom tool would be genuinely better.

Do not assume a generic CMS is sufficient. Evaluate whether it can model the customized collections and relationships without weakening the private/public boundary. Prefer the smallest viable first slice and reuse the existing checker and schemas where possible.

## Checklist

- [ ] Inspect both repositories and current PR state.
- [ ] Inventory CMS-editable collections, fields, relationships, assets, and status transitions.
- [ ] Compare existing Git-backed CMS options against the actual contracts.
- [ ] Sketch the smallest custom-CMS alternative and its operational burden.
- [ ] Recommend an option with explicit trade-offs and a first implementation slice.
- [ ] Only after approval, implement a local/admin preview; do not add credentials or publish records during exploration.

## Verification and evidence

Already verified locally: `npm run deploy` passes with 34 tests, type checking, and a production build; `npm run build:staging` builds the full private-source preview. Medium refresh may fail without network access but is non-fatal. The next thread should separately identify evidence still needed for browser/mobile editing, GitHub authentication, media uploads, CMS commits or PRs, and live deployment.

## New-thread continuation

Begin by reading this handoff, then run `git status --short` in both repositories and inspect the listed source files. Treat the current dirty Second Brain paths outside `80-Public-Portfolio/` as unrelated user work and leave them untouched. The immediate deliverable is a decision brief for existing CMS versus custom CMS; implementation, CMS hosting, OAuth setup, repository writes, and release-list changes are out of scope until that brief is reviewed.
