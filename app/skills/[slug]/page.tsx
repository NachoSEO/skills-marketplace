import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SkillHero } from '@/components/skills/SkillHero';
import { InstallPanel } from '@/components/skills/InstallPanel';
import { FeatureGrid } from '@/components/skills/FeatureGrid';
import { TechSpec } from '@/components/skills/TechSpec';
import { SkillTags } from '@/components/skills/SkillTags';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { MarkdownContent } from '@/components/skills/MarkdownContent';
import { SkillJsonLd } from '@/components/seo/SkillJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { AlternativesSection } from '@/components/skills/AlternativesSection';
import {
  getSkillsSync,
  getSkillBySlug,
  getCategoryBySlug,
  getRelatedSkills,
  getAlternativeSkills,
} from '@/lib/skills';

const BASE_URL = 'https://skills.claudecode.dev';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const skills = getSkillsSync();
  return skills.map((skill) => ({
    slug: skill.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const skills = getSkillsSync();
  const skill = getSkillBySlug(skills, slug);

  if (!skill) {
    return {
      title: 'Skill Not Found',
    };
  }

  return {
    title: skill.name,
    description: skill.aiDescription || skill.description,
    alternates: {
      canonical: `/skills/${skill.slug}`,
    },
    openGraph: {
      title: `${skill.name} - Claude Skills Marketplace`,
      description: skill.aiDescription || skill.description,
      type: 'website',
      url: `${BASE_URL}/skills/${skill.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${skill.name} - Claude Skills Marketplace`,
      description: skill.aiDescription || skill.description,
    },
  };
}

export default async function SkillPage({ params }: Props) {
  const { slug } = await params;
  const skills = getSkillsSync();
  const skill = getSkillBySlug(skills, slug);

  if (!skill) {
    notFound();
  }

  const category = getCategoryBySlug(skill.category);
  const relatedSkills = getRelatedSkills(skills, skill, 3);
  const relatedSkillIds = relatedSkills.map((s) => s.id);
  const alternativeSkills = getAlternativeSkills(skills, skill, relatedSkillIds, 3);

  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: 'Skills', url: `${BASE_URL}/skills` },
    ...(category ? [{ name: category.name, url: `${BASE_URL}/categories/${category.slug}` }] : []),
    { name: skill.name, url: `${BASE_URL}/skills/${skill.slug}` },
  ];

  return (
    <>
      <SkillJsonLd skill={skill} category={category} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Hero Section */}
      <SkillHero skill={skill} category={category} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Tags */}
            <section className="fade-in-up">
              <SkillTags tags={skill.tags} />
            </section>

            {/* Pros/Cons */}
            {(skill.pros?.length || skill.cons?.length) && (
              <section className="fade-in-up stagger-1">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-terminal font-mono">&gt;</span>
                  Overview
                </h2>
                <FeatureGrid pros={skill.pros} cons={skill.cons} />
              </section>
            )}

            {/* SEO Content / Extended Description */}
            {skill.seoContent && (
              <section className="fade-in-up stagger-2">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-terminal font-mono">&gt;</span>
                  About this Skill
                </h2>
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <MarkdownContent content={skill.seoContent} />
                </div>
              </section>
            )}

            {/* Technical Specifications */}
            <section className="fade-in-up stagger-3">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-terminal font-mono">&gt;</span>
                Technical Details
              </h2>
              <TechSpec skill={skill} />
            </section>
          </div>

          {/* Right Column - Install Panel (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <InstallPanel skill={skill} />

              {/* Quick Links */}
              <div className="p-5 rounded-xl border border-border bg-card/50">
                <h3 className="text-sm font-semibold mb-4 text-muted uppercase tracking-wider">
                  Resources
                </h3>
                <div className="space-y-2">
                  <a
                    href={skill.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-muted group-hover:text-foreground transition-colors"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-sm">GitHub Repository</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 ml-auto text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </a>
                  <a
                    href={`${skill.githubUrl}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-muted group-hover:text-foreground transition-colors"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span className="text-sm">Report Issue</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 ml-auto text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </a>
                  {category && (
                    <Link
                      href={`/categories/${category.slug}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <span className="text-sm">Browse {category.name}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 ml-auto text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternatives Section */}
        <AlternativesSection
          alternatives={alternativeSkills}
          currentSkillName={skill.name}
        />

        {/* Related Skills */}
        {relatedSkills.length > 0 && (
          <section className="mt-16 pt-16 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-terminal font-mono">&gt;</span>
                Related Skills
              </h2>
              <Link
                href={`/categories/${skill.category}`}
                className="text-sm text-muted hover:text-terminal transition-colors"
              >
                View all in category →
              </Link>
            </div>
            <SkillGrid skills={relatedSkills} />
          </section>
        )}
      </div>
    </>
  );
}
