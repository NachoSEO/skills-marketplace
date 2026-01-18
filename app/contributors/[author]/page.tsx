import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { getSkillsSync, getSkillsByAuthor, getContributorsWithStats, getContributorByAuthor } from '@/lib/skills';

interface Props {
  params: Promise<{ author: string }>;
}

export async function generateStaticParams() {
  const skills = getSkillsSync();
  const contributors = getContributorsWithStats(skills);
  return contributors.map((contributor) => ({
    author: contributor.author,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { author } = await params;
  const skills = getSkillsSync();
  const contributor = getContributorByAuthor(skills, author);

  if (!contributor) {
    return {
      title: 'Contributor Not Found',
    };
  }

  return {
    title: `${author} - Claude Code Skills Contributor`,
    description: `${author} has contributed ${contributor.skillCount} skill${contributor.skillCount !== 1 ? 's' : ''} with ${contributor.totalStars.toLocaleString()} total stars.`,
  };
}

export default async function ContributorPage({ params }: Props) {
  const { author } = await params;
  const skills = getSkillsSync();
  const contributor = getContributorByAuthor(skills, author);

  if (!contributor) {
    notFound();
  }

  const authorSkills = getSkillsByAuthor(skills, author);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-muted mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/contributors" className="hover:text-foreground transition-colors">
            Contributors
          </Link>
          <span>/</span>
          <span className="text-foreground">{author}</span>
        </nav>

        {/* Contributor header */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-12 p-6 rounded-xl border border-border bg-card">
          <Image
            src={`https://github.com/${author}.png`}
            alt={author}
            width={120}
            height={120}
            className="rounded-xl ring-2 ring-border"
          />
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{author}</h1>
            <p className="text-muted font-mono mb-4">@{author}</p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-terminal"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                <span className="font-medium">{contributor.skillCount}</span>
                <span className="text-muted">{contributor.skillCount === 1 ? 'skill' : 'skills'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-yellow-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{contributor.totalStars.toLocaleString()}</span>
                <span className="text-muted">total stars</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-muted"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span className="font-medium">{contributor.categories.length}</span>
                <span className="text-muted">{contributor.categories.length === 1 ? 'category' : 'categories'}</span>
              </div>
            </div>

            {/* Languages */}
            {contributor.languages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {contributor.languages.map((language) => (
                  <span
                    key={language}
                    className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground font-mono border border-border/50"
                  >
                    {language}
                  </span>
                ))}
              </div>
            )}

            {/* GitHub link */}
            <a
              href={`https://github.com/${author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-secondary hover:bg-terminal hover:text-primary-foreground border border-border hover:border-terminal transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View GitHub Profile
            </a>
          </div>
        </div>

        {/* Skills grid */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Skills by {author}</h2>
          <SkillGrid
            skills={authorSkills}
            emptyMessage={`No skills found for ${author}`}
          />
        </div>
      </div>
    </div>
  );
}
