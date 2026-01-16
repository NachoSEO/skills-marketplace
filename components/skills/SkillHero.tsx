'use client';

import Link from 'next/link';
import type { Skill, Category } from '@/types';

interface SkillHeroProps {
  skill: Skill;
  category?: Category;
}

export function SkillHero({ skill, category }: SkillHeroProps) {
  const categoryColor = category?.color || '#10b981';

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient with category color */}
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15]"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${categoryColor}, transparent)`,
        }}
      />

      {/* Scan lines overlay */}
      <div className="absolute inset-0 scan-lines pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(${categoryColor}40 1px, transparent 1px),
            linear-gradient(90deg, ${categoryColor}40 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-8 flex-wrap font-mono">
          <Link href="/" className="hover:text-terminal transition-colors">
            ~
          </Link>
          <span className="text-terminal">/</span>
          <Link href="/skills" className="hover:text-terminal transition-colors">
            skills
          </Link>
          <span className="text-terminal">/</span>
          {category && (
            <>
              <Link
                href={`/categories/${category.slug}`}
                className="hover:text-terminal transition-colors"
                style={{ color: categoryColor }}
              >
                {category.slug}
              </Link>
              <span className="text-terminal">/</span>
            </>
          )}
          <span className="text-foreground">{skill.slug}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Left: Title and meta */}
          <div className="flex-1 max-w-3xl">
            {/* Featured badge */}
            {skill.featured && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terminal/10 border border-terminal/30 text-terminal text-sm font-medium mb-4 glow-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Featured Skill</span>
              </div>
            )}

            {/* Skill name with terminal prefix */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="text-terminal font-mono">./</span>
              {skill.name}
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-muted leading-relaxed mb-6">
              {skill.aiDescription || skill.description}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {/* Author */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-muted"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="font-mono">{skill.author}</span>
              </div>

              {/* Category */}
              {category && (
                <Link
                  href={`/categories/${category.slug}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <span>{category.name}</span>
                </Link>
              )}

              {/* Stars */}
              {skill.stars !== undefined && skill.stars > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">{skill.stars.toLocaleString()}</span>
                </div>
              )}

              {/* Language */}
              {skill.language && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        languageColors[skill.language] || '#6b7280',
                    }}
                  />
                  <span>{skill.language}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick stats card */}
          <div className="lg:w-64 shrink-0">
            <div className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                {skill.stars !== undefined && (
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatNumber(skill.stars)}
                    </div>
                    <div className="text-xs text-muted uppercase tracking-wider">
                      Stars
                    </div>
                  </div>
                )}
                {skill.forks !== undefined && (
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatNumber(skill.forks)}
                    </div>
                    <div className="text-xs text-muted uppercase tracking-wider">
                      Forks
                    </div>
                  </div>
                )}
                {skill.watchers !== undefined && (
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatNumber(skill.watchers)}
                    </div>
                    <div className="text-xs text-muted uppercase tracking-wider">
                      Watch
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Rust: '#dea584',
  Go: '#00add8',
  Ruby: '#cc342d',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Shell: '#89e051',
  Dockerfile: '#384d54',
};

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}
