import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { messageService } from '@/services/message-service';
import { useAuthUser } from '@/stores/use-auth-store';
import { useMessageActions } from '@/stores/use-message-store';
import type { Message } from '@/types/messages';
import { CircleOff, Download, FileText, MoreHorizontal, Pen, Smile, Trash2 } from 'lucide-react';
import React from 'react';
import { EditedIndicator } from './edited-indicator';
import MessageReceiptIndicator from './message-receipt-indicator';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const user = useAuthUser();
    const isSender = message.sender_id === user?.id;
    const [isReactionsOpen, setIsReactionsOpen] = React.useState(false);

    const { setIsDeleteDialogOpen, setSelectedMessage, setIsEditDialogOpen, updateMessageReactions } = useMessageActions();

    const formatTime = (timestamp: string) => {
        return new Date(timestamp)
            .toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            })
            .toLowerCase();
    };

    const handleEdit = () => {
        setSelectedMessage(message);
        setIsEditDialogOpen(true);
    };

    const handleDelete = () => {
        setSelectedMessage(message);
        setIsDeleteDialogOpen(true);
    };

    const handleReaction = async (emoji: string, closePopover = false) => {
        try {
            // Find if there is an existing reaction by this user that is NOT the current emoji
            const existingReaction = message.reactions?.find((r) => r.user_ids.includes(user?.id ?? 0) && r.emoji !== emoji);

            // If there's a different reaction, remove it first (or the service might handle single reaction logic)
            // But usually we just toggle the new one. If the user wants only one reaction, we should
            // probably ensure we un-react the old one if it exists.

            if (existingReaction) {
                await messageService.toggleReaction(message.id, existingReaction.emoji);
            }

            const result = await messageService.toggleReaction(message.id, emoji);
            updateMessageReactions(message.id, result.reactions);

            if (closePopover) {
                setIsReactionsOpen(false);
            }
        } catch (err) {
            console.error('Failed to toggle reaction:', err);
        }
    };

    const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
    const myReactions = message.reactions?.flatMap((r) => (r.user_ids.includes(user?.id ?? 0) ? [r.emoji] : [])) ?? [];

    const isDeleted = !!message.deleted_at;

    return (
        <div className={cn('flex w-full', isSender ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'group relative flex max-w-[70%] items-start gap-1 sm:max-w-[65%]',
                    isSender ? 'flex-row justify-end' : 'flex-row justify-start',
                )}
            >
                {/* Actions container - positioned outside the bubble */}
                {!isDeleted && (
                    <div
                        className={cn(
                            'pointer-events-none absolute top-0 z-20 flex h-full items-center gap-1 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100',
                            isSender ? 'right-full mr-2 flex-row-reverse' : 'left-full ml-2 flex-row',
                        )}
                    >
                        {/* Reaction Trigger */}
                        <Popover open={isReactionsOpen} onOpenChange={setIsReactionsOpen}>
                            <PopoverTrigger
                                render={
                                    <button
                                        type="button"
                                        className={cn(
                                            'pointer-events-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground/80',
                                            'border border-border/40 bg-background/80 shadow-sm backdrop-blur-sm',
                                            'transition-all duration-200 ease-out hover:bg-background hover:text-foreground active:scale-95',
                                        )}
                                        aria-label="React to message"
                                    />
                                }
                            >
                                <Smile className="size-4" />
                            </PopoverTrigger>
                            <PopoverContent
                                align={isSender ? 'end' : 'start'}
                                side="top"
                                sideOffset={8}
                                className="w-auto min-w-0 rounded-full border border-border/50 bg-popover/95 p-1 shadow-2xl backdrop-blur-md duration-200 ease-out animate-in fade-in-0 zoom-in-95 supports-[backdrop-filter]:bg-popover/90"
                            >
                                <div className="flex gap-0.5 px-1">
                                    {quickEmojis.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => handleReaction(emoji, true)}
                                            className={cn(
                                                'flex h-9 w-9 items-center justify-center rounded-full text-xl',
                                                'transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-110 active:scale-90',
                                                myReactions.includes(emoji) && 'bg-accent text-accent-foreground',
                                            )}
                                            aria-label={`React with ${emoji}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* More Actions Trigger */}
                        {isSender && (
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <button
                                            type="button"
                                            className={cn(
                                                'pointer-events-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground/80',
                                                'border border-border/40 bg-background/80 shadow-sm backdrop-blur-sm',
                                                'transition-all duration-200 ease-out hover:bg-background hover:text-foreground active:scale-95',
                                            )}
                                            aria-label="More actions"
                                        />
                                    }
                                >
                                    <MoreHorizontal className="size-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align={isSender ? 'end' : 'start'} side="top" sideOffset={8} className="min-w-32">
                                    <DropdownMenuItem onClick={handleEdit} disabled={!isSender}>
                                        <Pen className="mr-2 size-3.5" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem variant="destructive" onClick={handleDelete} disabled={!isSender}>
                                        <Trash2 className="mr-2 size-3.5" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                )}

                {/* Bubble + reactions stack */}
                <div className={cn('flex min-w-0 flex-col', isSender ? 'items-end' : 'items-start')}>
                    {/* Message Bubble */}
                    <div
                        className={cn(
                            'relative rounded-2xl shadow-sm transition-shadow duration-200',
                            !isDeleted && '',
                            isSender
                                ? 'rounded-br-md bg-message-bubble-background text-message-bubble-foreground'
                                : 'rounded-bl-md bg-muted text-foreground',
                            isDeleted && 'opacity-80',
                        )}
                    >
                        {isDeleted ? (
                            <div className="box-border flex items-center gap-2 px-3.5 pt-2 pb-2.5 opacity-80 select-none">
                                <CircleOff className="size-4" />
                                <span className="text-[14px]">{isSender ? 'You deleted this message' : 'This message was deleted'}</span>
                                <div className="invisible ml-2 inline-flex h-0 items-center">
                                    <span className="text-[10px] whitespace-nowrap">{formatTime(message.created_at)}</span>
                                </div>
                                <div className="relative z-10 float-right -mt-5 mb-0 ml-1">
                                    <div className="inline-flex h-4 items-center gap-1.5 leading-none">
                                        <span className="text-[10px] font-medium text-muted-foreground/60">{formatTime(message.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Image attachment */}
                                {message.type === 'image' && message.attachment?.url && (
                                    <div className="relative overflow-hidden rounded-t-2xl">
                                        <img
                                            src={message.attachment.url}
                                            alt={message.attachment.name || 'Image'}
                                            className="max-h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="pointer-events-none absolute inset-0 rounded-t-2xl ring-1 ring-black/10 ring-inset dark:ring-white/10" />
                                    </div>
                                )}

                                {/* File attachment */}
                                {message.type === 'file' && message.attachment && (
                                    <a
                                        href={message.attachment.url}
                                        download={message.attachment.name}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/5"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{message.attachment.name}</p>
                                            <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                                                {(message.attachment.size / 1024).toFixed(0)} KB
                                            </p>
                                        </div>
                                        <Download className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/60" />
                                    </a>
                                )}

                                {/* Message Content Container */}
                                {(message.type === 'text' || message.content) && (
                                    <div className="box-border px-3.5 pt-2 pb-2.5 select-text">
                                        {/* Text Content Wrapper */}
                                        <div className="relative">
                                            {/* Message Text with inline invisible timestamp space */}
                                            <span className="text-[15px] leading-relaxed font-[450] wrap-break-word whitespace-pre-wrap text-foreground">
                                                <span>{message.content}</span>
                                                {/* Invisible timestamp for spacing */}
                                                <div className="invisible ml-2 inline-flex h-0 items-center">
                                                    <div className="px-1 text-[10px] text-message-bubble-meta-foreground">
                                                        <EditedIndicator editedAt={message.edited_at} />
                                                    </div>
                                                    <span className="text-[10px] whitespace-nowrap">{formatTime(message.created_at)}</span>
                                                    {isSender && <MessageReceiptIndicator message={message} />}
                                                </div>
                                            </span>
                                        </div>

                                        {/* Visible floating timestamp */}
                                        <div className="relative z-10 float-right -mt-5 mb-0 ml-1">
                                            <div className="inline-flex h-4 items-center gap-1.5 leading-none">
                                                <EditedIndicator editedAt={message.edited_at} />
                                                <span className={cn('text-[10px] font-medium text-message-bubble-meta-foreground/80')}>
                                                    {formatTime(message.created_at)}
                                                </span>
                                                {isSender && <MessageReceiptIndicator message={message} />}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Image-only timestamp overlay */}
                                {message.type === 'image' && !message.content && (
                                    <div className="absolute right-2 bottom-2">
                                        <div className="inline-flex h-5 items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 leading-none shadow-sm backdrop-blur-sm">
                                            <span className="text-[10px] font-medium text-white/90">{formatTime(message.created_at)}</span>
                                            {isSender && <MessageReceiptIndicator message={message} />}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Emoji reactions — polished pills, overlapping bubble bottom */}
                    {!isDeleted && (message.reactions?.length ?? 0) > 0 && (
                        <div className={cn('z-10 -mt-2 flex flex-wrap items-center gap-1', isSender ? 'mr-1.5 justify-end' : 'ml-1.5 justify-start')}>
                            {message.reactions!.map((reaction) => (
                                <button
                                    key={reaction.emoji}
                                    type="button"
                                    onClick={() => handleReaction(reaction.emoji)}
                                    className={cn(
                                        'inline-flex h-6 items-center justify-center gap-1.5 rounded-full border bg-background px-2 py-0 text-xs font-medium text-foreground shadow-sm transition-all duration-200 ease-out hover:scale-105 active:scale-95',
                                        myReactions.includes(reaction.emoji)
                                            ? 'border-border bg-accent text-accent-foreground'
                                            : 'border-border/40 hover:border-border hover:bg-muted/50',
                                    )}
                                    title={`${reaction.count} reaction${reaction.count > 1 ? 's' : ''}`}
                                >
                                    <span className="text-[13px] leading-none">{reaction.emoji}</span>
                                    {reaction.count > 1 && (
                                        <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">{reaction.count}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
