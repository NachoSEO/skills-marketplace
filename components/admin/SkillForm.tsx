'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, SkillRegistry } from '@/types';
import { addSkillAction, updateSkillAction, generateDescriptionAction } from '@/app/admin/actions';
import { GitHubUrlInput } from './GitHubUrlInput';

interface SkillFormProps {
  categories: Category[];
  skill?: SkillRegistry & { id: string };
  mode: 'create' | 'edit';
}

export function SkillForm({ categories, skill, mode }: SkillFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    owner: skill?.owner || '',
    repo: skill?.repo || '',
    path: skill?.path || '',
    category: skill?.category || '',
    name: skill?.name || '',
    description: skill?.description || '',
    tags: skill?.tags?.join(', ') || '',
    featured: skill?.featured || false,
    pros: skill?.pros?.join('\n') || '',
    cons: skill?.cons?.join('\n') || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleGitHubData = (data: {
    owner: string;
    repo: string;
    path?: string;
    name?: string;
    description?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      owner: data.owner,
      repo: data.repo,
      path: data.path || '',
      name: data.name || prev.name,
      description: data.description || prev.description,
    }));
  };

  const handleGenerateDescription = async () => {
    if (!skill?.id) return;

    setIsGenerating(true);
    const result = await generateDescriptionAction(skill.id);
    setIsGenerating(false);

    if (result.success && result.data) {
      setFormData((prev) => ({ ...prev, description: result.data! }));
      setSuccessMessage('Description generated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrors({ description: result.error || 'Failed to generate description' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    const data = {
      owner: formData.owner,
      repo: formData.repo,
      path: formData.path || undefined,
      category: formData.category,
      name: formData.name || undefined,
      description: formData.description || undefined,
      tags: formData.tags
        ? formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      featured: formData.featured || undefined,
      pros: formData.pros
        ? formData.pros
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean)
        : undefined,
      cons: formData.cons
        ? formData.cons
            .split('\n')
            .map((c) => c.trim())
            .filter(Boolean)
        : undefined,
    };

    startTransition(async () => {
      const result =
        mode === 'create' ? await addSkillAction(data) : await updateSkillAction(skill!.id, data);

      if (result.success) {
        if (mode === 'create') {
          router.push('/admin');
        } else {
          setSuccessMessage('Skill updated successfully!');
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } else if (result.errors) {
        setErrors(result.errors);
      } else {
        setErrors({ _form: result.error || 'An error occurred' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'create' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <GitHubUrlInput onDataFetched={handleGitHubData} />
        </div>
      )}

      {errors._form && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{errors._form}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Owner <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            placeholder="anthropics"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.owner && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.owner}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Repository <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="repo"
            value={formData.repo}
            onChange={handleChange}
            placeholder="skills"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.repo && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.repo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Path (optional)
          </label>
          <input
            type="text"
            name="path"
            value={formData.path}
            onChange={handleChange}
            placeholder="skills/pdf"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="PDF Toolkit"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          {mode === 'edit' && skill?.id && (
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGenerating}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </button>
          )}
        </div>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="A brief description of what this skill does..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="pdf, documents, extraction"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pros (one per line)
          </label>
          <textarea
            name="pros"
            value={formData.pros}
            onChange={handleChange}
            rows={3}
            placeholder="Official Anthropic skill&#10;Well documented&#10;Active maintenance"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cons (one per line)
          </label>
          <textarea
            name="cons"
            value={formData.cons}
            onChange={handleChange}
            rows={3}
            placeholder="Requires Python&#10;Large dependencies"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          name="featured"
          checked={formData.featured}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Featured skill
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {isPending ? 'Saving...' : mode === 'create' ? 'Add Skill' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
