import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { getSkillsSync, getRoles, getRoleBySlug, getSkillsByRole } from '@/lib/skills';

const BASE_URL = 'https://skillsforge.dev';

interface Props {
  params: Promise<{ role: string }>;
}

export function generateStaticParams() {
  const roles = getRoles();
  return roles.map((r) => ({ role: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role: roleSlug } = await params;
  const role = getRoleBySlug(roleSlug);

  if (!role) {
    return { title: 'Not Found' };
  }

  return {
    title: role.headline,
    description: role.description,
    alternates: { canonical: `/tools-for/${roleSlug}` },
    openGraph: {
      title: `${role.headline} | SkillsForge`,
      description: role.description,
      type: 'website',
      url: `${BASE_URL}/tools-for/${roleSlug}`,
    },
  };
}

export default async function ToolsForRolePage({ params }: Props) {
  const { role: roleSlug } = await params;
  const role = getRoleBySlug(roleSlug);

  if (!role) {
    notFound();
  }

  const skills = getSkillsSync();
  const roleSkills = getSkillsByRole(skills, role);

  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: 'Tools For', url: `${BASE_URL}/tools-for` },
    { name: role.title, url: `${BASE_URL}/tools-for/${roleSlug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ItemListJsonLd
        skills={roleSkills}
        listName={role.headline}
        listUrl={`${BASE_URL}/tools-for/${roleSlug}`}
      />

      {/* Hero */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/tools-for" className="hover:text-foreground transition-colors">
              Tools For
            </Link>
            <span>/</span>
            <span className="text-foreground">{role.title}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="font-mono text-accent text-sm mb-3 opacity-70">// tools_for</div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Role
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">{role.headline}</h1>
            <p className="text-lg text-muted max-w-3xl leading-relaxed">{role.intro}</p>
          </div>

          {/* How-to box */}
          <div className="mt-8 p-5 rounded-xl border border-terminal/20 bg-terminal/5 max-w-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terminal/50 to-transparent" />
            <h2 className="text-sm font-semibold text-terminal mb-2 font-mono uppercase tracking-wide flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              How to use these skills
            </h2>
            <p className="text-sm text-muted leading-relaxed">{role.howTo}</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Skill count + tags */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <p className="text-sm text-muted font-mono">
            <span className="text-terminal font-semibold">{roleSkills.length}</span> skills for {role.title}s
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {role.tags.slice(0, 4).map((tag) => (
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
          skills={roleSkills}
          emptyMessage={`No skills found for ${role.title}s yet`}
        />

        {/* Category links */}
        {role.categories.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border">
            <div className="font-mono text-terminal text-sm mb-3 opacity-70">// categories</div>
            <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
            <div className="flex flex-wrap gap-3">
              {role.categories.map((cat) => (
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
          <div className="p-8 rounded-xl bg-gradient-to-br from-accent/5 via-card to-terminal/5 border border-border relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Need different tools?</h3>
                <p className="text-sm text-muted">Explore skills for other roles or browse the full marketplace.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/skills"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-terminal text-primary-foreground font-medium text-sm hover:bg-terminal/90 transition-all hover:shadow-lg hover:shadow-terminal/20"
                >
                  Browse Skills
                </Link>
                <Link
                  href="/tools-for"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-terminal/50 text-sm font-medium transition-colors"
                >
                  All Roles
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* More roles link */}
        <div className="mt-8">
          <Link
            href="/tools-for"
            className="inline-flex items-center gap-2 text-terminal hover:text-terminal/80 transition-colors font-mono text-sm"
          >
            View all roles
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
