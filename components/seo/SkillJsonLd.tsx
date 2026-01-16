import type { Skill, Category } from '@/types';

interface Props {
  skill: Skill;
  category?: Category;
}

// Sanitize strings for JSON-LD to prevent script injection
function sanitizeForJsonLd(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .slice(0, 5000); // Limit length
}

export function SkillJsonLd({ skill, category }: Props) {
  // JSON-LD structured data for SEO with sanitized inputs
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: sanitizeForJsonLd(skill.name),
    description: sanitizeForJsonLd(skill.aiDescription || skill.description),
    applicationCategory: sanitizeForJsonLd(category?.name) || 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    author: {
      '@type': 'Person',
      name: sanitizeForJsonLd(skill.author),
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
    url: `https://skillsforge.dev/skills/${encodeURIComponent(skill.slug)}`,
    downloadUrl: skill.githubUrl,
    softwareVersion: '1.0',
    datePublished: skill.createdAt,
    ...(skill.updatedAt && { dateModified: skill.updatedAt }),
    ...(skill.license && {
      license: `https://opensource.org/licenses/${encodeURIComponent(skill.license)}`,
    }),
    keywords: skill.tags.map(sanitizeForJsonLd).join(', '),
    ...(skill.language && {
      programmingLanguage: sanitizeForJsonLd(skill.language),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
