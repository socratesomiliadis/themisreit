export default function Cross({ className }: { className?: string }) {
  return (
    <svg
      width="100%"
      viewBox="0 0 10 10"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 10L5 0" stroke="currentColor" />
      <line y1="5" x2="10" y2="5" stroke="currentColor" />
    </svg>
  );
}
