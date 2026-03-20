'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Skill } from '@/types';

interface RankingSectionProps {
  skills: Skill[];
}

function getActivityStatus(skill: Skill): { label: string; color: string } {
  const date = skill.lastCommitDate || skill.updatedAt;
  if (!date) return { label: 'Unknown', color: 'bg-muted' };

  const days = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days <= 30) return { label: 'Active', color: 'bg-green-500' };
  if (days <= 90) return { label: 'Maintained', color: 'bg-yellow-500' };
  return { label: 'Slow', color: 'bg-orange-500' };
}

export function RankingSection({ skills }: RankingSectionProps) {
  const [search, setSearch] = useState('');
  const [showCount, setShowCount] = useState(25);

  const rankedSkills = useMemo(() => {
    let filtered = skills
      .filter((s) => s.rank)
      .sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.author.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [skills, search]);

  const visible = rankedSkills.slice(0, showCount);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="font-mono text-terminal text-sm mb-2">// leaderboard</div>
            <h2 className="text-3xl font-bold">Skill Rankings</h2>
            <p className="text-muted mt-2">
              Ranked by stars, momentum, activity, community, and code health
            </p>
          </div>
          <Link
            href="/skills"
            className="group flex items-center gap-2 text-sm font-medium text-muted hover:text-terminal transition-colors"
          >
            View all
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.3-4.3" strokeWidth="2" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter rankings..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-terminal/30 focus:border-terminal/50 transition-all font-mono"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted font-mono w-16">#</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Skill</th>
                  <th className="text-center px-4 py-3 font-medium text-muted w-24">Score</th>
                  <th className="text-right px-4 py-3 font-medium text-muted w-24">Stars</th>
                  <th className="text-center px-4 py-3 font-medium text-muted w-28">Activity</th>
                  <th className="text-left px-4 py-3 font-medium text-muted hidden sm:table-cell">Category</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((skill) => {
                  const activity = getActivityStatus(skill);
                  return (
                    <tr
                      key={skill.id}
                      className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      {/* Rank */}
                      <td className="px-4 py-3">
                        <span className={`font-mono font-bold ${
                          skill.rank === 1 ? 'text-yellow-500' :
                          skill.rank === 2 ? 'text-gray-400' :
                          skill.rank === 3 ? 'text-amber-600' :
                          'text-muted'
                        }`}>
                          {skill.rank}
                        </span>
                      </td>
                      {/* Skill name */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/skills/${skill.slug}`}
                          className="group/link flex items-center gap-2"
                        >
                          <span className="font-medium group-hover/link:text-terminal transition-colors">
                            {skill.name}
                          </span>
                          {skill.isHot && (
                            <svg className="w-3.5 h-3.5 text-orange-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52.74-4.6 2.06-6.42.47-.65 1-1.26 1.58-1.82.25-.25.67-.08.68.28l.09 2.52c.01.32.42.47.62.22l3.59-4.53c.23-.29.64-.28.86.02 1.53 2.05 3.55 5.01 4.1 8.02.06.32.42.48.67.25.48-.44.89-.94 1.2-1.45.2-.33.66-.34.81.02C20.37 14.63 21 16.73 21 19c0 2.21-4.03 4-9 4z" />
                            </svg>
                          )}
                        </Link>
                        <div className="text-xs text-muted font-mono mt-0.5">{skill.author}</div>
                      </td>
                      {/* Score */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-border overflow-hidden">
                            <div
                              className="h-full rounded-full bg-terminal"
                              style={{ width: `${skill.rankScore || 0}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-muted w-7 text-right">
                            {skill.rankScore}
                          </span>
                        </div>
                      </td>
                      {/* Stars */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-muted">
                          {(skill.stars || 0).toLocaleString()}
                        </span>
                      </td>
                      {/* Activity */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                          <span className={`w-1.5 h-1.5 rounded-full ${activity.color}`} />
                          {activity.label}
                        </span>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded bg-secondary/80 text-muted font-mono border border-border/50">
                          {skill.category}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Show more */}
        {rankedSkills.length > showCount && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowCount((prev) => prev + 25)}
              className="px-6 py-2 rounded-lg border border-border bg-card text-sm font-medium text-muted hover:text-terminal hover:border-terminal/50 transition-all font-mono"
            >
              Show more ({rankedSkills.length - showCount} remaining)
            </button>
          </div>
        )}

        {visible.length === 0 && search && (
          <div className="py-8 text-center text-muted text-sm">
            No skills matching &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </section>
  );
}
