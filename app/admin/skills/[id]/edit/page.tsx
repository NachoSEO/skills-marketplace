import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoriesAction, getSkillAction } from '@/app/admin/actions';
import { SkillForm } from '@/components/admin/SkillForm';

interface EditSkillPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSkillPage({ params }: EditSkillPageProps) {
  const { id } = await params;
  const [skillResult, categoriesResult] = await Promise.all([
    getSkillAction(id),
    getCategoriesAction(),
  ]);

  if (!skillResult.success || !skillResult.data) {
    notFound();
  }

  const skill = skillResult.data;
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-200">
            Skills
          </Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit: {skill.name || skill.repo}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          <a
            href={`https://github.com/${skill.owner}/${skill.repo}${skill.path ? `/tree/main/${skill.path}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {skill.owner}/{skill.repo}
            {skill.path && `/${skill.path}`}
          </a>
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <SkillForm categories={categories} skill={skill} mode="edit" />
      </div>
    </div>
  );
}
