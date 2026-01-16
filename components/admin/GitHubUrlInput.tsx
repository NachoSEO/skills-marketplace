'use client';

import { useState, useTransition } from 'react';
import { fetchGitHubDataAction } from '@/app/admin/actions';

interface GitHubUrlInputProps {
  onDataFetched: (data: {
    owner: string;
    repo: string;
    path?: string;
    name?: string;
    description?: string;
  }) => void;
}

export function GitHubUrlInput({ onDataFetched }: GitHubUrlInputProps) {
  const [url, setUrl] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleFetch = () => {
    if (!url.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await fetchGitHubDataAction(url);
      if (result.success && result.data) {
        onDataFetched(result.data);
        setUrl('');
      } else {
        setError(result.error || 'Failed to fetch GitHub data');
      }
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        GitHub URL
      </label>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo or .../tree/main/path"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleFetch}
          disabled={isPending || !url.trim()}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
        >
          {isPending ? 'Fetching...' : 'Fetch'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Paste a GitHub repo URL to auto-fill fields. Supports direct paths like
        /owner/repo/tree/main/skills/path
      </p>
    </div>
  );
}
