import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { getComparePairs, getComparePairBySlug, getSkillsSync, getRelatedSkills } from '@/lib/skills';
import { sanitizeUserContent } from '@/lib/guardrails';
import type { Skill } from '@/types';

const BASE_URL = 'https://skillsforge.dev';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const pairs = getComparePairs();
  return pairs.map((pair) => ({ slug: `${pair.slugA}-vs-${pair.slugB}` }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = getComparePairBySlug(slug);

  if (!result) {
    return { title: 'Not Found' };
  }

  const { skillA, skillB } = result;
  const title = `${skillA.name} vs ${skillB.name}: Which is Better?`;
  const description = `Compare ${skillA.name} and ${skillB.name} side by side — features, use cases, categories, stars, and a recommendation to help you choose the right Claude Code skill.`;

  return {
    title,
    description,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title: `${title} | SkillsForge`,
      description,
      type: 'website',
      url: `${BASE_URL}/compare/${slug}`,
    },
  };
}

function CompareRow({
  label,
  valueA,
  valueB,
}: {
  label: string;
  valueA: React.ReactNode;
  valueB: React.ReactNode;
}) {
  return (
    <tr className="border-b border-border">
      <td className="py-3 px-4 text-sm text-muted font-medium w-1/4">{label}</td>
      <td className="py-3 px-4 text-sm text-card-foreground w-3/8">{valueA}</td>
      <td className="py-3 px-4 text-sm text-card-foreground w-3/8">{valueB}</td>
    </tr>
  );
}

