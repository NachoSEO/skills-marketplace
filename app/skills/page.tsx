'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { SearchBar } from '@/components/search/SearchBar';
import { getSkillsSync, getCategories, searchSkills, getFeaturedSkills } from '@/lib/skills';
import type { Skill } from '@/types';

type SortOption = 'rank' | 'stars' | 'name' | 'date';
type FilterTab = 'all' | 'trending' | 'hot';

function SkillsContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const featuredParam = searchParams.get('featured') === 'true';
  const categoryParam = searchParams.get('category') || '';

  const [sortBy, setSortBy] = useState<SortOption>('rank');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const allSkills = getSkillsSync();
  const categories = getCategories();

  const filteredSkills = useMemo(() => {
    let skills: Skill[] = allSkills;

    if (featuredParam) {
      skills = getFeaturedSkills(skills);
    }

    if (categoryParam) {
      skills = skills.filter((skill) => skill.category === categoryParam);
    }

    if (queryParam) {
      skills = searchSkills(skills, queryParam);
    }

    // Apply filter tab
    if (filterTab === 'trending') {
      skills = [...skills].sort((a, b) => (a.trendingRank || Infinity) - (b.trendingRank || Infinity));
    } else if (filterTab === 'hot') {
      skills = skills.filter((skill) => skill.isHot);
    }

    // Apply sort (unless trending tab already sorted)
    if (filterTab !== 'trending') {
      switch (sortBy) {
        case 'rank':
          return [...skills].sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));
        case 'name':
          return [...skills].sort((a, b) => a.name.localeCompare(b.name));
        case 'stars':
          return [...skills].sort((a, b) => (b.stars || 0) - (a.stars || 0));
        case 'date':
          return [...skills].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return skills;
      }
    }

    return skills;
  }, [allSkills, queryParam, featuredParam, categoryParam, sortBy, filterTab]);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            {featuredParam ? 'Featured Skills' : 'All Skills'}
          </h1>
          <p className="text-lg text-muted">
            {queryParam
              ? `Search results for "${queryParam}"`
              : featuredParam
              ? 'Hand-picked skills for your workflow'
              : `Browse ${allSkills.length}+ skills for Claude Code, Codex CLI, and ChatGPT`}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-lg bg-secondary/50 border border-border/50 w-fit">
          {([
            { key: 'all', label: 'All' },
            { key: 'trending', label: 'Trending' },
            { key: 'hot', label: 'Hot' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterTab(key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterTab === key
                  ? 'bg-card text-foreground shadow-sm border border-border/50'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {label === 'Hot' && (
                <svg className="w-3.5 h-3.5 inline mr-1 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52.74-4.6 2.06-6.42.47-.65 1-1.26 1.58-1.82.25-.25.67-.08.68.28l.09 2.52c.01.32.42.47.62.22l3.59-4.53c.23-.29.64-.28.86.02 1.53 2.05 3.55 5.01 4.1 8.02.06.32.42.48.67.25.48-.44.89-.94 1.2-1.45.2-.33.66-.34.81.02C20.37 14.63 21 16.73 21 19c0 2.21-4.03 4-9 4z" />
                </svg>
              )}
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <SearchBar placeholder="Search skills..." />
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={categoryParam || ''}
              onChange={(e) => {
                const url = new URL(window.location.href);
                if (e.target.value) {
                  url.searchParams.set('category', e.target.value);
                } else {
                  url.searchParams.delete('category');
                }
                window.history.pushState({}, '', url);
                window.location.reload();
              }}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={filterTab === 'trending'}
            >
              <option value="rank">Sort by Rank</option>
              <option value="stars">Sort by Stars</option>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted">
          Showing {filteredSkills.length} {filteredSkills.length === 1 ? 'skill' : 'skills'}
          {filterTab === 'hot' && ' (trending fast)'}
          {filterTab === 'trending' && ' (sorted by momentum)'}
        </div>

        <SkillGrid skills={filteredSkills} emptyMessage="No skills found matching your criteria" />
      </div>
    </div>
  );
}

export default function SkillsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-12"><div className="max-w-7xl mx-auto px-4">Loading...</div></div>}>
      <SkillsContent />
    </Suspense>
  );
}
