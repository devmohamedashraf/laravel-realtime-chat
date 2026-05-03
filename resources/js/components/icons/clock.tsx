// components/icons/ClockIcon.tsx
import { cn } from '@/lib/utils';
import React from 'react';

interface ClockIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    className?: string;
}

export const ClockIcon: React.FC<ClockIconProps> = ({ size = 16, className, ...props }) => {
    return (
        <svg viewBox="0 0 16 15" width={size} height={size} version="1.1" className={cn('inline-block', className)} fill="currentColor" {...props}>
            <path d="M9.75,7.713H8.244V5.359c0-0.276-0.224-0.5-0.5-0.5H7.65c-0.276,0-0.5,0.224-0.5,0.5v2.947 c0,0.276,0.224,0.5,0.5,0.5h0.094c0.001,0,0.002-0.001,0.003-0.001S7.749,8.807,7.75,8.807h2c0.276,0,0.5-0.224,0.5-0.5V8.213 C10.25,7.937,10.026,7.713,9.75,7.713z M9.75,2.45h-3.5c-1.82,0-3.3,1.48-3.3,3.3v3.5c0,1.82,1.48,3.3,3.3,3.3h3.5 c1.82,0,3.3-1.48,3.3-3.3v-3.5C13.05,3.93,11.57,2.45,9.75,2.45z M11.75,9.25c0,1.105-0.895,2-2,2h-3.5c-1.104,0-2-0.895-2-2v-3.5 c0-1.104,0.896-2,2-2h3.5c1.105,0,2,0.896,2,2V9.25z" />
        </svg>
    );
};

// Alternative: MessageTimeIcon for more specific naming
export const MessageTimeIcon = ClockIcon;
