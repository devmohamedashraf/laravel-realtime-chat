import { useMessageApi } from '@/hooks/api/use-message-api';
import { messageService } from '@/services/message-service';
import { useAuthUser } from '@/stores/use-auth-store';
import { useIsLoadingMessages, useMessageActions, useSelectedUser } from '@/stores/use-message-store';
import type { Message, MessagesDeliveredEvent, MessageSent, ReactionToggledEvent } from '@/types/messages';
import { useEcho } from '@laravel/echo-react';
import { User as UserIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import { useAutoScroll, useGroupedMessages } from '../../hooks/messages';
import { ChatBackgroundPattern } from './chat-background-pattern';
import { ChatHeader } from './chat-header';
import { DateSeparator } from './date-separator';
import { DeleteMessageDialog } from './delete-message-dialog';
import { EditMessageDialog } from './edit-message-dialog';
import { EmptyState } from './empty-state';
import { ForwardMessageDialog } from './forward-message-dialog';
import { LoadingSpinner } from './loading-spinner';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { ScrollToBottomButton } from './scroll-to-bottom-button';
import { TypingIndicator } from './typing-indicator';

export const ChatView: React.FC = () => {
    const selectedUser = useSelectedUser();
    const isLoadingMessages = useIsLoadingMessages();
    const user = useAuthUser();

    const [play] = useSound('/sounds/incoming-message-online-whatsapp.mp3', {
        volume: 1,
        interrupt: true,
    });

    const { updateMessage, addMessage, updateMessageReactions } = useMessageActions();

    // Typing indicator state
    const [typingName, setTypingName] = useState<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Scroll-to-bottom state
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [unreadScrollCount, setUnreadScrollCount] = useState(0);

    // Use custom hooks
    const { loadOlderMessages, hasMore, isLoadingMore } = useMessageApi();
    const messagesEndRef = useAutoScroll();
    const messagesWithDates = useGroupedMessages();
    const playSound = () => play();

    // Intersection observer for loading older messages
    const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const sentinel = loadMoreSentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    const container = scrollContainerRef.current;
                    const prevHeight = container?.scrollHeight ?? 0;

                    loadOlderMessages().then(() => {
                        // Restore scroll position after prepending
                        if (container) {
                            const newHeight = container.scrollHeight;
                            container.scrollTop += newHeight - prevHeight;
                        }
                    });
                }
            },
            { root: scrollContainerRef.current, rootMargin: '200px 0px 0px 0px', threshold: 0 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, loadOlderMessages]);

    // Typing channel: sorted IDs for stable channel name
    const typingChannel = user && selectedUser ? `typing.${[user.id, selectedUser.id].sort((a, b) => a - b).join('-')}` : null;

    const handleTypingWhisper = useCallback((e: { name: string }) => {
        setTypingName(e.name);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            setTypingName(null);
        }, 2500);
    }, []);

    const { channel: getTypingEchoChannel } = useEcho(typingChannel ?? 'dummy', '', () => {}, [], typingChannel ? 'private' : 'public');

    useEffect(() => {
        if (!typingChannel) {
            return;
        }

        const typingEchoChannel = getTypingEchoChannel();

        typingEchoChannel.listenForWhisper('typing', handleTypingWhisper);

        return () => {
            typingEchoChannel.stopListeningForWhisper('typing', handleTypingWhisper);
        };
    }, [getTypingEchoChannel, typingChannel, handleTypingWhisper]);

    useEcho(`chat.${user?.id}`, '.message.sent', (e: { message: MessageSent }) => {
        const message: MessageSent = e.message;
        addMessage(message, false);
        const isOpenedConversation = selectedUser?.id === message.sender_id;
        const hasSeenMessage = isOpenedConversation && !showScrollButton;

        if (hasSeenMessage) {
            playSound();
            messageService.markAsRead(message.id).catch(() => {});
            return;
        }

        if (isOpenedConversation) {
            playSound();
            setUnreadScrollCount((c) => c + 1);
        }
    });

    useEcho(`chat.${user?.id}`, '.message.read', (e: { message: Message }) => {
        const message: Message = e.message;
        updateMessage(message.id, message);
    });

    useEcho(`chat.${user?.id}`, '.message.delivered', (e: MessagesDeliveredEvent) => {
        const data: MessagesDeliveredEvent = e;
        const messageIds = data.message_ids;
        const deliveredAt = data.delivered_at;
        messageIds.forEach((id) => {
            updateMessage(id, { delivered_at: deliveredAt } as Message);
        });
    });

    useEcho(`chat.${user?.id}`, '.message.deleted', (e: { message: Message }) => {
        const message: Message = e.message;
        updateMessage(message.id, message);
    });

    useEcho(`chat.${user?.id}`, '.message.reaction.toggled', (e: ReactionToggledEvent) => {
        const data: ReactionToggledEvent = e;
        updateMessageReactions(data.message_id, data.reactions);
    });

    // Track scroll position for scroll-to-bottom button
    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        setShowScrollButton(!isNearBottom);
        if (isNearBottom) {
            setUnreadScrollCount(0);
        }
    }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setUnreadScrollCount(0);
    }, [messagesEndRef]);

    useEffect(() => {
        setUnreadScrollCount(0);
        setShowScrollButton(false);
    }, [selectedUser?.id]);

    if (!selectedUser) {
        return (
            <main className="flex-1">
                <EmptyState
                    icon={<UserIcon className="h-12 w-12" />}
                    title="Select a conversation"
                    description="Choose someone to start messaging"
                    className="bg-chat-background"
                />
            </main>
        );
    }

    return (
        <main className="relative flex h-full flex-1 flex-col bg-chat-background">
            <ChatBackgroundPattern />
            <div className="relative z-10 flex h-full flex-1 flex-col">
                <ChatHeader />
                <div ref={scrollContainerRef} onScroll={handleScroll} className="h-full flex-1 overflow-hidden overflow-y-scroll">
                    <div className="container mx-auto px-4 sm:px-12">
                        {isLoadingMessages ? (
                            <LoadingSpinner />
                        ) : (
                            <div className="space-y-1">
                                <div ref={loadMoreSentinelRef} className="h-1" />
                                {isLoadingMore && (
                                    <div className="flex justify-center py-2">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    </div>
                                )}
                                {messagesWithDates.map((item) => {
                                    if ('type' in item && item.type === 'date') {
                                        return (
                                            <DateSeparator
                                                key={`date-${(item as { type: 'date'; date: string }).date}`}
                                                date={(item as { type: 'date'; date: string }).date}
                                            />
                                        );
                                    }
                                    const message = item as Message;
                                    return <MessageBubble key={message.id} message={message} />;
                                })}
                                {typingName && <TypingIndicator name={typingName} className="pb-2" />}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </div>
                {showScrollButton && <ScrollToBottomButton unreadCount={unreadScrollCount} onClick={scrollToBottom} />}
                <MessageInput />
            </div>
            <EditMessageDialog />
            <DeleteMessageDialog />
            <ForwardMessageDialog />
        </main>
    );
};
