'use client';

import { useState, useTransition, useMemo } from 'react';
import type { Category } from '@/types';
import type { DiscoveredSkill } from '@/lib/admin/github-search';
import type { RepoType } from '@/lib/admin/category-detector';
import { discoverSkillsAction, bulkAddSkillsAction } from '@/app/admin/actions';
import { DiscoveredSkillCard } from './DiscoveredSkillCard';

interface DiscoverSkillsListProps {
  initialSkills: DiscoveredSkill[];
  categories: Category[];
}

interface SelectedSkill {
  skill: DiscoveredSkill;
  category: string;
  path?: string;
}

type FilterType = 'all' | RepoType;

export function DiscoverSkillsList({ initialSkills, categories }: DiscoverSkillsListProps) {
  const [skills, setSkills] = useState(initialSkills);
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedCount, setAddedCount] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<Map<string, SelectedSkill>>(new Map());
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');

  // Filter skills by type
  const filteredSkills = useMemo(() => {
    if (typeFilter === 'all') return skills;
    return skills.filter((s) => s.repoType === typeFilter);
  }, [skills, typeFilter]);

  // Count by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: skills.length };
    for (const skill of skills) {
      const type = skill.repoType || 'related-repo';
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }, [skills]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSelectedSkills(new Map());

    startTransition(async () => {
      const result = await discoverSkillsAction(query || undefined);
      if (result.success && result.data) {
        setSkills(result.data);
      } else {
        setError(result.error || 'Failed to search');
      }
    });
  };

  const handleRefresh = () => {
    setQuery('');
    setError(null);
    setSelectedSkills(new Map());

    startTransition(async () => {
      const result = await discoverSkillsAction();
      if (result.success && result.data) {
        setSkills(result.data);
      } else {
        setError(result.error || 'Failed to refresh');
      }
    });
  };

  const handleSelectionChange = (
    skill: DiscoveredSkill,
    selected: boolean,
    category: string,
    path?: string
  ) => {
    setSelectedSkills((prev) => {
      const next = new Map(prev);
      if (selected && category) {
        next.set(skill.url, { skill, category, path });
      } else {
        next.delete(skill.url);
      }
      return next;
    });
  };

  const handleSelectAllWithCategory = () => {
    const newSelected = new Map(selectedSkills);
    for (const skill of filteredSkills) {
      if (skill.detectedCategory && !newSelected.has(skill.url)) {
        newSelected.set(skill.url, {
          skill,
          category: skill.detectedCategory,
          path: skill.skillPaths?.[0],
        });
      }
    }
    setSelectedSkills(newSelected);
  };

  const handleDeselectAll = () => {
    setSelectedSkills(new Map());
  };

  const handleBulkAdd = async () => {
    if (selectedSkills.size === 0) return;

    setIsAdding(true);
    setError(null);

    const skillsToAdd = Array.from(selectedSkills.values());
    const result = await bulkAddSkillsAction(skillsToAdd);

    setIsAdding(false);

    if (result.success && result.data) {
      setAddedCount((prev) => prev + result.data!.added);
      // Remove added skills from the list
      const addedUrls = new Set(skillsToAdd.map((s) => s.skill.url));
      setSkills((prev) => prev.filter((s) => !addedUrls.has(s.url)));
      setSelectedSkills(new Map());

      if (result.data.failed > 0) {
        setError(`Added ${result.data.added} skills, ${result.data.failed} failed`);
      }
    } else {
      setError(result.error || 'Failed to add skills');
    }
  };

  const selectedCount = selectedSkills.size;
  const skillsWithAutoCategory = filteredSkills.filter((s) => s.detectedCategory).length;

  return (
    <div>
      {/* Search bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GitHub for skills (e.g., 'claude code', 'mcp server')..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
          >
            Refresh
          </button>
        </form>
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: 'all', label: 'All' },
          { id: 'skill', label: 'Skills' },
          { id: 'mcp-server', label: 'MCP Servers' },
          { id: 'claude-tool', label: 'Claude Tools' },
          { id: 'prompt-library', label: 'Prompts' },
          { id: 'related-repo', label: 'Related' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id as FilterType)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              typeFilter === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
            {typeCounts[tab.id] !== undefined && (
              <span className="ml-1.5 text-xs opacity-70">({typeCounts[tab.id]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Selection toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCount} selected of {filteredSkills.length} shown
          </span>

          <button
            onClick={handleSelectAllWithCategory}
            disabled={skillsWithAutoCategory === 0}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline"
          >
            Select all with auto-category ({skillsWithAutoCategory})
          </button>

          {selectedCount > 0 && (
            <button
              onClick={handleDeselectAll}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              Deselect all
            </button>
          )}
        </div>

        <button
          onClick={handleBulkAdd}
          disabled={selectedCount === 0 || isAdding}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          {isAdding ? 'Adding...' : `Add ${selectedCount} Selected`}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {addedCount > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-600 dark:text-green-400">
            Added {addedCount} skill{addedCount !== 1 ? 's' : ''} to the registry. Click
            "Regenerate Data" to update the site!
          </p>
        </div>
      )}

      {filteredSkills.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {isPending ? 'Searching...' : 'No skills found matching the filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => (
            <DiscoveredSkillCard
              key={skill.url}
              skill={skill}
              categories={categories}
              isSelected={selectedSkills.has(skill.url)}
              onSelectionChange={(selected, category, path) =>
                handleSelectionChange(skill, selected, category, path)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
