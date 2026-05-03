import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';
import React from 'react';

export const EmptyState: React.FC<{
    icon?: React.ReactNode;
    title: string;
    description?: string;
    className?: string;
}> = ({ icon = <MessageCircle className="h-12 w-12" />, title, description, className }) => (
    <div className={cn('flex h-full flex-col items-center justify-center p-8 text-center', className)}>
        <div className="mb-3 text-muted-foreground/30">{icon}</div>
        <h3 className="font-medium text-muted-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground/70">{description}</p>}
    </div>
);
