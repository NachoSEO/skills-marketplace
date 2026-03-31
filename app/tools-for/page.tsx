import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { getRoles, getSkillsSync, getSkillsByRole } from '@/lib/skills';

const BASE_URL = 'https://skillsforge.dev';

export const metadata: Metadata = {
  title: 'Claude Code Skills by Role',
  description: 'Find the best Claude Code skills for your role — software engineer, data scientist, DevOps, frontend developer, AI engineer, and more.',
  alternates: { canonical: '/tools-for' },
  openGraph: {
    title: 'Claude Code Skills by Role | SkillsForge',
    description: 'Find the best Claude Code skills for your role — software engineer, data scientist, DevOps, frontend developer, AI engineer, and more.',
    type: 'website',
    url: `${BASE_URL}/tools-for`,
  },
};

export default function ToolsForIndexPage() {
  const roles = getRoles();
  const skills = getSkillsSync();

  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: 'Tools For', url: `${BASE_URL}/tools-for` },
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
            <span className="text-foreground">Tools For</span>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Skills by Role</h1>
            <p className="text-lg text-muted max-w-2xl">
              Curated Claude Code skill recommendations for every role — find tools built for how you work.
            </p>
          </div>

          {/* Role grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const count = getSkillsByRole(skills, role).length;
              return (
                <Link
                  key={role.slug}
                  href={`/tools-for/${role.slug}`}
                  className="group p-6 rounded-xl border border-border bg-card hover:border-terminal/50 transition-all"
                >
                  <h2 className="text-lg font-semibold mb-2 group-hover:text-terminal transition-colors">
                    {role.title}
                  </h2>
                  <p className="text-sm text-muted line-clamp-2 mb-4">{role.description}</p>
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
