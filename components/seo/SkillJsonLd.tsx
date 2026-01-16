import type { Skill, Category } from '@/types';

interface Props {
  skill: Skill;
  category?: Category;
}

export function SkillJsonLd({ skill, category }: Props) {
  // JSON-LD structured data for SEO
  // Using JSON.stringify ensures safe serialization of all values
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: skill.name,
    description: skill.aiDescription || skill.description,
    applicationCategory: category?.name || 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    author: {
      '@type': 'Person',
      name: skill.author,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    ...(skill.stars && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        ratingCount: skill.stars,
      },
    }),
    url: `https://skills.claudecode.dev/skills/${skill.slug}`,
    downloadUrl: skill.githubUrl,
    softwareVersion: '1.0',
    datePublished: skill.createdAt,
    ...(skill.updatedAt && { dateModified: skill.updatedAt }),
    ...(skill.license && {
      license: `https://opensource.org/licenses/${skill.license}`,
    }),
    keywords: skill.tags.join(', '),
    ...(skill.language && {
      programmingLanguage: skill.language,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
