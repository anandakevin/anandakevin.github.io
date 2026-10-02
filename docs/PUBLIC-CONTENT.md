# Portfolio-owned public records

`src/content/public/` is the authored source for intentionally public
portfolio content. Each Markdown file declares an `id` matching its
collection-relative path, for example `contributions/dbs-coding-camp-2026`.

Private Obsidian owner notes are not an input to the Astro build. When a human
cross-reference is useful, keep only an HTTPS portfolio, repository, or
authoritative external-publication URL in the precise owner's `public_sources`
list; do not add a portfolio-only local-ID mapping. Records committed here are
safe to inspect in Git. `publication_status` controls visibility for content
collections that support editorial staging, including Writing and Knowledge;
the manual publish build may include draft and review records from the working
tree without making them canonical in Git.

External Medium and DEV writing is provider-owned and never copied into this
directory. The normalized feed adapters live in `src/lib/external-writing.ts`;
`src/data/external-writing.ts` contains only provider configuration and
portfolio-owned relationship overrides. LinkedIn is the exception: it has no
suitable public read feed, so reviewed link cards remain manual under
`src/content/public/social/`.

The portfolio offers a reading convenience layer for supported self-authored posts: Medium pages
use the provider body fetched during the build, while the static DEV reader shell fetches the
selected article in the visitor's browser. Both use a small HTML allowlist, retain a prominent
original-provider link, use the provider URL as canonical, and permit only HTTPS remote images
with lazy loading. Provider bodies are never committed as portfolio records; a body-rendering
failure leaves the original link available.

Keep private evidence, drafts, and original editable media in their existing
owners. Reviewed derivatives belong under `public/media/<record-id>/` and are
referenced by a record's `media` array.
