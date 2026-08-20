# static-fumadocs-template

A [Fumadocs](https://fumadocs.dev) documentation site that builds to **plain static
files** and deploys to **GitHub Pages** via GitHub Actions.

Click **Use this template** on GitHub, enable Pages, push. That's it.

- Next.js 16 static export (`output: 'export'`) — no server, no Node runtime at deploy time
- Builds with **webpack**, not Turbopack, so it runs on older Linux (no `GLIBC_2.29` errors)
- `basePath` is detected automatically, so it works under `https://<user>.github.io/<repo>`
- Client-side search, pre-rendered OG images, and `llms.txt` all still work

## Layout

```
.
├── .github/workflows/deploy.yml   # build + publish to GitHub Pages
└── dev-docs/                      # the Fumadocs app
    ├── app/                       # routes, layouts
    ├── content/docs/              # your MDX lives here
    ├── lib/shared.ts              # site name, GitHub info, basePath helpers
    └── next.config.mjs            # static export config
```

Put the docs app wherever you like — if you rename or move `dev-docs/`, update
`APP_DIR` at the top of `.github/workflows/deploy.yml` to match.

## Setup

### 1. Enable GitHub Pages

In the repository: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

This must be done before the first workflow run, otherwise `actions/configure-pages`
fails with a "Pages is not enabled" error.

### 2. Make it yours

Edit `dev-docs/lib/shared.ts`:

```ts
export const appName = 'My App';       // shown in the nav and OG images

export const gitConfig = {
  host: 'https://github.com',          // your Git host — see below
  user: 'your-username',               // powers the repo link and "Edit this page"
  repo: 'your-repo',
  branch: 'main',
  contentPath: 'dev-docs/content/docs',// path from the REPO ROOT to your MDX
};
```

#### GitHub Enterprise Server

Set `host` to your own domain:

```ts
host: 'https://gh.your-org.com',
```

GHES uses the same `/<user>/<repo>/blob/<branch>/<path>` URL layout as public
GitHub, so the host is the only thing that changes. A bare hostname
(`gh.your-org.com`), a trailing slash, and an install mounted on a subpath
(`https://intranet.org.com/github`) are all handled.

You can also override it per-build without editing code, which is useful if the
same docs are published to both a public and an internal host:

```bash
NEXT_PUBLIC_GIT_HOST=https://gh.your-org.com bun run build
```

Components never hardcode a host — they use `repoUrl` and `sourceUrl()` from
`lib/shared.ts`. Keep it that way when you add pages.

> **Note:** `contentPath` is relative to the repository root, not to
> `lib/shared.ts`. If you move or rename `dev-docs/`, update it or the "Edit
> this page" links will 404.

### 3. Write docs

Add MDX files under `dev-docs/content/docs/`. Frontmatter drives the title and description:

```mdx
---
title: Getting Started
description: How to install the thing
---

Your content here.
```

Use `meta.json` files to control sidebar ordering — see the
[Fumadocs page tree docs](https://fumadocs.dev/docs/ui/page-conventions).

### 4. Push

Every push to `main` builds and deploys. You can also trigger it by hand from the
**Actions** tab (**Run workflow**).

## Local development

```bash
cd dev-docs
bun install
bun run dev        # http://localhost:3000
```

To preview the actual static output rather than the dev server:

```bash
bun run build      # writes dev-docs/out/
bun run start      # serves out/ on http://localhost:3000
```

`bun run start` serves the exported files, so it's the closest thing to what
GitHub Pages will do. Use it before pushing if you touched routing or config.

## Deploying somewhere other than GitHub Pages

`dev-docs/out/` is a self-contained static site. Upload it anywhere — Netlify,
Cloudflare Pages, S3, nginx.

Two environment variables control URL generation at build time:

| Variable                | What it does                                        | Example                              |
| ----------------------- | --------------------------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_BASE_PATH` | Path prefix the site is served under. Empty at root. | `/my-repo`                           |
| `NEXT_PUBLIC_SITE_URL`  | Absolute site URL; sets `metadataBase` for OG images.| `https://user.github.io/my-repo`     |
| `NEXT_PUBLIC_GIT_HOST`  | Git host for repo and edit links. Overrides `gitConfig.host`. | `https://gh.your-org.com`   |

The GitHub Actions workflow fills both in from `actions/configure-pages`, so you
never set them by hand for Pages. See `dev-docs/.env.example` for local use.

If you serve from a **custom domain** or a **user/org site**
(`https://<user>.github.io`), the site lives at the root and `base_path` is
empty — the workflow handles that automatically too.

## Why `--webpack`

Next.js 16 defaults to Turbopack, which ships a prebuilt native binary requiring
`GLIBC_2.29` or newer. On older distributions (CentOS 7, Ubuntu 18.04, Debian 9,
and some corporate/air-gapped images) that binary fails to load:

```
Error: /lib64/libc.so.6: version `GLIBC_2.29' not found
```

Both `dev` and `build` scripts in `dev-docs/package.json` pass `--webpack`, which
uses the pure-JavaScript bundler instead. Slower, but it runs anywhere Node runs.

## What static export changes

A few Fumadocs defaults assume a server. Here's what this template does instead,
in case you add features later and hit the same walls:

| Feature       | Default (server)                  | Here (static)                                          |
| ------------- | --------------------------------- | ------------------------------------------------------ |
| Search        | `/api/search` queried per keystroke | Index exported to a JSON file, queried in the browser  |
| OG images     | Rendered per request              | Pre-rendered to PNG at build time                      |
| `.md` content | Middleware content negotiation    | Emitted as real `.md` files under `/llms.mdx/docs/`     |
| Images        | Next.js image optimizer           | `unoptimized: true`                                    |

`proxy.ts` (Next.js middleware) was removed — middleware cannot run in a static
export. The consequence is that `Accept: text/markdown` negotiation and the
`/docs/page.md` suffix no longer resolve. The **Copy Markdown** button and the
`/llms.mdx/docs/**/content.md` URLs still work, because those are real files.

Anything you add that needs a request at runtime — dynamic route handlers,
Server Actions, ISR, `cookies()`, `headers()` — will fail the build. That's
`output: 'export'` doing its job.
