interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  items: FAQItem[];
}

// Sanitize strings for JSON-LD to prevent script injection
function sanitizeForJsonLd(str: string): string {
  return str
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .slice(0, 2000);
}

export function FAQJsonLd({ items }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: sanitizeForJsonLd(item.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: sanitizeForJsonLd(item.answer),
      },
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
