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

      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono mb-4">
              Role
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{role.headline}</h1>
            <p className="text-lg text-muted max-w-3xl leading-relaxed mb-6">{role.intro}</p>

            {/* How-to box */}
            <div className="p-5 rounded-xl border border-terminal/20 bg-terminal/5 max-w-2xl">
              <h2 className="text-sm font-semibold text-terminal mb-2 font-mono uppercase tracking-wide">
                How to use these skills
              </h2>
              <p className="text-sm text-muted leading-relaxed">{role.howTo}</p>
            </div>
          </div>

          {/* Skill count + tags */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <p className="text-sm text-muted font-mono">
              <span className="text-terminal">{roleSkills.length}</span> skills for {role.title}s
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
            emptyMessage={`No skills found for ${role.title}`}
          />

          {/* Category links */}
          {role.categories.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border">
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

          {/* More roles link */}
          <div className="mt-16 pt-8 border-t border-border">
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
      </div>
    </>
  );
}
