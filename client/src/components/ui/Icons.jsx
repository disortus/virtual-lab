export function LabLogoMark({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      aria-hidden="true"
      fill="none"
    >
      <rect width="32" height="32" rx="3" fill="#17212B" />
      <line x1="4" y1="16" x2="28" y2="16" stroke="#F3F0E8" strokeWidth="1.2" strokeDasharray="2 2" />
      <line x1="16" y1="4" x2="16" y2="28" stroke="#F3F0E8" strokeWidth="1.2" strokeDasharray="2 2" />
      <circle cx="16" cy="16" r="8" stroke="#EF8737" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="2.6" fill="#315BE8" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
      <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.8" />
      <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.8" />
      <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M8 1.5L9.6 6.4L14.5 8L9.6 9.6L8 14.5L6.4 9.6L1.5 8L6.4 6.4L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M4 3L13 8L4 13V3Z" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <rect x="3.5" y="3" width="3" height="10" />
      <rect x="9.5" y="3" width="3" height="10" />
    </svg>
  );
}

export function ResetIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M3.5 7.5A4.8 4.8 0 1 1 5 11.2M3.5 4V7.5H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