function ProConList({ items, type }: { items?: string[]; type: 'pro' | 'con' }) {
  if (!items || items.length === 0) {
    return <span className="text-muted text-sm">Not specified</span>;
  }
  const color = type === 'pro' ? 'text-green-500' : 'text-red-400';
  const symbol = type === 'pro' ? '+' : '−';
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm flex items-start gap-2">
          <span className={`${color} font-bold shrink-0`}>{symbol}</span>
          <span className="text-muted">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StarBadge({ stars }: { stars?: number }) {
  if (!stars) return <span className="text-muted text-sm">—</span>;
  return (
    <span className="flex items-center gap-1 text-sm">
      <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="font-mono">{stars.toLocaleString()}</span>
    </span>
  );
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const result = getComparePairBySlug(slug);

  if (!result) {
    notFound();
  }

  const { pair, skillA, skillB } = result;
  const skills = getSkillsSync();

  const relatedA = getRelatedSkills(skills, skillA, 3);
  const relatedB = getRelatedSkills(skills, skillB, 3);
  const relatedAll = [...new Map([...relatedA, ...relatedB].map((r) => [r.skill.id, r])).values()]
    .slice(0, 6)
    .map((r) => r.skill);

  const winnerByStars: Skill | null =
    (skillA.stars || 0) !== (skillB.stars || 0)
      ? (skillA.stars || 0) > (skillB.stars || 0)
        ? skillA
        : skillB
      : null;

  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: 'Compare', url: `${BASE_URL}/compare` },
    { name: `${skillA.name} vs ${skillB.name}`, url: `${BASE_URL}/compare/${slug}` },
  ];

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
            <Link href="/compare" className="hover:text-foreground transition-colors">
              Compare
            </Link>
            <span>/</span>
            <span className="text-foreground">{skillA.name} vs {skillB.name}</span>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono mb-4">
              Comparison
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {skillA.name} vs {skillB.name}
            </h1>
            <p className="text-lg text-muted max-w-3xl">
              Compare these two Claude Code skills side by side — features, use cases, stars, and a recommendation to help you choose.
            </p>
          </div>

          {/* Quick stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[skillA, skillB].map((skill) => (
              <Link
                key={skill.id}
                href={`/skills/${skill.slug}`}
                className="group p-6 rounded-xl border border-border bg-card hover:border-terminal/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold group-hover:text-terminal transition-colors">
                    {skill.name}
                  </h2>
                  <StarBadge stars={skill.stars} />
                </div>
                <p className="text-sm text-muted line-clamp-3 mb-4">
                  {sanitizeUserContent(skill.aiDescription || skill.description)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted/10 text-muted border border-border font-mono">
                    {skill.category}
                  </span>
                  {skill.language && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted/10 text-muted border border-border font-mono">
                      {skill.language}
                    </span>
                  )}
                  {skill.license && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted/10 text-muted border border-border font-mono">
                      {skill.license}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Comparison table */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Feature Comparison</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full bg-card">
                <thead>
                  <tr className="border-b border-border bg-muted/5">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-muted w-1/4">Feature</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold w-3/8">
                      <Link href={`/skills/${skillA.slug}`} className="hover:text-terminal transition-colors">
                        {skillA.name}
                      </Link>
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold w-3/8">
                      <Link href={`/skills/${skillB.slug}`} className="hover:text-terminal transition-colors">
                        {skillB.name}
                      </Link>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <CompareRow
                    label="Category"
                    valueA={
                      <Link href={`/categories/${skillA.category}`} className="text-terminal hover:underline font-mono text-xs">
                        {skillA.category}
                      </Link>
                    }
                    valueB={
                      <Link href={`/categories/${skillB.category}`} className="text-terminal hover:underline font-mono text-xs">
                        {skillB.category}
                      </Link>
                    }
                  />
                  <CompareRow
                    label="Stars"
                    valueA={<StarBadge stars={skillA.stars} />}
                    valueB={<StarBadge stars={skillB.stars} />}
                  />
                  <CompareRow
                    label="Language"
                    valueA={<span className="font-mono text-xs">{skillA.language || '—'}</span>}
                    valueB={<span className="font-mono text-xs">{skillB.language || '—'}</span>}
                  />
                  <CompareRow
                    label="License"
                    valueA={<span className="font-mono text-xs">{skillA.license || '—'}</span>}
                    valueB={<span className="font-mono text-xs">{skillB.license || '—'}</span>}
                  />
                  <CompareRow
                    label="Tags"
                    valueA={
                      <div className="flex flex-wrap gap-1">
                        {skillA.tags.slice(0, 4).map((t) => (
                          <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted/10 text-muted border border-border font-mono">{t}</span>
                        ))}
                      </div>
                    }
                    valueB={
                      <div className="flex flex-wrap gap-1">
                        {skillB.tags.slice(0, 4).map((t) => (
                          <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted/10 text-muted border border-border font-mono">{t}</span>
                        ))}
                      </div>
                    }
                  />
                  <CompareRow
                    label="Forks"
                    valueA={<span className="font-mono text-xs">{skillA.forks?.toLocaleString() || '—'}</span>}
                    valueB={<span className="font-mono text-xs">{skillB.forks?.toLocaleString() || '—'}</span>}
                  />
                  <CompareRow
                    label="Author"
                    valueA={<span className="font-mono text-xs">{skillA.author}</span>}
                    valueB={<span className="font-mono text-xs">{skillB.author}</span>}
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[skillA, skillB].map((skill) => (
              <div key={skill.id} className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-bold mb-5 text-lg">{skill.name}</h3>
                <div className="mb-5">
                  <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-3 font-mono">Pros</p>
                  <ProConList items={skill.pros} type="pro" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3 font-mono">Cons</p>
                  <ProConList items={skill.cons} type="con" />
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="p-6 rounded-xl border border-terminal/30 bg-terminal/5 mb-12">
            <h2 className="text-xl font-bold mb-3">Our Recommendation</h2>
            {winnerByStars ? (
              <p className="text-muted leading-relaxed">
                Based on community adoption,{' '}
                <Link href={`/skills/${winnerByStars.slug}`} className="text-terminal hover:underline font-semibold">
                  {winnerByStars.name}
                </Link>{' '}
                is the more popular choice with{' '}
                <span className="font-mono text-terminal">{winnerByStars.stars?.toLocaleString()}</span> stars.
                {' '}Both skills are in the{' '}
                <span className="font-mono">{pair.reason.toLowerCase()}</span>.
                Try both and see which fits your workflow better — install commands are on each skill&apos;s page.
              </p>
            ) : (
              <p className="text-muted leading-relaxed">
                Both skills are closely matched. {pair.reason}. Try both and pick the one that best fits your existing setup and preferences.
              </p>
            )}
          </div>

          {/* Related skills */}
          {relatedAll.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="text-xl font-semibold mb-6">Related Skills You Might Like</h2>
              <SkillGrid skills={relatedAll} />
            </div>
          )}

          {/* More comparisons link */}
          <div className="mt-16 pt-8 border-t border-border">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 text-terminal hover:text-terminal/80 transition-colors font-mono text-sm"
            >
              View all comparisons
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
