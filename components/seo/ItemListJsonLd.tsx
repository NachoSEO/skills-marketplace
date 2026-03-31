import type { Skill } from '@/types';

interface Props {
  skills: Skill[];
  listName: string;
  listUrl: string;
}

function sanitizeForJsonLd(str: string): string {
  return str
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .slice(0, 500);
}

const BASE_URL = 'https://skillsforge.dev';

export function ItemListJsonLd({ skills, listName, listUrl }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: sanitizeForJsonLd(listName),
    url: listUrl,
    numberOfItems: skills.length,
    itemListElement: skills.map((skill, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE_URL}/skills/${skill.slug}`,
      name: sanitizeForJsonLd(skill.name),
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
