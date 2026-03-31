import { describe, it, expect } from 'vitest';
import {
  tokenize,
  buildVocabulary,
  computeIDF,
  computeTFIDFVector,
  cosineSimilarity,
} from '@/scripts/lib/tfidf';

describe('tokenize', () => {
  it('lowercases and splits text into tokens', () => {
    const tokens = tokenize('Hello World');
    expect(tokens).toContain('hello');
    expect(tokens).toContain('world');
  });

  it('removes stopwords', () => {
    const tokens = tokenize('this is a test');
    expect(tokens).not.toContain('this');
    expect(tokens).not.toContain('is');
    expect(tokens).not.toContain('a');
    expect(tokens).toContain('test');
  });

  it('removes punctuation', () => {
    const tokens = tokenize('hello, world!');
    expect(tokens).toContain('hello');
    expect(tokens).toContain('world');
    expect(tokens).not.toContain(',');
    expect(tokens).not.toContain('!');
  });

  it('filters out single-character tokens', () => {
    const tokens = tokenize('a b c abc');
    expect(tokens).not.toContain('a');
    expect(tokens).not.toContain('b');
    expect(tokens).not.toContain('c');
  });

  it('applies stemming', () => {
    // "running" -> "runn" (strips "ing")
    const tokens = tokenize('running');
    expect(tokens).toContain('runn');
  });

  it('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
  });
});

describe('buildVocabulary', () => {
  it('assigns unique indices to all unique terms', () => {
    const docs = [['foo', 'bar'], ['bar', 'baz']];
    const vocab = buildVocabulary(docs);
    expect(vocab.size).toBe(3);
    expect(vocab.has('foo')).toBe(true);
    expect(vocab.has('bar')).toBe(true);
    expect(vocab.has('baz')).toBe(true);
  });

  it('assigns sequential indices starting from 0', () => {
    const docs = [['alpha', 'beta'], ['gamma']];
    const vocab = buildVocabulary(docs);
    const indices = Array.from(vocab.values());
    expect(Math.min(...indices)).toBe(0);
    expect(Math.max(...indices)).toBe(2);
  });

  it('returns empty map for empty input', () => {
    expect(buildVocabulary([])).toEqual(new Map());
  });
});

describe('computeIDF', () => {
  it('gives higher IDF to rare terms', () => {
    const docs = [
      ['foo', 'common'],
      ['bar', 'common'],
      ['baz', 'common'],
    ];
    const vocab = buildVocabulary(docs);
    const idf = computeIDF(docs, vocab);
    // 'foo' appears in 1/3 docs; 'common' in 3/3 — foo should have higher IDF
    expect(idf.get('foo')!).toBeGreaterThan(idf.get('common')!);
  });

  it('computes IDF for all vocab terms', () => {
    const docs = [['alpha', 'beta']];
    const vocab = buildVocabulary(docs);
    const idf = computeIDF(docs, vocab);
    expect(idf.has('alpha')).toBe(true);
    expect(idf.has('beta')).toBe(true);
  });
});

describe('computeTFIDFVector', () => {
  it('returns zero vector for empty tokens', () => {
    const vocab = new Map([['foo', 0], ['bar', 1]]);
    const idf = new Map([['foo', 1.0], ['bar', 0.5]]);
    const vector = computeTFIDFVector([], idf, vocab);
    expect(vector).toEqual([0, 0]);
  });

  it('returns vector of correct length', () => {
    const vocab = new Map([['foo', 0], ['bar', 1], ['baz', 2]]);
    const idf = new Map([['foo', 1.0], ['bar', 0.5], ['baz', 0.3]]);
    const vector = computeTFIDFVector(['foo', 'foo', 'bar'], idf, vocab);
    expect(vector).toHaveLength(3);
  });

  it('assigns non-zero weight to present terms', () => {
    const vocab = new Map([['foo', 0], ['bar', 1]]);
    const idf = new Map([['foo', 1.0], ['bar', 0.5]]);
    const vector = computeTFIDFVector(['foo'], idf, vocab);
    expect(vector[0]).toBeGreaterThan(0);
    expect(vector[1]).toBe(0);
  });
});

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('returns 0 for zero vectors', () => {
    expect(cosineSimilarity([0, 0], [0, 0])).toBe(0);
  });

  it('returns value between 0 and 1 for typical vectors', () => {
    const a = [1, 1, 0];
    const b = [1, 0, 1];
    const sim = cosineSimilarity(a, b);
    expect(sim).toBeGreaterThanOrEqual(0);
    expect(sim).toBeLessThanOrEqual(1);
  });
});
