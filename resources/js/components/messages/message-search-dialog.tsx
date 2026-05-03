import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { messageService } from '@/services/message-service';
import { useSelectedUser } from '@/stores/use-message-store';
import type { Message } from '@/types/messages';
import { Search } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const MessageSearchDialog: React.FC<Props> = ({ open, onOpenChange }) => {
    const selectedUser = useSelectedUser();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Message[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearch = useCallback(
        (value: string) => {
            setQuery(value);
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            if (value.trim().length < 2) {
                setResults([]);
                return;
            }
            debounceRef.current = setTimeout(async () => {
                setIsSearching(true);
                try {
                    const data = await messageService.searchMessages(value.trim(), selectedUser?.id);
                    setResults(data);
                } catch {
                    setResults([]);
                } finally {
                    setIsSearching(false);
                }
            }, 400);
        },
        [selectedUser],
    );

    const handleClose = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            setQuery('');
            setResults([]);
        }
    };

    const formatDate = (timestamp: string) =>
        new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Search Messages</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search in conversation..."
                        className="pl-9"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {isSearching ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map((msg) => (
                                <div key={msg.id} className="rounded-lg p-3 hover:bg-accent">
                                    <p className="text-xs text-muted-foreground">
                                        {msg.sender?.name ?? 'Unknown'} · {formatDate(msg.created_at)}
                                    </p>
                                    <p className="mt-0.5 text-sm">{msg.content}</p>
                                </div>
                            ))}
                        </div>
                    ) : query.length >= 2 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">No messages found</p>
                    ) : (
                        <p className="py-6 text-center text-sm text-muted-foreground">Type at least 2 characters to search</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
