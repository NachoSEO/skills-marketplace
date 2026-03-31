import { MetadataRoute } from 'next';
import {
  getSkillsSync,
  getCategories,
  getUniqueLanguages,
  getUniqueLicenses,
  getUseCases,
  getRoles,
  getCollections,
  getComparePairs,
} from '@/lib/skills';

const BASE_URL = 'https://skillsforge.dev';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function sitemap(): MetadataRoute.Sitemap {
  const skills = getSkillsSync();
  const categories = getCategories();
  const languages = getUniqueLanguages(skills);
  const licenses = getUniqueLicenses(skills);
  const useCases = getUseCases();
  const roles = getRoles();
  const collections = getCollections();
  const comparePairs = getComparePairs();

  const skillUrls = skills.map((skill) => ({
    url: `${BASE_URL}/skills/${skill.slug}`,
    lastModified: skill.updatedAt ? new Date(skill.updatedAt) : new Date(skill.createdAt),
    changeFrequency: 'weekly' as const,
    priority: skill.featured ? 0.9 : 0.7,
  }));

  const categoryUrls = categories.map((cat) => ({
    url: `${BASE_URL}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const languageUrls = languages.map((lang) => ({
    url: `${BASE_URL}/languages/${slugify(lang)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const licenseUrls = licenses.map((license) => ({
    url: `${BASE_URL}/licenses/${slugify(license)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const useCaseUrls = useCases.map((uc) => ({
    url: `${BASE_URL}/use-case/${uc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const roleUrls = roles.map((role) => ({
    url: `${BASE_URL}/tools-for/${role.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const collectionUrls = collections.map((col) => ({
    url: `${BASE_URL}/collections/${col.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: col.featured ? 0.8 : 0.65,
  }));

  const compareUrls = comparePairs.map((pair) => ({
    url: `${BASE_URL}/compare/${pair.slugA}-vs-${pair.slugB}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/skills`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/use-case`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools-for`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/languages`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/licenses`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...categoryUrls,
    ...skillUrls,
    ...useCaseUrls,
    ...roleUrls,
    ...collectionUrls,
    ...compareUrls,
    ...languageUrls,
    ...licenseUrls,
  ];
}
