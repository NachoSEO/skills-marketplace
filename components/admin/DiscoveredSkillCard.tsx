'use client';

import { useState } from 'react';
import type { Category } from '@/types';
import type { DiscoveredSkill } from '@/lib/admin/github-search';

interface DiscoveredSkillCardProps {
  skill: DiscoveredSkill;
  categories: Category[];
  isSelected: boolean;
  onSelectionChange: (selected: boolean, category: string, path?: string) => void;
}

const REPO_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  'skill': { label: 'Skill', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  'mcp-server': { label: 'MCP Server', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'claude-tool': { label: 'Claude Tool', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  'prompt-library': { label: 'Prompts', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  'related-repo': { label: 'Related', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
};

export function DiscoveredSkillCard({
  skill,
  categories,
  isSelected,
  onSelectionChange,
}: DiscoveredSkillCardProps) {
  const [selectedCategory, setSelectedCategory] = useState(skill.detectedCategory || '');
  const [selectedPath, setSelectedPath] = useState<string | undefined>(skill.skillPaths?.[0]);

  const handleCheckboxChange = (checked: boolean) => {
    onSelectionChange(checked, selectedCategory, selectedPath);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (isSelected) {
      onSelectionChange(true, category, selectedPath);
    }
  };

  const handlePathChange = (path: string | undefined) => {
    setSelectedPath(path);
    if (isSelected) {
      onSelectionChange(true, selectedCategory, path);
    }
  };

  const typeInfo = REPO_TYPE_LABELS[skill.repoType || 'related-repo'];
  const confidencePercent = Math.round((skill.categoryConfidence || 0) * 100);

  return (
    <div
      className={`bg-white dark:bg-gray-800 border rounded-lg p-4 transition-all ${
        isSelected
          ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          disabled={!selectedCategory}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={skill.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
            >
              {skill.owner}/{skill.repo}
            </a>

            <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeInfo.color}`}>
              {typeInfo.label}
            </span>

            {skill.hasSkillMd && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                SKILL.md
              </span>
            )}
          </div>

          {skill.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {skill.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {skill.stars.toLocaleString()}
            </span>

            {skill.language && (
              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {skill.language}
              </span>
            )}
          </div>

          {/* Detection signals */}
          {skill.signals && skill.signals.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {skill.signals.slice(0, 4).map((signal, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 text-xs bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded"
                >
                  {signal}
                </span>
              ))}
            </div>
          )}

          {/* Category selection */}
          <div className="mt-3 space-y-2">
            {skill.skillPaths && skill.skillPaths.length > 0 && (
              <select
                value={selectedPath || ''}
                onChange={(e) => handlePathChange(e.target.value || undefined)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">Root (no path)</option>
                {skill.skillPaths.map((path) => (
                  <option key={path} value={path}>
                    {path}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">Select category</option>
                {/* Show suggested categories first */}
                {skill.suggestedCategories && skill.suggestedCategories.length > 0 && (
                  <optgroup label="Suggested">
                    {skill.suggestedCategories.map((catId) => {
                      const cat = categories.find((c) => c.id === catId);
                      return cat ? (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({confidencePercent}%)
                        </option>
                      ) : null;
                    })}
                  </optgroup>
                )}
                <optgroup label="All Categories">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </optgroup>
              </select>

              {skill.detectedCategory && confidencePercent > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    confidencePercent >= 50
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {confidencePercent}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
