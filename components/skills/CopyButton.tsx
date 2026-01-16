'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label: string;
  sublabel: string;
}

export function CopyButton({ text, label, sublabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full p-3 text-left text-sm rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
    >
      <div className="font-medium">{copied ? 'Copied!' : label}</div>
      <code className="text-xs text-muted">{sublabel}</code>
    </button>
  );
}
