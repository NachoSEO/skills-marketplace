'use client';

import { Fragment, ReactNode } from 'react';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const cleaned = cleanMarkdown(content);
  const sections = parseMarkdown(cleaned);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div key={index} className="group">
          {section.heading && (
            <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal" />
              {section.heading}
            </h3>
          )}
          <div className="text-sm text-muted leading-relaxed space-y-3">
            {section.paragraphs.map((para, pIndex) => {
              if (para.type === 'list') {
                return (
                  <ul key={pIndex} className="space-y-2 ml-1">
                    {para.items.map((item, iIndex) => (
                      <li key={iIndex} className="flex items-start gap-2.5">
                        <span className="text-terminal mt-1.5 text-xs">▸</span>
                        <span>{formatInlineText(item)}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (para.type === 'code') {
                return (
                  <div key={pIndex} className="rounded-lg overflow-hidden border border-border bg-secondary/50">
                    {para.language && (
                      <div className="px-4 py-2 bg-secondary/80 border-b border-border text-xs text-muted font-mono">
                        {para.language}
                      </div>
                    )}
                    <pre className="p-4 overflow-x-auto">
                      <code className="text-xs font-mono text-foreground">{para.code}</code>
                    </pre>
                  </div>
                );
              }
              if (para.type === 'image') {
                return (
                  <div key={pIndex} className="my-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={para.src}
                      alt={para.alt}
                      className="max-w-full rounded-lg border border-border"
                      loading="lazy"
                    />
                  </div>
                );
              }
              if (para.type === 'table') {
                return (
                  <div key={pIndex} className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-xs">
                      {para.headers.length > 0 && (
                        <thead>
                          <tr className="bg-secondary/50 border-b border-border">
                            {para.headers.map((h, hIdx) => (
                              <th key={hIdx} className="text-left px-3 py-2 font-medium text-muted">
                                {formatInlineText(h)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {para.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-border/50 last:border-0">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3 py-2">
                                {formatInlineText(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return (
                <p key={pIndex}>{formatInlineText(para.text)}</p>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Strip HTML, resolve reference-style links, and clean up raw GitHub READMEs
function cleanMarkdown(content: string): string {
  let cleaned = content;

  // --- Step 1: Resolve reference-style links/images ---
  // Parse reference definitions: [key]: url
  const refDefs = new Map<string, string>();
  cleaned = cleaned.replace(/^\[([^\]]+)\]:\s*(.+)$/gm, (_, key, url) => {
    refDefs.set(key.toLowerCase(), url.trim());
    return ''; // Remove definition lines
  });

  // Resolve reference-style images: ![alt][ref]
  cleaned = cleaned.replace(/!\[([^\]]*)\]\[([^\]]*)\]/g, (match, alt, ref) => {
    const url = refDefs.get((ref || alt).toLowerCase());
    return url ? `![${alt}](${url})` : '';
  });

  // Resolve reference-style links: [text][ref]
  cleaned = cleaned.replace(/\[([^\]]+)\]\[([^\]]*)\]/g, (match, text, ref) => {
    const url = refDefs.get((ref || text).toLowerCase());
    return url ? `[${text}](${url})` : text;
  });

  // --- Step 2: Remove badges, shield images, and junk patterns ---
  // Remove badge images (shields.io, img.shields.io, badge URLs)
  cleaned = cleaned.replace(/!\[[^\]]*\]\([^)]*(?:shields\.io|badge|img\.shields)[^)]*\)/g, '');
  // Remove badge images wrapped in links: [![badge](shield-url)](link-url)
  cleaned = cleaned.replace(/\[!\[[^\]]*\]\([^)]*(?:shields\.io|badge|img\.shields)[^)]*\)\]\([^)]*\)/g, '');
  // Remove GitHub stats images (github-readme-stats, github-profile-trophy, streak-stats, etc.)
  cleaned = cleaned.replace(/!\[[^\]]*\]\([^)]*(?:github-readme-stats|github-profile-trophy|streak-stats|visitor-badge|hits\.seeyoufarm|komarev\.com|forthebadge|count\.getloli)[^)]*\)/g, '');
  // Remove empty links: [](url) — leftover after badge image stripping
  cleaned = cleaned.replace(/\[\s*\]\([^)]*\)/g, '');
  // Remove image-only links where the image was already stripped: [![](url)](url)
  cleaned = cleaned.replace(/\[!\[\]\([^)]*\)\]\([^)]*\)/g, '');
  // Remove any remaining linked images: [![alt](img)](url)
  cleaned = cleaned.replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '');

  // --- Step 3: Strip HTML ---
  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Convert <br> and <br/> to newlines
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');

  // Convert <h1>...</h1> through <h6>...</h6> to markdown headings
  for (let i = 1; i <= 6; i++) {
    const prefix = '#'.repeat(i);
    const regex = new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi');
    cleaned = cleaned.replace(regex, (_, text) => `${prefix} ${stripTags(text).trim()}`);
  }

  // Convert <a href="url">text</a> to plain text (links stripped)
  cleaned = cleaned.replace(/<a\s+[^>]*href=["'][^"']*["'][^>]*>(.*?)<\/a>/gi,
    (_, text) => stripTags(text).trim()
  );

  // Remove all <img> tags (images handled by markdown syntax)
  cleaned = cleaned.replace(/<img[^>]*\/?>/gi, '');

  // Convert <strong>/<b> to **bold**
  cleaned = cleaned.replace(/<(?:strong|b)>(.*?)<\/(?:strong|b)>/gi, '**$1**');

  // Convert <em>/<i> to *italic*
  cleaned = cleaned.replace(/<(?:em|i)>(.*?)<\/(?:em|i)>/gi, '*$1*');

  // Convert <code> to `code`
  cleaned = cleaned.replace(/<code>(.*?)<\/code>/gi, '`$1`');

  // Convert <li> to list items
  cleaned = cleaned.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => `- ${stripTags(text).trim()}`);

  // Convert <p> to paragraphs
  cleaned = cleaned.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => `${stripTags(text).trim()}\n`);

  // Remove remaining HTML block elements
  cleaned = cleaned.replace(/<\/?(?:div|section|details|summary|nav|header|footer|main|article|aside|figure|figcaption|picture|source|video|audio|iframe|table|thead|tbody|tr|td|th|ul|ol|dl|dt|dd|blockquote|sup|sub|span|center|kbd|samp|var|pre)[^>]*>/gi, '');

  // Remove any remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  cleaned = cleaned.replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/&lt;/g, '<');
  cleaned = cleaned.replace(/&gt;/g, '>');
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/&nbsp;/g, ' ');

  // Collapse excessive blank lines (3+ -> 2)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

