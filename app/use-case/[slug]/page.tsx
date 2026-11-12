import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { FAQJsonLd } from '@/components/seo/FAQJsonLd';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
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
      <ItemListJsonLd
        skills={useCaseSkills}
        listName={useCase.headline}
        listUrl={`${BASE_URL}/use-case/${slug}`}
      />
      {useCase.faq.length > 0 && <FAQJsonLd items={useCase.faq} />}

      {/* Hero */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-terminal/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="max-w-3xl">
            <div className="font-mono text-terminal text-sm mb-3 opacity-70">// use_case</div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terminal/10 border border-terminal/20 text-terminal text-xs font-mono mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal" />
              Use Case
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">{useCase.headline}</h1>
            <p className="text-lg text-muted max-w-3xl leading-relaxed">{useCase.intro}</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Skill count + tags */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <p className="text-sm text-muted font-mono">
            <span className="text-terminal font-semibold">{useCaseSkills.length}</span> skills found
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
          emptyMessage={`No skills found for "${useCase.title}" yet`}
        />

        {/* Category links */}
        {useCase.categories.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border">
            <div className="font-mono text-terminal text-sm mb-3 opacity-70">// categories</div>
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
            <div className="font-mono text-terminal text-sm mb-3 opacity-70">// faq</div>
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl">
              {useCase.faq.map((item, i) => (
                <details key={i} className="group p-5 rounded-xl border border-border bg-card hover:border-terminal/30 transition-colors">
                  <summary className="font-semibold text-card-foreground cursor-pointer list-none flex items-center justify-between">
                    {item.question}
                    <svg className="w-5 h-5 text-muted shrink-0 ml-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-muted leading-relaxed mt-3 pt-3 border-t border-border/50">{item.answer}</p>
                </details>
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
                <h3 className="text-lg font-bold mb-1">Looking for more skills?</h3>
                <p className="text-sm text-muted">Browse the full marketplace or explore other use cases.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/skills"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-terminal text-primary-foreground font-medium text-sm hover:bg-terminal/90 transition-all hover:shadow-lg hover:shadow-terminal/20"
                >
                  Browse Skills
                </Link>
                <Link
                  href="/use-case"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-terminal/50 text-sm font-medium transition-colors"
                >
                  All Use Cases
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* More use cases link */}
        <div className="mt-8">
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
    </>
  );
}
