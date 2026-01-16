import type { Metadata } from 'next';
import Link from 'next/link';
import { getSkillsSync, getLanguagesWithCounts } from '@/lib/skills';

export const metadata: Metadata = {
  title: 'Languages',
  description: 'Browse Claude Code skills by programming language. Find Python, TypeScript, JavaScript, and more.',
  alternates: {
    canonical: '/languages',
  },
};

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

export default function LanguagesPage() {
  const skills = getSkillsSync();
  const languagesWithCounts = getLanguagesWithCounts(skills);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-muted mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Languages</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Browse by Language</h1>
          <p className="text-lg text-muted">
            Explore skills written in {languagesWithCounts.length} programming languages
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {languagesWithCounts.map(({ language, count }) => (
            <Link
              key={language}
              href={`/languages/${slugify(language)}`}
              className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:bg-secondary/50 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: languageColors[language] || '#6e7681' }}
              />
              <span className="font-medium flex-1">{language}</span>
              <span className="text-sm text-muted">{count} skills</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
