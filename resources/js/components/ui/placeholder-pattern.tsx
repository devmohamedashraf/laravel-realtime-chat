import { cn } from '@/lib/utils';
import { useId } from 'react';

type PlaceholderPatternProps = React.SVGProps<SVGSVGElement>;

export function PlaceholderPattern({ className, ...props }: PlaceholderPatternProps) {
    const patternId = useId();

    return (
        <svg aria-hidden="true" className={cn('text-muted-foreground/50', className)} fill="none" {...props}>
            <defs>
                <pattern id={patternId} width="32" height="32" patternUnits="userSpaceOnUse" x="-1" y="-1">
                    <path d="M32 0H0V32" stroke="currentColor" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
    );
}