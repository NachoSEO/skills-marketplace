export interface FAQItem {
  question: string;
  answer: string;
}

export interface UseCase {
  slug: string;
  title: string;
  headline: string;
  description: string;
  intro: string;
  tags: string[];
  categories: string[];
  faq: FAQItem[];
}

export interface Role {
  slug: string;
  title: string;
  headline: string;
  description: string;
  intro: string;
  howTo: string;
  tags: string[];
  categories: string[];
}

export interface Collection {
  slug: string;
  title: string;
  headline: string;
  description: string;
  intro: string;
  tags: string[];
  categories: string[];
  featured: boolean;
}

export interface ComparePair {
  slugA: string;
  slugB: string;
  nameA: string;
  nameB: string;
  score: number;
  reason: string;
}
