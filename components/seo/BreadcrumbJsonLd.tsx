interface BreadcrumbItem {
  name: string;
  url: string;
}

interface Props {
  items: BreadcrumbItem[];
}

// Sanitize strings for JSON-LD to prevent script injection
function sanitizeForJsonLd(str: string): string {
  return str
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .slice(0, 500);
}

export function BreadcrumbJsonLd({ items }: Props) {
  // JSON-LD structured data for breadcrumb navigation with sanitized inputs
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: sanitizeForJsonLd(item.name),
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
