'use client';

import { useState, useTransition } from 'react';
import { regenerateDataAction } from '@/app/admin/actions';

export function RegenerateButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRegenerate = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await regenerateDataAction();
      if (result.success) {
        setMessage({ type: 'success', text: 'Data regenerated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to regenerate data' });
      }
    });
  };

  return (
    <div className="relative">
      <button
        onClick={handleRegenerate}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
      >
        <svg
          className={`w-5 h-5 ${isPending ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {isPending ? 'Regenerating...' : 'Regenerate Data'}
      </button>

      {message && (
        <div
          className={`absolute top-full mt-2 right-0 px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
