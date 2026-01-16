import { Suspense } from 'react';
import Link from 'next/link';
import { getSkillsAction, getCategoriesAction, regenerateDataAction } from './actions';
import { SkillsTable } from '@/components/admin/SkillsTable';
import { SearchFilters } from '@/components/admin/SearchFilters';
import { RegenerateButton } from '@/components/admin/RegenerateButton';

interface AdminPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    featured?: string;
  }>;
}

async function SkillsList({ searchParams }: { searchParams: AdminPageProps['searchParams'] }) {
  const params = await searchParams;
  const filters = {
    search: params.search,
    category: params.category,
    featured: params.featured === 'true' ? true : params.featured === 'false' ? false : undefined,
  };

  const [skillsResult, categoriesResult] = await Promise.all([
    getSkillsAction(filters),
    getCategoriesAction(),
  ]);

  const skills = skillsResult.success ? skillsResult.data || [] : [];
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  return (
    <>
      <SearchFilters categories={categories} totalCount={skills.length} />
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <SkillsTable skills={skills} />
      </div>
    </>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Skills</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage skills in the registry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RegenerateButton />
          <Link
            href="/admin/skills/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Skill
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading skills...</div>
          </div>
        }
      >
        <SkillsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
