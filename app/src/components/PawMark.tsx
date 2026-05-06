type Props = {
  className?: string;
  size?: number;
};

export function PawMark({ className, size = 28 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <ellipse cx="16" cy="22" rx="6.5" ry="5.5" fill="currentColor" />
      <ellipse cx="7" cy="14" rx="3" ry="3.5" fill="currentColor" />
      <ellipse cx="25" cy="14" rx="3" ry="3.5" fill="currentColor" />
      <ellipse cx="11" cy="7" rx="2.5" ry="3" fill="currentColor" />
      <ellipse cx="21" cy="7" rx="2.5" ry="3" fill="currentColor" />
    </svg>
  );
}
