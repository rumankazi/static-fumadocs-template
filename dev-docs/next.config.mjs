import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// GitHub Pages project sites are served from https://<user>.github.io/<repo>,
// so every asset/link needs a `/<repo>` prefix. The deploy workflow sets this
// automatically; leave it empty for user/org sites or custom domains.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,

  // Emit a fully static site into `out/`.
  output: 'export',

  basePath,

  // Export `/docs/foo` as `out/docs/foo/index.html` instead of `out/docs/foo.html`.
  // Static hosts (GitHub Pages included) resolve directory indexes reliably.
  trailingSlash: true,

  // The Next.js image optimizer needs a server; there isn't one.
  images: { unoptimized: true },
};

export default withMDX(config);
