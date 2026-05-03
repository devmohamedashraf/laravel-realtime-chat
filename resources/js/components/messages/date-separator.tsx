import { cn, formatDateSeparator } from '@/lib/utils';
import React from 'react';

export const DateSeparator: React.FC<{ date: string; className?: string }> = ({ date, className }) => (
    <div className={cn('sticky my-4 flex items-center justify-center', className)}>
        <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{formatDateSeparator(date)}</div>
    </div>
);
