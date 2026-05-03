import { useMessages } from '@/stores/use-message-store';
import type { Message } from '@/types/messages';
import { useMemo } from 'react';

/**
 * Custom hook to group messages with date separators
 */
export const useGroupedMessages = () => {
    const messages = useMessages();

    const messagesWithDates = useMemo(() => {
        const items: (Message | { type: 'date'; date: string })[] = [];
        let lastDate: string | null = null;

        messages.forEach((message) => {
            const messageDate = new Date(message.created_at).toDateString();
            if (messageDate !== lastDate) {
                items.push({ type: 'date', date: message.created_at });
                lastDate = messageDate;
            }
            items.push(message);
        });

        return items;
    }, [messages]);

    return messagesWithDates;
};
