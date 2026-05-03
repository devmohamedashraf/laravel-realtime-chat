import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { messageService } from '@/services/message-service';
import { useAuthUser } from '@/stores/use-auth-store';
import { useConversations, useIsForwardDialogOpen, useMessageActions, useSelectedMessage } from '@/stores/use-message-store';
import type { User } from '@/types/messages';
import { Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { UserAvatar } from './user-avatar';

export const ForwardMessageDialog: React.FC = () => {
    const isOpen = useIsForwardDialogOpen();
    const selectedMessage = useSelectedMessage();
    const { setIsForwardDialogOpen, setSelectedMessage } = useMessageActions();
    const conversations = useConversations();
    const user = useAuthUser();

    const [search, setSearch] = useState('');
    const [isForwarding, setIsForwarding] = useState(false);

    const users: User[] = useMemo(() => {
        return conversations
            .map((c) => c.user)
            .filter((u) => u.id !== user?.id)
            .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));
    }, [conversations, user, search]);

    const handleForward = async (recipient: User) => {
        if (!selectedMessage) return;
        setIsForwarding(true);
        try {
            await messageService.sendMessage(recipient.id, selectedMessage.content);
            toast.success(`Message forwarded to ${recipient.name}`);
            setIsForwardDialogOpen(false);
            setSelectedMessage(null);
        } catch {
            toast.error('Failed to forward message');
        } finally {
            setIsForwarding(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsForwardDialogOpen(open);
        if (!open) {
            setSelectedMessage(null);
            setSearch('');
        }
    };

    if (!selectedMessage) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Forward Message</DialogTitle>
                    <DialogDescription>Choose who to forward this message to</DialogDescription>
                </DialogHeader>

                <div className="mt-2 rounded-md bg-muted p-3">
                    <p className="line-clamp-2 text-sm text-muted-foreground">"{selectedMessage.content}"</p>
                </div>

                <div className="relative">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search people..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <div className="max-h-60 space-y-1 overflow-y-auto">
                    {users.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">No contacts found</p>
                    ) : (
                        users.map((u) => (
                            <button
                                key={u.id}
                                type="button"
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => handleForward(u)}
                                disabled={isForwarding}
                            >
                                <UserAvatar name={u.name} avatarUrl={u.avatar_url} size="sm" />
                                <span className="text-sm font-medium">{u.name}</span>
                            </button>
                        ))
                    )}
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
