interface CodeSignalsProps {
  signals: {
    hasTests: boolean;
    hasCI: boolean;
    hasDocker: boolean;
    hasTypes: boolean;
    hasSkillMd: boolean;
  };
}

const SIGNAL_CONFIG = [
  { key: 'hasTests' as const, label: 'Tests' },
  { key: 'hasCI' as const, label: 'CI/CD' },
  { key: 'hasDocker' as const, label: 'Docker' },
  { key: 'hasTypes' as const, label: 'Types' },
  { key: 'hasSkillMd' as const, label: 'SKILL.md' },
];

export function CodeSignals({ signals }: CodeSignalsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SIGNAL_CONFIG.map(({ key, label }) => {
        const hasSignal = signals[key];
        return (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border ${
              hasSignal
                ? 'bg-terminal/10 text-terminal border-terminal/30'
                : 'bg-secondary/50 text-muted border-border/50'
            }`}
          >
            {hasSignal ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {label}
          </span>
        );
      })}
    </div>
  );
}
