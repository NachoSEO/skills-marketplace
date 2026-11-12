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
  winner,
}: {
  label: string;
  valueA: React.ReactNode;
  valueB: React.ReactNode;
  winner?: 'a' | 'b' | null;
}) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="py-3 px-4 text-sm text-muted font-medium w-1/4">{label}</td>
      <td className={`py-3 px-4 text-sm w-3/8 ${winner === 'a' ? 'text-terminal font-medium' : 'text-card-foreground'}`}>
        <span className="flex items-center gap-1.5">
          {winner === 'a' && (
            <svg className="w-3.5 h-3.5 text-terminal shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
          {valueA}
        </span>
      </td>
      <td className={`py-3 px-4 text-sm w-3/8 ${winner === 'b' ? 'text-terminal font-medium' : 'text-card-foreground'}`}>
        <span className="flex items-center gap-1.5">
          {winner === 'b' && (
            <svg className="w-3.5 h-3.5 text-terminal shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
          {valueB}
        </span>
      </td>
    </tr>
  );
}

function MobileCompareCard({
  label,
  valueA,
  valueB,
  nameA,
  nameB,
}: {
  label: string;
  valueA: React.ReactNode;
  valueB: React.ReactNode;
  nameA: string;
  nameB: string;
}) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <p className="text-xs text-muted font-mono uppercase tracking-wide mb-3">{label}</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-muted mb-1 font-mono">{nameA}</p>
          <div className="text-sm">{valueA}</div>
        </div>
        <div>
          <p className="text-[10px] text-muted mb-1 font-mono">{nameB}</p>
          <div className="text-sm">{valueB}</div>
        </div>
      </div>
    </div>
  );
}

