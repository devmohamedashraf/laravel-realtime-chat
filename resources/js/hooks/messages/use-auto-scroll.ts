import { useMessages } from '@/stores/use-message-store';
import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle auto-scrolling to the bottom of messages
 */
export const useAutoScroll = () => {
    const messages = useMessages();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return messagesEndRef;
};
