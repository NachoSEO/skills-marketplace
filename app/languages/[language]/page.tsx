import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { getSkillsSync, getUniqueLanguages, getSkillsByLanguage } from '@/lib/skills';

const BASE_URL = 'https://skillsforge.dev';

interface Props {
  params: Promise<{ language: string }>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const languageColors: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  Shell: '#89E051',
  Go: '#00ADD8',
  Rust: '#DEA584',
  Ruby: '#CC342D',
  Java: '#B07219',
  'C++': '#F34B7D',
  C: '#555555',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Lua: '#000080',
};

export async function generateStaticParams() {
  const skills = getSkillsSync();
  const languages = getUniqueLanguages(skills);
  return languages.map((language) => ({ language: slugify(language) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language: languageSlug } = await params;
  const skills = getSkillsSync();
  const languages = getUniqueLanguages(skills);
  const language = languages.find((l) => slugify(l) === languageSlug);

  if (!language) {
    return { title: 'Language Not Found' };
  }

  const matchingSkills = getSkillsByLanguage(skills, language);

  return {
    title: `${language} Skills`,
    description: `Discover ${matchingSkills.length} Claude Code skills written in ${language}. Browse tools and extensions.`,
    alternates: {
      canonical: `/languages/${languageSlug}`,
    },
    openGraph: {
      title: `${language} Skills - SkillsForge`,
      description: `Discover ${matchingSkills.length} Claude Code skills written in ${language}.`,
    },
  };
}

export default async function LanguagePage({ params }: Props) {
  const { language: languageSlug } = await params;
  const skills = getSkillsSync();
  const languages = getUniqueLanguages(skills);
  const language = languages.find((l) => slugify(l) === languageSlug);

  if (!language) {
    notFound();
  }

  const languageSkills = getSkillsByLanguage(skills, language);
  const color = languageColors[language] || '#6e7681';

  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: 'Languages', url: `${BASE_URL}/languages` },
    { name: language, url: `${BASE_URL}/languages/${languageSlug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/languages" className="hover:text-foreground transition-colors">
              Languages
            </Link>
            <span>/</span>
            <span className="text-foreground">{language}</span>
          </nav>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h1 className="text-3xl sm:text-4xl font-bold">{language}</h1>
            </div>
            <p className="text-lg text-muted">
              {languageSkills.length} skill{languageSkills.length !== 1 ? 's' : ''} written in {language}
            </p>
          </div>

          <SkillGrid skills={languageSkills} />
        </div>
      </div>
    </>
  );
}
