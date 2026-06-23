import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shared Todo Board',
  description: 'Build a Full Product tutorial companion app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Sets the mark synchronously so isWebview() returns true before the SDK bundle evaluates */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'window.__HOST_WEBVIEW_MARK__=true;',
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
