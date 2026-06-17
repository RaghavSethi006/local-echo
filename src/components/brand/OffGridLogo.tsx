import { cn } from '@/lib/utils';

interface OffGridLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export function OffGridLogo({ className, size = 40, showWordmark = false }: OffGridLogoProps) {
  const gradId = `og-grad-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="OffGrid"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(187, 94%, 43%)" />
            <stop offset="100%" stopColor="hsl(199, 89%, 48%)" />
          </linearGradient>
        </defs>

        <rect x="13" y="26" width="3" height="6" rx="1.5" fill={`url(#${gradId})`} opacity="0.4" />
        <rect x="18.5" y="19" width="3" height="16" rx="1.5" fill={`url(#${gradId})`} opacity="0.7" />
        <rect x="24" y="10" width="3" height="26" rx="1.5" fill={`url(#${gradId})`} />
      </svg>
      {showWordmark && (
        <span className="text-gradient font-bold text-sm tracking-widest mt-1">OFFGRID</span>
      )}
    </div>
  );
}
