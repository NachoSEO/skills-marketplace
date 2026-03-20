const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare',
  'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we',
  'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them',
  'their', 'what', 'which', 'who', 'whom', 'where', 'when', 'why', 'how',
  'not', 'no', 'nor', 'if', 'then', 'else', 'so', 'as', 'up', 'out',
  'about', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'under', 'again', 'further', 'once', 'here',
  'there', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'only', 'own', 'same', 'than', 'too', 'very',
  'just', 'also', 'now', 'well', 'even', 'back', 'still', 'way', 'take',
  'come', 'go', 'make', 'like', 'get', 'use', 'used', 'using', 'new',
  'one', 'two', 'first', 'last', 'long', 'great', 'just', 'over',
]);

function stem(word: string): string {
  if (word.length <= 3) return word;
  // Basic suffix stripping
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('tion') || word.endsWith('sion')) return word.slice(0, -3);
  if (word.endsWith('ness') || word.endsWith('ment') || word.endsWith('able') || word.endsWith('ible')) return word.slice(0, -4);
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ful') || word.endsWith('ous') || word.endsWith('ive')) return word.slice(0, -3);
  if (word.endsWith('ly') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('er') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 4) return word.slice(0, -1);
  return word;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .map(stem);
}

export function buildVocabulary(documents: string[][]): Map<string, number> {
  const vocab = new Map<string, number>();
  let idx = 0;
  for (const tokens of documents) {
    const seen = new Set(tokens);
    for (const term of seen) {
      if (!vocab.has(term)) {
        vocab.set(term, idx++);
      }
    }
  }
  return vocab;
}

export function computeIDF(documents: string[][], vocabulary: Map<string, number>): Map<string, number> {
  const n = documents.length;
  const df = new Map<string, number>();

  for (const tokens of documents) {
    const seen = new Set(tokens);
    for (const term of seen) {
      df.set(term, (df.get(term) || 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term] of vocabulary) {
    const docFreq = df.get(term) || 0;
    idf.set(term, Math.log(n / (1 + docFreq)));
  }
  return idf;
}

export function computeTFIDFVector(
  tokens: string[],
  idf: Map<string, number>,
  vocabulary: Map<string, number>
): number[] {
  const vector = new Array(vocabulary.size).fill(0);
  const totalTokens = tokens.length;
  if (totalTokens === 0) return vector;

  // Count term frequencies
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  for (const [term, count] of tf) {
    const vocabIdx = vocabulary.get(term);
    const idfVal = idf.get(term);
    if (vocabIdx !== undefined && idfVal !== undefined) {
      vector[vocabIdx] = (count / totalTokens) * idfVal;
    }
  }

  return vector;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  if (magnitude === 0) return 0;
  return dot / magnitude;
}
