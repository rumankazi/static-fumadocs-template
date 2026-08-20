import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Static export can't run a search endpoint. `staticGET` instead pre-builds the
// search index into a JSON file that the browser downloads and queries locally.
// The client half is wired up in `app/layout.tsx`.
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source);
