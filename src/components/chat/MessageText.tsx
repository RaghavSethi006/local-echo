import { Fragment } from 'react';
import { parseSafeHttpUrl } from '@/lib/qr';
import { cn } from '@/lib/utils';

interface MessageTextProps {
  content: string;
  className?: string;
}

const URL_TOKEN_REGEX = /(https?:\/\/[^\s<>"']+)/g;

export function MessageText({ content, className }: MessageTextProps) {
  const parts = content.split(URL_TOKEN_REGEX);

  return (
    <p className={cn('text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words', className)}>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          const safeHref = parseSafeHttpUrl(part);
          if (safeHref) {
            return (
              <a
                key={`${index}-${safeHref}`}
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline decoration-primary/50 underline-offset-2 hover:decoration-primary break-all"
              >
                {part}
              </a>
            );
          }
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </p>
  );
}
