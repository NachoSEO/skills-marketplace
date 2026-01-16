'use client';

import { useState } from 'react';
import type { Skill } from '@/types';

interface InstallPanelProps {
  skill: Skill;
}

type InstallTab = 'command' | 'claude' | 'codex' | 'project';

export function InstallPanel({ skill }: InstallPanelProps) {
  const [activeTab, setActiveTab] = useState<InstallTab>('command');
  const [copied, setCopied] = useState(false);

  const installCommand = skill.installCommand || `git clone ${skill.githubUrl}`;

  const tabs: { id: InstallTab; label: string; command: string; description: string }[] = [
    {
      id: 'command',
      label: 'Clone',
      command: installCommand,
      description: 'Clone the repository to your local machine',
    },
    {
      id: 'claude',
      label: 'Claude Code',
      command: `~/.claude/skills/${skill.slug}`,
      description: 'Install to Claude Code global skills directory',
    },
    {
      id: 'codex',
      label: 'Codex CLI',
      command: `~/.codex/skills/${skill.slug}`,
      description: 'Install to Codex CLI skills directory',
    },
    {
      id: 'project',
      label: 'Project',
      command: `.claude/skills/${skill.slug}`,
      description: 'Install to project-specific skills directory',
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  const handleCopy = async () => {
    const textToCopy = activeTab === 'command' ? currentTab.command : `# Copy to: ${currentTab.command}\n${installCommand}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header with terminal styling */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-sm font-mono text-muted">install.sh</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={skill.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>View Source</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-secondary/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-terminal'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terminal" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-muted mb-3">{currentTab.description}</p>

        {/* Command display */}
        <div className="relative group">
          <div className="p-4 pr-24 rounded-lg bg-[#0d1117] dark:bg-[#0a0a0a] font-mono text-sm overflow-x-auto">
            <div className="flex items-start gap-3">
              <span className="text-terminal select-none shrink-0">$</span>
              <code className="text-green-400 dark:text-green-300 break-all">
                {activeTab === 'command' ? currentTab.command : (
                  <>
                    <span className="text-gray-500"># Install to: </span>
                    <span className="text-cyan-400">{currentTab.command}</span>
                    <br />
                    {installCommand}
                  </>
                )}
              </code>
            </div>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              copied
                ? 'bg-terminal text-primary-foreground'
                : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mt-4">
          <a
            href={skill.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-terminal text-primary-foreground font-medium hover:bg-terminal/90 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Get Skill
          </a>
          <a
            href={`${skill.githubUrl}/archive/refs/heads/main.zip`}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-foreground font-medium transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            ZIP
          </a>
        </div>
      </div>
    </div>
  );
}
