import { Suspense } from 'react';
import { discoverSkillsAction, getCategoriesAction } from '@/app/admin/actions';
import { DiscoverSkillsList } from '@/components/admin/DiscoverSkillsList';
import { RegenerateButton } from '@/components/admin/RegenerateButton';

async function DiscoverContent() {
  const [skillsResult, categoriesResult] = await Promise.all([
    discoverSkillsAction(),
    getCategoriesAction(),
  ]);

  const skills = skillsResult.success ? skillsResult.data || [] : [];
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  return <DiscoverSkillsList initialSkills={skills} categories={categories} />;
}

export default function DiscoverPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discover Skills</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Search GitHub for new Claude Code skills to add to the registry
          </p>
        </div>
        <RegenerateButton />
      </div>

      <Suspense
        fallback={
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="animate-pulse text-gray-500 dark:text-gray-400">
              Searching GitHub for skills...
            </div>
          </div>
        }
      >
        <DiscoverContent />
      </Suspense>
    </div>
  );
}
