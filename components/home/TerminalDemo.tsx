'use client';

import { useState, useEffect } from 'react';

interface TerminalLine {
  type: 'command' | 'output' | 'success' | 'info';
  text: string;
  delay: number;
}

const terminalSequence: TerminalLine[] = [
  { type: 'command', text: 'cd ~/.claude/skills', delay: 0 },
  { type: 'output', text: '', delay: 300 },
  { type: 'command', text: 'git clone https://github.com/anthropics/skills/pdf-to-markdown', delay: 500 },
  { type: 'output', text: 'Cloning into \'pdf-to-markdown\'...', delay: 800 },
  { type: 'output', text: 'remote: Enumerating objects: 42, done.', delay: 1200 },
  { type: 'output', text: 'remote: Counting objects: 100% (42/42), done.', delay: 1500 },
  { type: 'success', text: 'Receiving objects: 100% (42/42), 8.2 KiB | 8.2 MiB/s, done.', delay: 1800 },
  { type: 'output', text: '', delay: 2000 },
  { type: 'info', text: '✓ Skill installed successfully!', delay: 2200 },
  { type: 'output', text: '', delay: 2400 },
  { type: 'command', text: 'cat SKILL.md', delay: 2600 },
  { type: 'output', text: '# PDF to Markdown Converter', delay: 2900 },
  { type: 'output', text: 'Convert PDF documents to clean markdown...', delay: 3100 },
];

export function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (visibleLines < terminalSequence.length) {
      const currentLine = terminalSequence[visibleLines];
      const nextDelay = visibleLines === 0 ? 500 : terminalSequence[visibleLines].delay - (terminalSequence[visibleLines - 1]?.delay || 0);

      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
      }, nextDelay);

      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      // Reset after a pause
      const resetTimer = setTimeout(() => {
        setVisibleLines(0);
        setIsTyping(true);
      }, 5000);
      return () => clearTimeout(resetTimer);
    }
  }, [visibleLines]);

  const renderLine = (line: TerminalLine, index: number) => {
    if (line.type === 'command') {
      return (
        <div key={index} className="flex items-start gap-2">
          <span className="text-terminal shrink-0">$</span>
          <span className="text-foreground">{line.text}</span>
        </div>
      );
    }
    if (line.type === 'success') {
      return (
        <div key={index} className="text-terminal">
          {line.text}
        </div>
      );
    }
    if (line.type === 'info') {
      return (
        <div key={index} className="text-accent font-medium">
          {line.text}
        </div>
      );
    }
    return (
      <div key={index} className="text-muted">
        {line.text || '\u00A0'}
      </div>
    );
  };

  return (
    <div className="terminal-card rounded-xl overflow-hidden shadow-2xl shadow-black/20 border border-border">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-secondary/80 border-b border-border">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-muted font-mono">zsh — skillsforge</span>
        </div>
        <div className="w-14" /> {/* Spacer for symmetry */}
      </div>

      {/* Terminal content */}
      <div className="p-4 bg-card/95 font-mono text-sm min-h-[280px] scan-lines relative">
        <div className="space-y-1">
          {terminalSequence.slice(0, visibleLines).map((line, index) => renderLine(line, index))}
        </div>

        {/* Typing cursor */}
        {isTyping && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-terminal">$</span>
            <span className="w-2 h-4 bg-terminal animate-pulse" />
          </div>
        )}
      </div>

      {/* Terminal footer */}
      <div className="px-4 py-2 bg-secondary/50 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
          <span>{isTyping ? 'Running...' : 'Ready'}</span>
        </div>
        <div className="text-xs text-muted font-mono">
          ~/.claude/skills
        </div>
      </div>
    </div>
  );
}
