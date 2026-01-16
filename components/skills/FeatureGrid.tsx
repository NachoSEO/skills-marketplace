interface FeatureGridProps {
  pros?: string[];
  cons?: string[];
}

export function FeatureGrid({ pros, cons }: FeatureGridProps) {
  if ((!pros || pros.length === 0) && (!cons || cons.length === 0)) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Pros */}
      {pros && pros.length > 0 && (
        <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-green-600 dark:text-green-400"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-semibold text-green-700 dark:text-green-300">
              Strengths
            </h3>
          </div>
          <ul className="space-y-2.5">
            {pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold">
                  +
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {pro}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cons */}
      {cons && cons.length > 0 && (
        <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-amber-600 dark:text-amber-400"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="font-semibold text-amber-700 dark:text-amber-300">
              Considerations
            </h3>
          </div>
          <ul className="space-y-2.5">
            {cons.map((con, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  !
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {con}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
