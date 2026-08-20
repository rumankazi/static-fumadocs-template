# dev-docs

A [Fumadocs](https://fumadocs.dev) app configured for **static export**.
See the [repository README](../README.md) for deployment and template setup.

## Commands

```bash
bun install
bun run dev          # dev server on :3000 (webpack)
bun run build        # static export into out/
bun run start        # serve out/ locally, as GitHub Pages would
bun run types:check  # next typegen && tsc --noEmit
bun run lint
```

All Next.js commands use `--webpack`; see the repository README for why.

## Layout

- `content/docs/` — your MDX. This is the part you actually edit.
- `lib/source.ts` — content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api).
- `lib/shared.ts` — site name, repository info, and the `basePath` / `metadataBase` helpers.
- `lib/layout.shared.tsx` — shared layout options (nav title, GitHub link).

| Route                            | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| `app/(home)`                      | Landing page and other non-docs pages.             |
| `app/docs`                        | Documentation layout and pages.                    |
| `app/api/search/route.ts`         | Exports the search index as a static JSON file.    |
| `app/og/docs/[...slug]`           | Pre-renders an OG image per page.                  |
| `app/llms.txt`, `app/llms-full.txt` | LLM-readable index and full-text dump.           |
| `app/llms.mdx/docs/[[...slug]]`   | Raw markdown for each page, as static `.md` files. |

## Static export notes

`next.config.mjs` sets `output: 'export'`, `trailingSlash: true`, and
`images.unoptimized`. Consequences worth knowing:

- **No middleware.** `proxy.ts` was deleted; it cannot run without a server.
- **No dynamic route handlers.** Every route handler must be statically
  resolvable — give it `generateStaticParams()` and don't read the request.
- **Search runs in the browser.** `createFromSource(source).staticGET` writes the
  index to `out/api/search`; `app/layout.tsx` points the dialog at it with
  `type: 'static'`.
- **URLs need `basePath` manually.** `next/link` and the router apply it for you.
  Anything you hand to `fetch()` or embed in metadata does not — wrap it in
  `withBasePath()` from `lib/shared.ts`.

## Repository links

`gitConfig` in `lib/shared.ts` drives the nav's repo link and the "Edit this
page" link. Never hardcode `https://github.com/...` in a component — use
`repoUrl` and `sourceUrl(page.path)` from `lib/shared.ts` so a self-hosted
GitHub Enterprise Server host stays configurable in one place.

`contentPath` is the path from the **repository root** to `content/docs`, not
from `lib/shared.ts`. It defaults to `dev-docs/content/docs`; if you move or
rename this directory the edit links 404 until you update it.

Copy `.env.example` to `.env.local` if you want to test a `basePath` build locally.

## Learn more

- [Fumadocs](https://fumadocs.dev)
- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
