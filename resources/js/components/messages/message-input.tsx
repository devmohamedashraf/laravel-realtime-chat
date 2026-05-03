import { Button } from '@/components/ui/button';
import { EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch } from '@/components/ui/emoji-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useMessageApi } from '@/hooks/api/use-message-api';
import { useAuthUser } from '@/stores/use-auth-store';
import { useDraftMessage, useMessageActions, useSelectedUser } from '@/stores/use-message-store';
import { useEcho } from '@laravel/echo-react';
import { Paperclip, Send, Smile, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef } from 'react';

type WhisperChannel = {
    whisper: (event: string, payload: Record<string, unknown>) => void;
};

export const MessageInput: React.FC = () => {
    const draftMessage = useDraftMessage();
    const { setDraftMessage } = useMessageActions();
    const { sendMessage, sendFile } = useMessageApi();
    const selectedUser = useSelectedUser();
    const user = useAuthUser();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filePreview, setFilePreview] = React.useState<{ name: string; size: number } | null>(null);
    const [pendingFile, setPendingFile] = React.useState<File | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);

    // Derive typing channel key: sort IDs so both users resolve same channel
    const typingChannel = selectedUser && user ? `typing.${[user.id, selectedUser.id].sort((a, b) => a - b).join('-')}` : null;

    const { channel: getTypingEchoChannel } = useEcho(typingChannel ?? 'dummy', '', () => {}, [], typingChannel ? 'private' : 'public');

    const emitTyping = useCallback(() => {
        if (!user || !typingChannel || isTypingRef.current) {
            return;
        }

        isTypingRef.current = true;
        const channel = getTypingEchoChannel();

        if ('whisper' in channel) {
            (channel as WhisperChannel).whisper('typing', { name: user.name, userId: user.id });
        }
    }, [getTypingEchoChannel, user, typingChannel]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDraftMessage(e.target.value);
        emitTyping();
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
        }, 2000);
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        if (pendingFile) {
            await sendFile(pendingFile);
            setPendingFile(null);
            setFilePreview(null);
            return;
        }
        if (draftMessage.trim()) {
            sendMessage(draftMessage.trim());
        }
    };

    const onEmojiSelect = (emoji: string) => {
        setDraftMessage(draftMessage + emoji);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingFile(file);
        setFilePreview({ name: file.name, size: file.size });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const clearPendingFile = () => {
        setPendingFile(null);
        setFilePreview(null);
    };

    const canSend = !!(draftMessage.trim() || pendingFile);

    return (
        <div className="container mx-auto flex min-h-12 flex-col items-center justify-center rounded-full px-4">
            {filePreview && (
                <div className="mx-4 mt-2 mb-1 flex w-full items-center gap-2 rounded-lg bg-muted px-3 py-2">
                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm">{filePreview.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{(filePreview.size / 1024).toFixed(0)} KB</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={clearPendingFile}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}
            <div className="m-4 mt-0 mb-4 flex w-full shrink-0 items-center justify-center gap-2 rounded-full border-t bg-chat-input-background p-2 shadow-sm">
                <Popover>
                    <PopoverTrigger render={<Button variant="ghost" size="icon" className="shrink-0" />}>
                        <Smile className="h-5 w-5 text-muted-foreground" />
                    </PopoverTrigger>
                    <PopoverContent className="w-fit p-0">
                        <EmojiPicker className="h-85.5" onEmojiSelect={({ emoji }) => onEmojiSelect(emoji)}>
                            <EmojiPickerSearch />
                            <EmojiPickerContent />
                            <EmojiPickerFooter />
                        </EmojiPicker>
                    </PopoverContent>
                </Popover>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.zip" onChange={handleFileChange} />
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()} aria-label="Attach file">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                </Button>
                <input
                    value={draftMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus:ring-0"
                />
                <Button onClick={handleSendMessage} disabled={!canSend} size="icon" className="shrink-0 rounded-full">
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};
