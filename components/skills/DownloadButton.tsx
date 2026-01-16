'use client';

interface DownloadButtonProps {
  owner: string;
  repo: string;
  skillName: string;
}

export function DownloadButton({ owner, repo, skillName }: DownloadButtonProps) {
  const handleDownload = () => {
    window.location.href = `/api/download/${owner}/${repo}`;
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-terminal text-background font-medium hover:bg-terminal/90 transition-colors"
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
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download ZIP
    </button>
  );
}
