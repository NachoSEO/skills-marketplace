import Link from 'next/link';
import { getCategoriesAction } from '@/app/admin/actions';
import { SkillForm } from '@/components/admin/SkillForm';

export default async function NewSkillPage() {
  const categoriesResult = await getCategoriesAction();
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-200">
            Skills
          </Link>
          <span>/</span>
          <span>New</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Skill</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Add a new skill to the registry by providing its GitHub repository details
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <SkillForm categories={categories} mode="create" />
      </div>
    </div>
  );
}
