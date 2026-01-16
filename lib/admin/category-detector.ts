import type { Category } from '@/types';

export type RepoType =
  | 'skill'           // Has SKILL.md - definite Claude Code skill
  | 'mcp-server'      // MCP server (can work with Claude Code)
  | 'claude-tool'     // Claude-related tool/utility
  | 'prompt-library'  // Prompt templates/library
  | 'related-repo';   // Related but not a direct skill

export interface DetectionResult {
  category: string | null;
  categoryConfidence: number; // 0-1
  repoType: RepoType;
  typeConfidence: number; // 0-1
  suggestedCategories: string[]; // Top 3 suggestions
  signals: string[]; // What triggered the detection
}

// Keywords mapped to categories
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'document-processing': [
    'pdf', 'docx', 'xlsx', 'pptx', 'word', 'excel', 'powerpoint',
    'document', 'spreadsheet', 'presentation', 'markdown', 'epub',
    'office', 'latex', 'csv-to', 'to-pdf', 'doc-', '-doc'
  ],
  'development-tools': [
    'testing', 'test-', '-test', 'debug', 'lint', 'formatter', 'mcp-builder',
    'code-review', 'refactor', 'ide', 'vscode', 'neovim', 'editor',
    'typescript', 'compiler', 'bundler', 'build-tool', 'sdk', 'cli-tool',
    'hooks', 'statusline', 'tdd', 'code-quality'
  ],
  'creative-design': [
    'design', 'art', 'canvas', 'gif', 'image', 'svg', 'animation',
    'p5js', 'generative', 'graphics', 'visual', 'ui-', 'frontend-design',
    'theme', 'icon', 'favicon', 'logo', 'color', 'style'
  ],
  'data-analysis': [
    'data', 'csv', 'analytics', 'visualization', 'chart', 'graph',
    'd3', 'pandas', 'sql', 'database', 'postgres', 'mysql', 'mongodb',
    'bigquery', 'statistics', 'report', 'dashboard', 'metric'
  ],
  'business-marketing': [
    'marketing', 'seo', 'brand', 'lead', 'sales', 'crm', 'ads',
    'campaign', 'competitor', 'market', 'business', 'enterprise',
    'customer', 'ecommerce', 'pricing', 'invoice'
  ],
  'communication': [
    'email', 'slack', 'discord', 'chat', 'message', 'notification',
    'meeting', 'transcript', 'summary', 'writing', 'content',
    'blog', 'newsletter', 'comms', 'communication'
  ],
  'productivity': [
    'productivity', 'task', 'todo', 'workflow', 'organize', 'calendar',
    'schedule', 'reminder', 'note', 'bookmark', 'file-organiz',
    'time-', 'pomodoro', 'gtd', 'project-management'
  ],
  'security': [
    'security', 'pentest', 'vulnerability', 'audit', 'forensic',
    'threat', 'malware', 'crypto', 'encrypt', 'auth', 'oauth',
    'jwt', 'password', 'secret', 'vault', 'scan'
  ],
  'devops-cicd': [
    'devops', 'ci-cd', 'cicd', 'deploy', 'docker', 'kubernetes', 'k8s',
    'terraform', 'ansible', 'aws', 'gcp', 'azure', 'cloudflare',
    'git-', 'github-action', 'pipeline', 'infrastructure', 'monitoring'
  ],
  'ai-llm': [
    'llm', 'gpt', 'anthropic', 'openai', 'prompt', 'agent', 'langchain',
    'rag', 'embedding', 'vector', 'ai-', '-ai', 'model', 'inference',
    'fine-tune', 'training', 'ml-', 'machine-learning', 'neural'
  ],
  'web-scraping': [
    'scrape', 'scraping', 'crawler', 'crawl', 'extract', 'parse',
    'puppeteer', 'playwright', 'selenium', 'cheerio', 'beautifulsoup',
    'fetch', 'http-', 'api-fetch', 'web-data'
  ],
  'automation': [
    'automat', 'workflow', 'n8n', 'zapier', 'make', 'trigger',
    'schedule', 'cron', 'bot', 'macro', 'script', 'batch',
    'orchestrat', 'pipeline'
  ],
  'translation-localization': [
    'translat', 'i18n', 'l10n', 'locali', 'language', 'multilingual',
    'intl', 'locale', 'gettext', 'po-file', 'internationali'
  ],
  'seo-search': [
    'seo', 'search-engine', 'keyword', 'ranking', 'backlink',
    'sitemap', 'meta-tag', 'serp', 'google-', 'bing-'
  ],
};

// Signals that indicate this is likely a Claude Code skill
const SKILL_SIGNALS = [
  'skill.md', 'claude-skill', 'claude-code-skill', 'claude code skill',
  'anthropic skill', 'for claude code', 'claude-code', 'claudecode'
];

// Signals for MCP servers
const MCP_SIGNALS = [
  'mcp-server', 'mcp server', 'model context protocol', 'mcp-',
  '-mcp', 'mcp_', '_mcp', 'modelcontextprotocol'
];

// Signals for prompt libraries
const PROMPT_SIGNALS = [
  'prompt', 'system-prompt', 'prompt-library', 'prompts',
  'prompt-template', 'prompt-engineering'
];

