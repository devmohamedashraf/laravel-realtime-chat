import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useOnlineUsers } from '@/hooks/use-online-users';
import { useMessageActions, useSelectedUser } from '@/stores/use-message-store';
import type { User as ChatUser } from '@/types/messages';
import { MoreVertical, Search, Trash2, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { MessageSearchDialog } from './message-search-dialog';
import { UserAvatar } from './user-avatar';

export const ChatHeader: React.FC = () => {
    const selectedUser = useSelectedUser();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { setSelectedUser } = useMessageActions();
    const { getLastSeenAt } = useOnlineUsers();

    const getStatusText = (user: ChatUser): string => {
        const polledLastSeenAt = getLastSeenAt(user.id);
        const lastSeenToUse = polledLastSeenAt !== undefined ? polledLastSeenAt : user.last_seen_at;

        if (!lastSeenToUse) return 'Offline';

        const now = new Date();
        const lastSeen = new Date(lastSeenToUse);
        const diffMs = now.getTime() - lastSeen.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        // If within 2 minutes, consider "Active now"
        if (diffMins < 2) return 'Active now';

        if (diffMins < 60) return `last seen ${diffMins}m ago`;
        if (diffMins < 1440) return `last seen ${Math.floor(diffMins / 60)}h ago`;
        return `last seen ${lastSeen.toLocaleDateString()}`;
    };

    if (!selectedUser) return null;

    const handleCloseChat = () => {
        setSelectedUser(null);
    };

    return (
        <>
            <div className="flex shrink-0 items-center gap-3 bg-white p-4 backdrop-blur-sm dark:bg-chat-background">
                <UserAvatar name={selectedUser.name} avatarUrl={selectedUser.avatar_url} className="size-10" />
                <div>
                    <h3 className="text-sm font-semibold">{selectedUser.name}</h3>
                    <p className="text-xs text-muted-foreground">{getStatusText(selectedUser)}</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} aria-label="Search messages">
                        <Search className="size-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="More options" />}>
                            <MoreVertical className="size-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                                <User className="mr-2 size-4" />
                                View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCloseChat}>
                                <X className="mr-2 size-4" />
                                Close chat
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 size-4" />
                                Clear chat
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <MessageSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </>
    );
};
