// hooks/api/use-message-api.ts
import { messageService } from '@/services/message-service';
import { useAuthUser } from '@/stores/use-auth-store';
import { useMessageActions, useSelectedUser } from '@/stores/use-message-store';
import { MessageSent } from '@/types/messages';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useMessageApi = () => {
    const { setDraftMessage, addMessage, replaceMessage, updateMessage, setConversationMessages, prependMessages, setIsLoadingMessages } =
        useMessageActions();
    const selectedUser = useSelectedUser();
    const user = useAuthUser();
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const nextCursorRef = useRef<number | null>(null);

    const fetchMessages = useCallback(async () => {
        if (!selectedUser) return;

        setIsLoadingMessages(true);
        try {
            const result = await messageService.getMessages(selectedUser.id);
            setConversationMessages(selectedUser.id, result.data);
            setHasMore(result.has_more);
            nextCursorRef.current = result.next_cursor;
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            throw error;
        } finally {
            setIsLoadingMessages(false);
        }
    }, [selectedUser, setConversationMessages, setIsLoadingMessages]);

    const loadOlderMessages = useCallback(async () => {
        if (!selectedUser || !hasMore || isLoadingMore || !nextCursorRef.current) return;

        setIsLoadingMore(true);
        try {
            const result = await messageService.getMessages(selectedUser.id, nextCursorRef.current);
            prependMessages(selectedUser.id, result.data);
            setHasMore(result.has_more);
            nextCursorRef.current = result.next_cursor;
        } catch (error) {
            console.error('Failed to load older messages:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [selectedUser, hasMore, isLoadingMore, prependMessages]);

    const sendMessage = async (content: string) => {
        if (!selectedUser || !user) {
            console.warn('No user selected or user not authenticated for sending message');
            return;
        }
        const optimisticMessage: MessageSent = {
            id: Date.now(), // Temporary ID
            sender_id: user.id,
            recipient_id: selectedUser.id,
            sender: user,
            recipient: selectedUser,
            content,
            type: 'text',
            isOptimistic: true,
            read_at: null,
            delivered_at: null,
            edited_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Optimistic update
        addMessage(optimisticMessage, true);

        try {
            const sentMessage = await messageService.sendMessage(selectedUser.id, content);
            // Replace optimistic message with the one from server
            replaceMessage(optimisticMessage.id, sentMessage);
            setDraftMessage('');
        } catch (error) {
            // On error, remove the optimistic message
            updateMessage(optimisticMessage.id, { isFailed: true });
            console.error('Failed to send message:', error);
        }
    };

    const sendFile = async (file: File) => {
        if (!selectedUser || !user) return;

        const isImage = file.type.startsWith('image/');
        const objectUrl = isImage ? URL.createObjectURL(file) : null;

        const optimisticMessage: MessageSent = {
            id: Date.now(),
            sender_id: user.id,
            recipient_id: selectedUser.id,
            sender: user,
            recipient: selectedUser,
            content: '',
            type: isImage ? 'image' : 'file',
            attachment: objectUrl
                ? { url: objectUrl, name: file.name, size: file.size, mime: file.type }
                : { url: '', name: file.name, size: file.size, mime: file.type },
            isOptimistic: true,
            read_at: null,
            delivered_at: null,
            edited_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        addMessage(optimisticMessage, true);

        try {
            const sentMessage = await messageService.sendFile(selectedUser.id, file);
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            replaceMessage(optimisticMessage.id, sentMessage);
        } catch (error) {
            updateMessage(optimisticMessage.id, { isFailed: true });
            console.error('Failed to send file:', error);
        }
    };

    useEffect(() => {
        if (selectedUser?.id) {
            setHasMore(false);
            nextCursorRef.current = null;
            fetchMessages();
        }
    }, [fetchMessages, selectedUser?.id]);

    return {
        sendMessage,
        sendFile,
        fetchMessages,
        loadOlderMessages,
        hasMore,
        isLoadingMore,
        refetch: fetchMessages,
    };
};