// Signals for Claude tools (but not skills)
const TOOL_SIGNALS = [
  'claude-tool', 'claude tool', 'claude-util', 'anthropic-tool',
  'for claude', 'with claude', 'claude api', 'claude-api'
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[_\s]+/g, '-');
}

function countMatches(text: string, keywords: string[]): number {
  const normalized = normalizeText(text);
  return keywords.filter(kw => normalized.includes(kw.toLowerCase())).length;
}

function findMatchingKeywords(text: string, keywords: string[]): string[] {
  const normalized = normalizeText(text);
  return keywords.filter(kw => normalized.includes(kw.toLowerCase()));
}

export function detectCategory(
  name: string,
  description: string | null,
  topics: string[],
  readme?: string
): { category: string | null; confidence: number; suggestions: string[]; signals: string[] } {
  const allText = [
    name,
    description || '',
    topics.join(' '),
    readme?.slice(0, 2000) || ''
  ].join(' ');

  const scores: Record<string, { score: number; signals: string[] }> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchedKeywords = findMatchingKeywords(allText, keywords);
    const score = matchedKeywords.length;
    if (score > 0) {
      scores[category] = { score, signals: matchedKeywords };
    }
  }

  // Sort by score descending
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score);

  if (sorted.length === 0) {
    return { category: null, confidence: 0, suggestions: [], signals: [] };
  }

  const topCategory = sorted[0][0];
  const topScore = sorted[0][1].score;
  const topSignals = sorted[0][1].signals;

  // Calculate confidence based on score and gap to second place
  const secondScore = sorted[1]?.[1].score || 0;
  const gap = topScore - secondScore;
  const confidence = Math.min(0.9, (topScore * 0.15) + (gap * 0.1));

  const suggestions = sorted.slice(0, 3).map(([cat]) => cat);

  return {
    category: topCategory,
    confidence,
    suggestions,
    signals: topSignals.slice(0, 5)
  };
}

export function detectRepoType(
  name: string,
  description: string | null,
  topics: string[],
  hasSkillMd: boolean,
  readme?: string
): { type: RepoType; confidence: number; signals: string[] } {
  const allText = [
    name,
    description || '',
    topics.join(' '),
    readme?.slice(0, 2000) || ''
  ].join(' ').toLowerCase();

  const signals: string[] = [];

  // Definite skill if has SKILL.md
  if (hasSkillMd) {
    signals.push('has SKILL.md');
    return { type: 'skill', confidence: 0.95, signals };
  }

  // Check for skill signals
  const skillMatches = countMatches(allText, SKILL_SIGNALS);
  if (skillMatches > 0) {
    signals.push(...findMatchingKeywords(allText, SKILL_SIGNALS).slice(0, 3));
    return { type: 'skill', confidence: 0.7 + (skillMatches * 0.1), signals };
  }

  // Check for MCP server
  const mcpMatches = countMatches(allText, MCP_SIGNALS);
  if (mcpMatches > 0) {
    signals.push(...findMatchingKeywords(allText, MCP_SIGNALS).slice(0, 3));
    return { type: 'mcp-server', confidence: 0.7 + (mcpMatches * 0.1), signals };
  }

  // Check for prompt library
  const promptMatches = countMatches(allText, PROMPT_SIGNALS);
  if (promptMatches >= 2) {
    signals.push(...findMatchingKeywords(allText, PROMPT_SIGNALS).slice(0, 3));
    return { type: 'prompt-library', confidence: 0.6 + (promptMatches * 0.1), signals };
  }

  // Check for Claude tools
  const toolMatches = countMatches(allText, TOOL_SIGNALS);
  if (toolMatches > 0) {
    signals.push(...findMatchingKeywords(allText, TOOL_SIGNALS).slice(0, 3));
    return { type: 'claude-tool', confidence: 0.5 + (toolMatches * 0.1), signals };
  }

  // Default to related repo
  signals.push('no specific skill markers found');
  return { type: 'related-repo', confidence: 0.3, signals };
}

export function analyzeRepo(
  name: string,
  description: string | null,
  topics: string[],
  hasSkillMd: boolean,
  readme?: string
): DetectionResult {
  const categoryResult = detectCategory(name, description, topics, readme);
  const typeResult = detectRepoType(name, description, topics, hasSkillMd, readme);

  return {
    category: categoryResult.category,
    categoryConfidence: categoryResult.confidence,
    repoType: typeResult.type,
    typeConfidence: typeResult.confidence,
    suggestedCategories: categoryResult.suggestions,
    signals: [...typeResult.signals, ...categoryResult.signals].slice(0, 8)
  };
}

// For AI-powered categorization
export function buildCategorizationPrompt(
  name: string,
  description: string | null,
  topics: string[],
  readme: string | null,
  categories: Category[]
): string {
  const categoryList = categories.map(c => `- ${c.id}: ${c.name} - ${c.description}`).join('\n');

  return `Analyze this GitHub repository and categorize it.

Repository: ${name}
Description: ${description || 'No description'}
Topics: ${topics.join(', ') || 'None'}
README excerpt: ${readme?.slice(0, 1500) || 'Not available'}

Available categories:
${categoryList}

Respond with JSON only:
{
  "category": "category-id or null if none fit",
  "confidence": 0.0-1.0,
  "repoType": "skill|mcp-server|claude-tool|prompt-library|related-repo",
  "typeConfidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "suggestNewCategory": "new-category-id or null" // if existing categories don't fit well
}`;
}
