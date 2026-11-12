import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { getSkillsSync, getCollections, getCollectionBySlug, getSkillsByCollection } from '@/lib/skills';

const BASE_URL = 'https://skillsforge.dev';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const collections = getCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return { title: 'Not Found' };
  }

  return {
    title: collection.headline,
    description: collection.description,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title: `${collection.headline} | SkillsForge`,
      description: collection.description,
      type: 'website',
      url: `${BASE_URL}/collections/${slug}`,
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const skills = getSkillsSync();
  const collectionSkills = getSkillsByCollection(skills, collection);

  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: 'Collections', url: `${BASE_URL}/collections` },
    { name: collection.title, url: `${BASE_URL}/collections/${slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ItemListJsonLd
        skills={collectionSkills}
        listName={collection.headline}
        listUrl={`${BASE_URL}/collections/${slug}`}
      />

      {/* Hero */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-terminal/5 via-transparent to-transparent" />
        {collection.featured && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-foreground transition-colors">
              Collections
            </Link>
            <span>/</span>
            <span className="text-foreground">{collection.title}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="font-mono text-terminal text-sm mb-3 opacity-70">// collection</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terminal/10 border border-terminal/20 text-terminal text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-terminal" />
                Collection
              </div>
              {collection.featured && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-mono">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Featured
                </div>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">{collection.headline}</h1>
            <p className="text-lg text-muted max-w-3xl leading-relaxed">{collection.intro}</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Skill count + tags */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <p className="text-sm text-muted font-mono">
            <span className="text-terminal font-semibold">{collectionSkills.length}</span> skills in this collection
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {collection.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-muted/10 text-muted border border-border font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Skill grid */}
        <SkillGrid
          skills={collectionSkills}
          emptyMessage={`No skills found in "${collection.title}" yet`}
        />

        {/* Category links */}
        {collection.categories.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border">
            <div className="font-mono text-terminal text-sm mb-3 opacity-70">// categories</div>
            <h2 className="text-xl font-semibold mb-4">Related Categories</h2>
            <div className="flex flex-wrap gap-3">
              {collection.categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/categories/${cat}`}
                  className="px-4 py-2 rounded-lg border border-border hover:border-terminal/50 hover:text-terminal transition-colors text-sm font-mono"
                >
                  {cat.replace(/-/g, ' ')}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="p-8 rounded-xl bg-gradient-to-br from-terminal/5 via-card to-accent/5 border border-border relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Explore more collections</h3>
                <p className="text-sm text-muted">Discover curated skill packs for every workflow.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/skills"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-terminal text-primary-foreground font-medium text-sm hover:bg-terminal/90 transition-all hover:shadow-lg hover:shadow-terminal/20"
                >
                  Browse Skills
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-terminal/50 text-sm font-medium transition-colors"
                >
                  All Collections
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Browse more collections */}
        <div className="mt-8">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-terminal hover:text-terminal/80 transition-colors font-mono text-sm"
          >
            View all collections
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
