import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';
import React from 'react';

interface Props {
    unreadCount: number;
    onClick: () => void;
    className?: string;
}

export const ScrollToBottomButton: React.FC<Props> = ({ unreadCount, onClick, className }) => {
    return (
        <Button
            onClick={onClick}
            size="icon"
            variant="secondary"
            className={cn('absolute right-6 bottom-20 z-30 h-10 w-10 rounded-full shadow-lg', 'transition-all duration-200', className)}
            aria-label="Scroll to latest messages"
        >
            {unreadCount > 0 ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            ) : (
                <ArrowDown className="h-4 w-4" />
            )}
        </Button>
    );
};
