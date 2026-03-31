import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { getCollections, getSkillsSync, getSkillsByCollection } from '@/lib/skills';

const BASE_URL = 'https://skillsforge.dev';

export const metadata: Metadata = {
  title: 'Claude Code Skill Collections',
  description: 'Curated collections of Claude Code skills — productivity boosters, AI agents, MCP tools, SEO skills, security essentials, and more.',
  alternates: { canonical: '/collections' },
  openGraph: {
    title: 'Claude Code Skill Collections | SkillsForge',
    description: 'Curated collections of Claude Code skills — productivity boosters, AI agents, MCP tools, SEO skills, security essentials, and more.',
    type: 'website',
    url: `${BASE_URL}/collections`,
  },
};

export default function CollectionsIndexPage() {
  const collections = getCollections();
  const skills = getSkillsSync();

  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: 'Collections', url: `${BASE_URL}/collections` },
  ];

  const featured = collections.filter((c) => c.featured);
  const rest = collections.filter((c) => !c.featured);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Collections</span>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Skill Collections</h1>
            <p className="text-lg text-muted max-w-2xl">
              Handpicked groups of Claude Code skills for specific goals — curated so you don&apos;t have to search.
            </p>
          </div>

          {/* Featured collections */}
          {featured.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-6">Featured Collections</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                {featured.map((collection) => {
                  const count = getSkillsByCollection(skills, collection).length;
                  return (
                    <Link
                      key={collection.slug}
                      href={`/collections/${collection.slug}`}
                      className="group p-6 rounded-xl border border-border bg-card hover:border-terminal/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold group-hover:text-terminal transition-colors">
                          {collection.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-mono shrink-0 ml-3">
                          Featured
                        </span>
                      </div>
                      <p className="text-sm text-muted line-clamp-2 mb-4">{collection.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-terminal">{count} skills</span>
                        <svg className="w-4 h-4 text-muted group-hover:text-terminal transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* All collections */}
          <h2 className="text-xl font-semibold mb-6">All Collections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((collection) => {
              const count = getSkillsByCollection(skills, collection).length;
              return (
                <Link
                  key={collection.slug}
                  href={`/collections/${collection.slug}`}
                  className="group p-6 rounded-xl border border-border bg-card hover:border-terminal/50 transition-all"
                >
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-terminal transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2 mb-4">{collection.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-terminal">{count} skills</span>
                    <svg className="w-4 h-4 text-muted group-hover:text-terminal transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
