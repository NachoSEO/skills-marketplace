import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { SearchBar } from '@/components/search/SearchBar';
import { getCategories, getCategoryBySlug, getSkillsSync, getSkillsByCategory } from '@/lib/skills';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const skills = getSkillsSync();
  const categorySkills = getSkillsByCategory(skills, slug);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-muted mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-foreground transition-colors">
            Categories
          </Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-12">
          <div>
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
              >
                <polyline points="16,18 22,12 16,6" />
                <polyline points="8,6 2,12 8,18" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Claude Skills for {category.name}</h1>
            <p className="text-lg text-muted mb-4">{category.description}</p>
            <p className="text-sm text-muted">
              {categorySkills.length} {categorySkills.length === 1 ? 'skill' : 'skills'} available
            </p>
          </div>

          <div className="w-full lg:w-80">
            <SearchBar placeholder={`Search ${category.name.toLowerCase()}...`} />
          </div>
        </div>

        <SkillGrid
          skills={categorySkills}
          emptyMessage={`No skills found in ${category.name}`}
        />
      </div>
    </div>
  );
}
