import { cn, getInitials } from '@/lib/utils';
import { useState } from 'react';

export const UserAvatar: React.FC<{ name: string; avatarUrl?: string | null; size?: 'sm' | 'md'; className?: string }> = ({
    name,
    avatarUrl,
    size = 'md',
    className,
}) => {
    const [imgError, setImgError] = useState(false);
    const sizeMap = {
        sm: 'h-9 w-9 text-xs',
        md: 'h-11 w-11 text-base',
    };

    return (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-medium text-primary',
                sizeMap[size],
                className,
            )}
        >
            {avatarUrl && !imgError ? (
                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" onError={() => setImgError(true)} />
            ) : (
                <span>{getInitials(name)}</span>
            )}
        </div>
    );
};
