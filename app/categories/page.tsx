import type { Metadata } from 'next';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { getCategories, getSkillsSync, getSkillCountByCategory } from '@/lib/skills';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse Claude skills by category - Document Processing, Development Tools, Creative, Data Analysis, and more.',
};

export default function CategoriesPage() {
  const categories = getCategories();
  const skills = getSkillsSync();
  const skillCounts = getSkillCountByCategory(skills);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Browse by Category</h1>
          <p className="text-lg text-muted">
            Explore {skills.length}+ skills organized across {categories.length} categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              skillCount={skillCounts[category.slug] || 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
