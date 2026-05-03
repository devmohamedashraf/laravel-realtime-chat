import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
    name: string;
    className?: string;
}

export const TypingIndicator: React.FC<Props> = ({ name, className }) => {
    return (
        <div className={cn('flex items-center gap-2 px-2 py-1', className)}>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3 py-2 shadow-xs">
                <span className="text-xs text-muted-foreground">{name} is typing</span>
                <div className="ml-1 flex items-center gap-0.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
            </div>
        </div>
    );
};
