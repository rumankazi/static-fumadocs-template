import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { appName, metadataBase, searchIndexRoute, withBasePath } from '@/lib/shared';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    template: `%s | ${appName}`,
    default: appName,
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          search={{
            options: {
              // client-side search over the index exported by `app/api/search`
              type: 'static',
              api: withBasePath(searchIndexRoute),
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
