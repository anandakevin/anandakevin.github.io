# Portfolio content source

The private Second Brain repository owns editable portfolio records under
`80-Public-Portfolio/records/`. Each Markdown file declares an `id` matching
its collection-relative path, for example
`contributions/dbs-coding-camp-2026`. That folder also owns referenced files
under `public/media/` and `public/sketches/`. Older notes under `drafts/` are
preserved but are not an Astro input.

The public site repository owns Astro code, schemas, checks, and deployment.
It reads the private source from the sibling
`../second-brain/80-Public-Portfolio` checkout locally. Set
`PORTFOLIO_SOURCE_ROOT` when the repositories are checked out elsewhere. CI
sparsely checks out only `80-Public-Portfolio` and sets that variable to its
checkout path. Builds fail when the source or `published.json` is missing.

Every record in the private source is available in local preview. Production
and manual publish builds include only IDs listed in `published.json`; Writing
and Knowledge also require `publication_status: ready` or `published`.
`published.json` starts empty because migration is not editorial approval.
Production stages only assets referenced by selected records. A preview build
may include the backlog and its media, so its artifact is for local review.

Private Obsidian owner notes remain separate from this portfolio source. An
owner may link to an approved public record through an HTTPS `public_sources`
URL. Review wording, evidence, attribution, permissions, and media before
adding an ID to `published.json`. Published HTML and assets are public even
though the content Git repository is private.

External Medium and DEV writing is provider-owned and never copied into this
directory. The normalized feed adapters live in `src/lib/external-writing.ts`;
`src/data/external-writing.ts` contains only provider configuration and
portfolio-owned relationship overrides. LinkedIn is the exception: it has no
suitable public read feed, so reviewed link cards remain manual under
`80-Public-Portfolio/records/social/`.

The portfolio offers a reading convenience layer for supported self-authored posts: Medium pages
use the provider body fetched during the build, while the static DEV reader shell fetches the
selected article in the visitor's browser. Both use a small HTML allowlist, retain a prominent
original-provider link, use the provider URL as canonical, and permit only HTTPS remote images
with lazy loading. Provider bodies are never committed as portfolio records; a body-rendering
failure leaves the original link available.

Keep private evidence, drafts, and original editable media in their existing
owners. Reviewed derivatives belong under `80-Public-Portfolio/public/media/<record-id>/` and are
referenced by a record's `media` array.
