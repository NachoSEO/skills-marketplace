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

      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terminal/10 border border-terminal/20 text-terminal text-xs font-mono">
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{collection.headline}</h1>
            <p className="text-lg text-muted max-w-3xl leading-relaxed">{collection.intro}</p>
          </div>

          {/* Skill count + tags */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <p className="text-sm text-muted font-mono">
              <span className="text-terminal">{collectionSkills.length}</span> skills in this collection
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
            emptyMessage={`No skills found in ${collection.title}`}
          />

          {/* Category links */}
          {collection.categories.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border">
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

          {/* Browse more collections */}
          <div className="mt-16 pt-8 border-t border-border">
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
      </div>
    </>
  );
}
