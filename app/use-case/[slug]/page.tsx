import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { FAQJsonLd } from '@/components/seo/FAQJsonLd';
import { getSkillsSync, getUseCases, getUseCaseBySlug, getSkillsByUseCase } from '@/lib/skills';

const BASE_URL = 'https://skillsforge.dev';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const useCases = getUseCases();
  return useCases.map((uc) => ({ slug: uc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getUseCaseBySlug(slug);

  if (!useCase) {
    return { title: 'Not Found' };
  }

  return {
    title: useCase.headline,
    description: useCase.description,
    alternates: { canonical: `/use-case/${slug}` },
    openGraph: {
      title: `${useCase.headline} | SkillsForge`,
      description: useCase.description,
      type: 'website',
      url: `${BASE_URL}/use-case/${slug}`,
    },
  };
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params;
  const useCase = getUseCaseBySlug(slug);

  if (!useCase) {
    notFound();
  }

  const skills = getSkillsSync();
  const useCaseSkills = getSkillsByUseCase(skills, useCase);

  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: 'Use Cases', url: `${BASE_URL}/use-case` },
    { name: useCase.title, url: `${BASE_URL}/use-case/${slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {useCase.faq.length > 0 && <FAQJsonLd items={useCase.faq} />}

      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/use-case" className="hover:text-foreground transition-colors">
              Use Cases
            </Link>
            <span>/</span>
            <span className="text-foreground">{useCase.title}</span>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terminal/10 border border-terminal/20 text-terminal text-xs font-mono mb-4">
              Use Case
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{useCase.headline}</h1>
            <p className="text-lg text-muted max-w-3xl leading-relaxed">{useCase.intro}</p>
          </div>

          {/* Skill count + tags */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <p className="text-sm text-muted font-mono">
              <span className="text-terminal">{useCaseSkills.length}</span> skills found
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {useCase.tags.slice(0, 4).map((tag) => (
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
            skills={useCaseSkills}
            emptyMessage={`No skills found for ${useCase.title}`}
          />

          {/* Category links */}
          {useCase.categories.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
              <div className="flex flex-wrap gap-3">
                {useCase.categories.map((cat) => (
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

          {/* FAQ Section */}
          {useCase.faq.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
              <div className="space-y-6 max-w-3xl">
                {useCase.faq.map((item, i) => (
                  <div key={i} className="p-6 rounded-xl border border-border bg-card">
                    <h3 className="font-semibold mb-3 text-card-foreground">{item.question}</h3>
                    <p className="text-muted leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More use cases link */}
          <div className="mt-16 pt-8 border-t border-border">
            <Link
              href="/use-case"
              className="inline-flex items-center gap-2 text-terminal hover:text-terminal/80 transition-colors font-mono text-sm"
            >
              View all use cases
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
