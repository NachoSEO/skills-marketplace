'use client';

import { Fragment, ReactNode } from 'react';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const sections = parseMarkdown(content);

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

interface Section {
  heading?: string;
  paragraphs: (
    | { type: 'paragraph'; text: string }
    | { type: 'list'; items: string[] }
    | { type: 'code'; language: string; code: string }
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

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for code block start/end
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        // Start of code block
        flushList();
        inCodeBlock = true;
        codeBlockLanguage = trimmed.slice(3).trim();
      }
      continue;
    }

    // If inside code block, collect lines
    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^##\s+(.+)$/);
    if (headingMatch) {
      flushList();
      if (currentSection.heading || currentSection.paragraphs.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { heading: headingMatch[1], paragraphs: [] };
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      currentList.push(listMatch[1]);
      continue;
    }

    flushList();
    currentSection.paragraphs.push({ type: 'paragraph', text: trimmed });
  }

  flushList();
  flushCodeBlock();
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
    // Match **bold**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*(.+?)\*\*([\s\S]*)/);
    if (boldMatch) {
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
    if (codeMatch) {
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