interface Section {
  heading?: string;
  paragraphs: (
    | { type: 'paragraph'; text: string }
    | { type: 'list'; items: string[] }
    | { type: 'code'; language: string; code: string }
    | { type: 'image'; src: string; alt: string }
    | { type: 'table'; headers: string[]; rows: string[][] }
  )[];
}

function parseMarkdown(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentSection: Section = { paragraphs: [] };
  let currentList: string[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockLines: string[] = [];
  let tableLines: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      currentSection.paragraphs.push({ type: 'list', items: currentList });
      currentList = [];
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockLines.length > 0) {
      currentSection.paragraphs.push({
        type: 'code',
        language: codeBlockLanguage,
        code: codeBlockLines.join('\n'),
      });
      codeBlockLines = [];
      codeBlockLanguage = '';
    }
  };

  const flushTable = () => {
    if (tableLines.length >= 2) {
      const parseRow = (line: string) =>
        line.split('|').map(cell => cell.trim()).filter(Boolean);

      const headers = parseRow(tableLines[0]);
      // Skip separator line (index 1)
      const rows = tableLines.slice(2).map(parseRow);
      currentSection.paragraphs.push({ type: 'table', headers, rows });
    }
    tableLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for code block start/end
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushList();
        flushTable();
        inCodeBlock = true;
        codeBlockLanguage = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Table detection: line with pipes and next line is separator
    if (tableLines.length > 0) {
      if (trimmed.includes('|')) {
        tableLines.push(trimmed);
        continue;
      } else {
        flushTable();
        // Fall through to process current line
      }
    } else if (trimmed.includes('|') && i + 1 < lines.length) {
      const nextLine = lines[i + 1]?.trim() || '';
      if (nextLine.match(/^[\s|:-]+$/) && nextLine.includes('|')) {
        flushList();
        tableLines.push(trimmed);
        continue;
      }
    }

    if (!trimmed) {
      flushList();
      continue;
    }

    // Headings: # through ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      if (currentSection.heading || currentSection.paragraphs.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { heading: headingMatch[2], paragraphs: [] };
      continue;
    }

    // Skip lines that are only badge images, linked images, or empty image refs
    // [![...](...)], [![...](...)](...), ![](badge-url), [![][ref]][ref], etc.
    if (trimmed.match(/^\[?!\[.*?\]\(.*?\)\]?(\(.*?\))?$/) ||
        trimmed.match(/^\[!\[.*?\]\[.*?\]\]\[.*?\]$/) ||
        trimmed.match(/^!\[\]\[.*?\]$/) ||
        trimmed.match(/^\[\!\[\]\[.*?\]\]\[.*?\]$/)) {
      continue;
    }

    // Images: ![alt](src) — only show non-badge, non-empty images
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const src = imageMatch[2];
      // Skip badges, shields, and tracking pixels
      if (src.includes('shields.io') || src.includes('badge') ||
          src.includes('img.shields') || src.includes('streak-stats') ||
          src.includes('github-readme-stats') || src.includes('github-profile-trophy') ||
          src.includes('visitor-badge') || src.includes('hits.seeyoufarm') ||
          src.includes('count.getloli') || src.includes('komarev.com') ||
          src.includes('forthebadge') || src.includes('1x1') ||
          imageMatch[1] === '') {
        continue;
      }
      flushList();
      currentSection.paragraphs.push({ type: 'image', alt: imageMatch[1], src });
      continue;
    }

    // List items: - or * or numbered (1.)
    const listMatch = trimmed.match(/^(?:[-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      currentList.push(listMatch[1]);
      continue;
    }

    // Horizontal rule
    if (trimmed.match(/^[-*_]{3,}$/)) {
      flushList();
      continue;
    }

    // Skip orphan reference-style constructs that weren't resolved
    if (trimmed.match(/^\[!\[/) || trimmed.match(/^\[\]\[/) || trimmed.match(/^!\[\]\[/)) {
      continue;
    }

    // Skip empty links leftover from badge stripping
    if (trimmed.match(/^\[\s*\]\(/) || trimmed === '[]') {
      continue;
    }

    // Skip lines that are only links/language selectors (e.g. "English | 中文 | 日本語")
    // These are typically nav lines with pipe separators and mostly non-ASCII or link text
    if (trimmed.includes('|') && !trimmed.includes('`')) {
      const withoutLinks = trimmed.replace(/\[[^\]]*\]\([^)]*\)/g, '').replace(/\|/g, '').trim();
      // If after removing links and pipes there's very little left, it's a nav/language line
      if (withoutLinks.length < 10) {
        continue;
      }
    }

    flushList();

    // Skip paragraphs that are only whitespace or empty after cleanup
    const cleanedText = trimmed.replace(/\[[^\]]*\]\([^)]*\)/g, '').replace(/[*_`]/g, '').trim();
    if (!cleanedText) continue;

    currentSection.paragraphs.push({ type: 'paragraph', text: trimmed });
  }

  flushList();
  flushCodeBlock();
  flushTable();
  if (currentSection.heading || currentSection.paragraphs.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

function formatInlineText(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Strip [text](url) links — show text only
    const linkMatch = remaining.match(/^([\s\S]*?)\[([^\]]+)\]\([^)]+\)([\s\S]*)/);
    if (linkMatch && linkMatch[1].length < 200) {
      if (linkMatch[1]) parts.push(linkMatch[1]);
      parts.push(linkMatch[2]);
      remaining = linkMatch[3];
      continue;
    }

    // Match **bold**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*(.+?)\*\*([\s\S]*)/);
    if (boldMatch && boldMatch[1].length < 200) {
      if (boldMatch[1]) parts.push(boldMatch[1]);
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-medium text-foreground">
          {boldMatch[2]}
        </strong>
      );
      remaining = boldMatch[3];
      continue;
    }

    // Match `code`
    const codeMatch = remaining.match(/^([\s\S]*?)`(.+?)`([\s\S]*)/);
    if (codeMatch && codeMatch[1].length < 200) {
      if (codeMatch[1]) parts.push(codeMatch[1]);
      parts.push(
        <code
          key={`code-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-xs font-mono"
        >
          {codeMatch[2]}
        </code>
      );
      remaining = codeMatch[3];
      continue;
    }

    // No more patterns, push remaining text
    parts.push(remaining);
    break;
  }

  return parts.length === 1 ? parts[0] : <Fragment>{parts}</Fragment>;
}
