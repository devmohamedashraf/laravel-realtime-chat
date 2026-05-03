import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getInitials = (name: string): string =>
    name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

export const formatTime = (date: string): string => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const formatDateForSidebar = (date: string): string => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
        return formatTime(date);
    }
    if (d.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
};

export const formatDateSeparator = (date: string): string => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
        return 'Today';
    }
    if (d.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
