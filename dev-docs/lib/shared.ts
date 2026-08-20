export const appName = 'My App';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';
export const searchIndexRoute = '/api/search';

// fill this with your actual repository info, for example:
export const gitConfig = {
  /**
   * Base URL of your Git host.
   *
   * Defaults to public GitHub. For GitHub Enterprise Server set your own
   * domain, e.g. `https://gh.your-org.com` — GHES uses the identical
   * `/<user>/<repo>/blob/<branch>/<path>` URL layout, so the host is the only
   * thing that changes. A bare hostname (`gh.your-org.com`) and an install
   * mounted on a subpath (`https://intranet.org.com/github`) both work.
   */
  host: process.env.NEXT_PUBLIC_GIT_HOST ?? 'https://github.com',
  user: 'rumankazi',
  repo: 'static-fumadocs-template',
  branch: 'main',
  /**
   * Path from the *repository root* to the docs content directory, used to
   * build "Edit on GitHub" links. Change this if you move or rename the app
   * directory — it is not the same as the path from this file.
   */
  contentPath: 'dev-docs/content/docs',
};

/**
 * Join a base URL with path segments, tolerating stray slashes and a missing
 * protocol on `gitConfig.host`.
 */
function joinUrl(base: string, ...segments: string[]): string {
  const origin = /^https?:\/\//i.test(base) ? base : `https://${base}`;

  return [origin.replace(/\/+$/, ''), ...segments.map((s) => s.replace(/^\/+|\/+$/g, ''))]
    .filter(Boolean)
    .join('/');
}

/** URL of the repository itself, e.g. `https://gh.your-org.com/user/repo`. */
export const repoUrl = joinUrl(gitConfig.host, gitConfig.user, gitConfig.repo);

/**
 * URL of a docs page's source file on the Git host.
 *
 * @param pagePath - `page.path` from the source loader, relative to the
 * content directory (e.g. `guides/install.mdx`).
 */
export function sourceUrl(pagePath: string): string {
  return joinUrl(repoUrl, 'blob', gitConfig.branch, gitConfig.contentPath, pagePath);
}

/**
 * Path prefix the site is served under, e.g. `/my-repo` on GitHub Pages project
 * sites. Kept in sync with `basePath` in `next.config.mjs`.
 *
 * `next/link`, `next/image` and the router apply `basePath` on their own — only
 * use this for URLs you hand to `fetch()` or embed in metadata, which don't.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function withBasePath(path: string): string {
  return `${basePath}${path}`;
}

/**
 * Absolute URL the site is deployed at, including `basePath`.
 * The deploy workflow sets this to the GitHub Pages URL.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * `metadataBase` for resolving relative OG/Twitter image URLs.
 *
 * Origin only: the URLs from `getPageImageUrl()` already carry `basePath`, so
 * including it here too would double the prefix.
 */
export const metadataBase = new URL(new URL(siteUrl).origin);
