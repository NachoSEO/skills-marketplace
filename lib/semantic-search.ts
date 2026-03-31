const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings';
const EMBEDDING_MODEL = 'text-embedding-3-small';

export interface SemanticMatch {
  slug: string;
  score: number;
}

export interface EmbeddingsData {
  version: string;
  generatedAt: string;
  model: string;
  dimensions: number;
  embeddings: Record<string, number[]>;
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

export function rankByEmbedding(
  queryEmbedding: number[],
  skillEmbeddings: Record<string, number[]>,
  topN = 20
): SemanticMatch[] {
  const scores: SemanticMatch[] = Object.entries(skillEmbeddings).map(([slug, embedding]) => ({
    slug,
    score: cosineSimilarity(queryEmbedding, embedding),
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topN);
}

export async function embedQuery(query: string, apiKey: string): Promise<number[]> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: query.slice(0, 2048),
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI embeddings error ${response.status}: ${error}`);
  }

  const data = await response.json() as { data: [{ embedding: number[] }] };
  return data.data[0].embedding;
}
