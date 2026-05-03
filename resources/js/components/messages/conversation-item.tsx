import { cn, formatDateForSidebar } from '@/lib/utils';
import { useMessageActions, useSelectedUser } from '@/stores/use-message-store';
import type { Conversation } from '@/types/messages';
import React from 'react';
import MessageReceiptIndicator from './message-receipt-indicator';
import { UserAvatar } from './user-avatar';

export const ConversationItem: React.FC<{
    conversation: Conversation;
}> = ({ conversation }) => {
    const selectedUser = useSelectedUser();
    const { selectConversation } = useMessageActions();
    const { user, messages, unread_count, last_message } = conversation;
    const latestFromMessages = messages.length > 0 ? messages.reduce((latest, current) => (current.id > latest.id ? current : latest)) : undefined;
    const lastMessage = !last_message || (latestFromMessages && latestFromMessages.id > last_message.id) ? latestFromMessages : last_message;
    const previewText = lastMessage?.content?.trim() ? lastMessage.content : 'No messages yet';
    const isSelected = selectedUser?.id === user.id;

    const onSelect = () => {
        selectConversation(user);
    };
    return (
        <button
            onClick={onSelect}
            className={cn(
                'w-full rounded-lg p-3 text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isSelected && 'bg-muted',
            )}
        >
            <div className="flex items-center gap-3">
                <UserAvatar name={user.name} avatarUrl={user.avatar_url} />
                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-semibold">{user.name}</span>
                        <span className={`shrink-0 text-xs ${unread_count > 0 ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                            {formatDateForSidebar(lastMessage?.created_at || '')}
                        </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                            {conversation.is_sender && lastMessage && (
                                <span className="inline h-lh w-4 shrink-0 items-center justify-center">
                                    <MessageReceiptIndicator message={lastMessage} />
                                </span>
                            )}
                            <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{previewText}</p>
                        </div>
                        {unread_count > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                                {unread_count}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
};
