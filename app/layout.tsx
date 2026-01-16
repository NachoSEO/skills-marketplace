import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const BASE_URL = 'https://skills.claudecode.dev';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Claude Skills Marketplace',
    template: '%s | Claude Skills Marketplace',
  },
  description:
    'Discover and install 500+ skills for Claude Code, Codex CLI, and ChatGPT. Browse by category, search, and enhance your AI coding workflow.',
  keywords: [
    'Claude Code',
    'Claude Skills',
    'AI coding',
    'Codex CLI',
    'ChatGPT',
    'agent skills',
    'MCP',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Claude Skills Marketplace',
    description: 'Discover 500+ skills for Claude Code and other AI agents',
    type: 'website',
    url: BASE_URL,
    siteName: 'Claude Skills Marketplace',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Claude Skills Marketplace',
    description: 'Discover 500+ skills for Claude Code and other AI agents',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Claude Skills Marketplace',
  url: BASE_URL,
  description: 'Discover and install skills for Claude Code and other AI agents',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization JSON-LD is safe - static content serialized with JSON.stringify
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
