'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { SearchBar } from '@/components/search/SearchBar';
import { getSkillsSync, getCategories, searchSkills, getFeaturedSkills } from '@/lib/skills';
import type { Skill } from '@/types';

function SkillsContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const featuredParam = searchParams.get('featured') === 'true';
  const categoryParam = searchParams.get('category') || '';

  const [sortBy, setSortBy] = useState<'name' | 'stars' | 'date'>('stars');

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

    switch (sortBy) {
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
  }, [allSkills, queryParam, featuredParam, categoryParam, sortBy]);

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
              onChange={(e) => setSortBy(e.target.value as 'name' | 'stars' | 'date')}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="stars">Sort by Stars</option>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted">
          Showing {filteredSkills.length} {filteredSkills.length === 1 ? 'skill' : 'skills'}
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
