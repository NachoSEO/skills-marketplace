import { NextRequest, NextResponse } from 'next/server';
import { embedQuery, rankByEmbedding, type EmbeddingsData, type SemanticMatch } from '@/lib/semantic-search';

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;

let embeddingsCache: EmbeddingsData | null = null;

function loadEmbeddings(): EmbeddingsData | null {
  if (embeddingsCache) return embeddingsCache;
  try {
    embeddingsCache = require('@/data/embeddings.json') as EmbeddingsData;
  } catch {
    embeddingsCache = null;
  }
  return embeddingsCache;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q')?.trim();
  const limitParam = searchParams.get('limit');

  if (!query || query.length === 0) {
    return NextResponse.json({ error: 'Missing query parameter: q' }, { status: 400 });
  }

  const limit = Math.min(
    Math.max(1, parseInt(limitParam || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
    MAX_LIMIT
  );

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Semantic search is not configured' },
      { status: 503 }
    );
  }

  const embeddingsData = loadEmbeddings();
  if (!embeddingsData || Object.keys(embeddingsData.embeddings).length === 0) {
    return NextResponse.json(
      { error: 'Embeddings not available. Run compute:embeddings to generate them.' },
      { status: 503 }
    );
  }

  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedQuery(query, apiKey);
  } catch (err) {
    console.error('Failed to embed query:', err);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 502 }
    );
  }

  const results: SemanticMatch[] = rankByEmbedding(queryEmbedding, embeddingsData.embeddings, limit);

  return NextResponse.json(
    {
      query,
      limit,
      results,
      meta: {
        model: embeddingsData.model,
        embeddingsGeneratedAt: embeddingsData.generatedAt,
        totalSkillsIndexed: Object.keys(embeddingsData.embeddings).length,
      },
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    }
  );
}