function ProConList({ items, type }: { items?: string[]; type: 'pro' | 'con' }) {
  if (!items || items.length === 0) {
    return <span className="text-muted text-sm">Not specified</span>;
  }
  const color = type === 'pro' ? 'text-green-500' : 'text-red-400';
  const symbol = type === 'pro' ? '+' : '\u2212';
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-sm flex items-start gap-2">
          <span className={`${color} font-bold shrink-0 mt-0.5`}>{symbol}</span>
          <span className="text-muted">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StarBadge({ stars }: { stars?: number }) {
  if (!stars) return <span className="text-muted text-sm">&mdash;</span>;
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

  const starsA = skillA.stars || 0;
  const starsB = skillB.stars || 0;
  const winnerByStars: Skill | null =
    starsA !== starsB ? (starsA > starsB ? skillA : skillB) : null;
  const starsWinner: 'a' | 'b' | null = starsA !== starsB ? (starsA > starsB ? 'a' : 'b') : null;
  const forksA = skillA.forks || 0;
  const forksB = skillB.forks || 0;
  const forksWinner: 'a' | 'b' | null = forksA !== forksB ? (forksA > forksB ? 'a' : 'b') : null;

  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: 'Compare', url: `${BASE_URL}/compare` },
    { name: `${skillA.name} vs ${skillB.name}`, url: `${BASE_URL}/compare/${slug}` },
  ];

  const compareData = [
    {
      label: 'Category',
      valueA: <Link href={`/categories/${skillA.category}`} className="text-terminal hover:underline font-mono text-xs">{skillA.category}</Link>,
      valueB: <Link href={`/categories/${skillB.category}`} className="text-terminal hover:underline font-mono text-xs">{skillB.category}</Link>,
      winner: null as 'a' | 'b' | null,
    },
    {
      label: 'Stars',
      valueA: <StarBadge stars={skillA.stars} />,
      valueB: <StarBadge stars={skillB.stars} />,
      winner: starsWinner,
    },
    {
      label: 'Language',
      valueA: <span className="font-mono text-xs">{skillA.language || '\u2014'}</span>,
      valueB: <span className="font-mono text-xs">{skillB.language || '\u2014'}</span>,
      winner: null as 'a' | 'b' | null,
    },
    {
      label: 'License',
      valueA: <span className="font-mono text-xs">{skillA.license || '\u2014'}</span>,
      valueB: <span className="font-mono text-xs">{skillB.license || '\u2014'}</span>,
      winner: null as 'a' | 'b' | null,
    },
    {
      label: 'Tags',
      valueA: (
        <div className="flex flex-wrap gap-1">
          {skillA.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted/10 text-muted border border-border font-mono">{t}</span>
          ))}
        </div>
      ),
      valueB: (
        <div className="flex flex-wrap gap-1">
          {skillB.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted/10 text-muted border border-border font-mono">{t}</span>
          ))}
        </div>
      ),
      winner: null as 'a' | 'b' | null,
    },
    {
      label: 'Forks',
      valueA: <span className="font-mono text-xs">{forksA ? forksA.toLocaleString() : '\u2014'}</span>,
      valueB: <span className="font-mono text-xs">{forksB ? forksB.toLocaleString() : '\u2014'}</span>,
      winner: forksWinner,
    },
    {
      label: 'Author',
      valueA: <span className="font-mono text-xs">{skillA.author}</span>,
      valueB: <span className="font-mono text-xs">{skillB.author}</span>,
      winner: null as 'a' | 'b' | null,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Hero */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-terminal/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="max-w-3xl">
            <div className="font-mono text-accent text-sm mb-3 opacity-70">// compare</div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono mb-4">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Comparison
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
              {skillA.name} <span className="text-muted font-normal">vs</span> {skillB.name}
            </h1>
            <p className="text-lg text-muted max-w-3xl">
              Compare these two Claude Code skills side by side &mdash; features, use cases, stars, and a recommendation to help you choose.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Quick stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { skill: skillA, isWinner: winnerByStars === skillA },
            { skill: skillB, isWinner: winnerByStars === skillB },
          ].map(({ skill, isWinner }) => (
            <Link
              key={skill.id}
              href={`/skills/${skill.slug}`}
              className={`group relative p-6 rounded-xl border bg-card transition-all overflow-hidden ${
                isWinner
                  ? 'border-terminal/40 hover:border-terminal/70'
                  : 'border-border hover:border-terminal/50'
              }`}
            >
              {isWinner && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terminal to-transparent" />
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isWinner && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-terminal/15 text-terminal border border-terminal/30">
                      TOP PICK
                    </span>
                  )}
                  <h2 className="text-xl font-bold group-hover:text-terminal transition-colors">
                    {skill.name}
                  </h2>
                </div>
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
              {/* Arrow indicator on hover */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <svg className="w-5 h-5 text-terminal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Comparison table — desktop */}
        <div className="mb-12">
          <div className="font-mono text-terminal text-sm mb-3 opacity-70">// comparison</div>
          <h2 className="text-2xl font-bold mb-6">Feature Comparison</h2>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
            <table className="w-full bg-card">
              <thead>
                <tr className="border-b border-border bg-muted/5">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted w-1/4">Feature</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold w-3/8">
                    <Link href={`/skills/${skillA.slug}`} className="hover:text-terminal transition-colors inline-flex items-center gap-1.5">
                      {skillA.name}
                      {winnerByStars === skillA && (
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-terminal/15 text-terminal border border-terminal/30">TOP</span>
                      )}
                    </Link>
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold w-3/8">
                    <Link href={`/skills/${skillB.slug}`} className="hover:text-terminal transition-colors inline-flex items-center gap-1.5">
                      {skillB.name}
                      {winnerByStars === skillB && (
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-terminal/15 text-terminal border border-terminal/30">TOP</span>
                      )}
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareData.map((row) => (
                  <CompareRow key={row.label} label={row.label} valueA={row.valueA} valueB={row.valueB} winner={row.winner} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {compareData.map((row) => (
              <MobileCompareCard
                key={row.label}
                label={row.label}
                valueA={row.valueA}
                valueB={row.valueB}
                nameA={skillA.name}
                nameB={skillB.name}
              />
            ))}
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="mb-12">
          <div className="font-mono text-terminal text-sm mb-3 opacity-70">// pros_cons</div>
          <h2 className="text-2xl font-bold mb-6">Strengths & Weaknesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[skillA, skillB].map((skill) => (
              <div key={skill.id} className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-bold mb-5 text-lg flex items-center gap-2">
                  <Link href={`/skills/${skill.slug}`} className="hover:text-terminal transition-colors">
                    {skill.name}
                  </Link>
                </h3>
                <div className="mb-5">
                  <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-3 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Pros
                  </p>
                  <ProConList items={skill.pros} type="pro" />
                </div>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Cons
                  </p>
                  <ProConList items={skill.cons} type="con" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="p-6 sm:p-8 rounded-xl border border-terminal/30 bg-terminal/5 mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terminal to-transparent" />
          <div className="absolute inset-0 grid-bg opacity-10" />
          <div className="relative">
            <div className="font-mono text-terminal text-sm mb-3 opacity-70">// verdict</div>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-terminal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Our Recommendation
            </h2>
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
                Try both and see which fits your workflow better &mdash; install commands are on each skill&apos;s page.
              </p>
            ) : (
              <p className="text-muted leading-relaxed">
                Both skills are closely matched. {pair.reason}. Try both and pick the one that best fits your existing setup and preferences.
              </p>
            )}
          </div>
        </div>

        {/* Related skills */}
        {relatedAll.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="font-mono text-terminal text-sm mb-3 opacity-70">// related</div>
            <h2 className="text-xl font-semibold mb-6">Related Skills You Might Like</h2>
            <SkillGrid skills={relatedAll} />
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="p-8 rounded-xl bg-gradient-to-br from-accent/5 via-card to-terminal/5 border border-border relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Want to compare other skills?</h3>
                <p className="text-sm text-muted">See all available comparisons or browse the marketplace.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/skills"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-terminal text-primary-foreground font-medium text-sm hover:bg-terminal/90 transition-all hover:shadow-lg hover:shadow-terminal/20"
                >
                  Browse Skills
                </Link>
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-terminal/50 text-sm font-medium transition-colors"
                >
                  All Comparisons
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* More comparisons link */}
        <div className="mt-8">
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
    </>
  );
}
