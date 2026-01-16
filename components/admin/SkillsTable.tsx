'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { SkillRegistry } from '@/types';
import { toggleFeaturedAction, deleteSkillAction } from '@/app/admin/actions';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface SkillWithId extends SkillRegistry {
  id: string;
}

interface SkillsTableProps {
  skills: SkillWithId[];
}

export function SkillsTable({ skills: initialSkills }: SkillsTableProps) {
  const [skills, setSkills] = useState(initialSkills);
  const [isPending, startTransition] = useTransition();
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; skill: SkillWithId | null }>({
    open: false,
    skill: null,
  });

  const handleToggleFeatured = (id: string) => {
    startTransition(async () => {
      const result = await toggleFeaturedAction(id);
      if (result.success && result.data) {
        setSkills((prev) =>
          prev.map((s) => (s.id === id ? { ...s, featured: result.data!.featured } : s))
        );
      }
    });
  };

  const handleDelete = (skill: SkillWithId) => {
    setDeleteModal({ open: true, skill });
  };

  const confirmDelete = () => {
    if (!deleteModal.skill) return;

    startTransition(async () => {
      const result = await deleteSkillAction(deleteModal.skill!.id);
      if (result.success) {
        setSkills((prev) => prev.filter((s) => s.id !== deleteModal.skill!.id));
      }
      setDeleteModal({ open: false, skill: null });
    });
  };

  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No skills found</p>
        <Link
          href="/admin/skills/new"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add your first skill
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Owner/Repo
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {skills.map((skill) => (
              <tr key={skill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {skill.name || skill.repo}
                    </span>
                    {skill.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {skill.description}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {skill.category}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <a
                    href={`https://github.com/${skill.owner}/${skill.repo}${skill.path ? `/tree/main/${skill.path}` : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {skill.owner}/{skill.repo}
                    {skill.path && <span className="text-gray-400">/{skill.path}</span>}
                  </a>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleToggleFeatured(skill.id)}
                    disabled={isPending}
                    className="text-lg disabled:opacity-50"
                    title={skill.featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    {skill.featured ? (
                      <span className="text-yellow-500">&#9733;</span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">&#9734;</span>
                    )}
                  </button>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/skills/${skill.id}/edit`}
                      className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(skill)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmModal
        open={deleteModal.open}
        skillName={deleteModal.skill?.name || deleteModal.skill?.repo || ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, skill: null })}
        isPending={isPending}
      />
    </>
  );
}
