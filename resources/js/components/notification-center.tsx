import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import axios from '@/lib/axios';
import { useAuthUser } from '@/stores/use-auth-store';
import { useMessageActions } from '@/stores/use-message-store';
import {
    type AppNotification,
    useNotificationActions,
    useNotificationLoading,
    useNotifications,
    useUnreadNotificationCount,
} from '@/stores/use-notification-store';
import { router } from '@inertiajs/react';
import { useEchoNotification } from '@laravel/echo-react';
import { Bell, Check, CheckCheck, MessageSquareText, Settings, Trash2, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const NOTIFICATION_ICONS: Record<string, { icon: typeof Bell; className: string }> = {
    'message.received': {
        icon: MessageSquareText,
        className: 'text-sky-500 bg-transparent',
    },
    'user.joined': {
        icon: UserPlus,
        className: 'text-emerald-500 bg-transparent',
    },
};

const DEFAULT_ICON = {
    icon: Bell,
    className: 'text-violet-500 bg-transparent',
};

function formatRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function NotificationSkeleton() {
    return (
        <div className="flex gap-3 px-4 py-3">
            <Skeleton className="size-8 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-2.5 w-14" />
                </div>
                <Skeleton className="h-3 w-full" />
            </div>
        </div>
    );
}

function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
    onClick,
}: {
    notification: AppNotification;
    onMarkAsRead: (id: string | number) => void;
    onDelete: (id: string | number) => void;
    onClick: (notification: AppNotification) => void;
}) {
    const iconConfig = NOTIFICATION_ICONS[notification.type] ?? DEFAULT_ICON;
    const Icon = iconConfig.icon;
    const isUnread = !notification.read_at;

    return (
        <div
            className={`group relative flex cursor-pointer gap-3 border-b border-border/40 px-4 py-3 transition-colors last:border-0 hover:bg-muted/50 ${isUnread ? 'bg-primary/[0.03] dark:bg-primary/[0.04]' : 'bg-transparent'}`}
            onClick={() => onClick(notification)}
        >
            <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background shadow-sm ${iconConfig.className}`}
            >
                <Icon className="size-3.5" strokeWidth={2.5} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <p
                            className={`truncate text-sm leading-none ${isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/70'}`}
                        >
                            {notification.title}
                        </p>
                        {isUnread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <span className="shrink-0 text-[10px] whitespace-nowrap text-muted-foreground/60">
                        {formatRelativeTime(notification.created_at)}
                    </span>
                </div>
                {notification.body && <p className="line-clamp-2 pr-8 text-xs leading-relaxed text-muted-foreground">{notification.body}</p>}
            </div>

            {/* Hover actions */}
            <div className="absolute top-1/2 right-2 flex w-fit -translate-y-1/2 items-center gap-1 rounded-md border border-border/60 bg-background p-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                {isUnread && (
                    <Tooltip>
                        <TooltipTrigger
                            className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(notification.id);
                            }}
                        >
                            <Check className="size-3.5" />
                        </TooltipTrigger>
                        <TooltipContent>Mark as read</TooltipContent>
                    </Tooltip>
                )}
                <Tooltip>
                    <TooltipTrigger
                        className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                        }}
                    >
                        <Trash2 className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}

export function NotificationCenter() {
    const notifications = useNotifications();
    const unreadCount = useUnreadNotificationCount();
    const loading = useNotificationLoading();
    const { setNotifications, addNotification, markAsRead, markAllAsRead, removeNotification, setLoading } = useNotificationActions();
    const user = useAuthUser();
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await axios.get('/api/notifications');
            setNotifications(response.data.data ?? []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [setNotifications, setLoading]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Listen for real-time notifications via Echo broadcast channel
    useEchoNotification(user ? `App.Models.User.${user.id}` : '', (notification: Record<string, unknown>) => {
        addNotification({
            id: (notification.id as string) ?? crypto.randomUUID(),
            type: (notification.type as string) ?? 'message.received',
            title: (notification.title as string) ?? '',
            body: (notification.body as string) ?? null,
            data: notification,
            read_at: null,
            created_at: new Date().toISOString(),
        });
    });

    const handleMarkAsRead = useCallback(
        async (id: string | number) => {
            markAsRead(id);
            try {
                await axios.patch(`/api/notifications/${id}/read`);
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        },
        [markAsRead],
    );

    const handleMarkAllAsRead = useCallback(async () => {
        markAllAsRead();
        try {
            await axios.post('/api/notifications/read-all');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [markAllAsRead]);

    const handleDelete = useCallback(
        async (id: string | number) => {
            removeNotification(id);
            try {
                await axios.delete(`/api/notifications/${id}`);
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        },
        [removeNotification],
    );

    const [isOpen, setIsOpen] = useState(false);
    const { selectConversation } = useMessageActions();

    const handleNotificationClick = useCallback(
        (notification: AppNotification) => {
            if (!notification.read_at) {
                handleMarkAsRead(notification.id);
            }

            if (notification.type === 'message.received' && notification.data?.sender_id) {
                setIsOpen(false); // Close the dropdown
                selectConversation({
                    id: Number(notification.data.sender_id),
                    name: (notification.data.sender_name as string) || 'Unknown',
                    email: '',
                });
                router.visit('/messages');
            }
        },
        [handleMarkAsRead, selectConversation],
    );

    const displayedNotifications = activeTab === 'unread' ? notifications.filter((n) => !n.read_at) : notifications;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger
                className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                aria-label="Notifications"
            >
                <Bell className="size-[18px] transition-transform duration-200" strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex size-2 items-center justify-center rounded-full bg-destructive text-[0px] ring-2 ring-background"></span>
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-[380px] overflow-hidden border-border/60 p-0 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Tooltip>
                                <TooltipTrigger
                                    className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    onClick={handleMarkAllAsRead}
                                >
                                    <CheckCheck className="size-3.5" />
                                </TooltipTrigger>
                                <TooltipContent>Mark all as read</TooltipContent>
                            </Tooltip>
                        )}
                        <Tooltip>
                            <TooltipTrigger className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                                <Settings className="size-3.5" />
                            </TooltipTrigger>
                            <TooltipContent>Settings</TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Tabs */}
                <div className="pt-2 pb-0">
                    <div className="flex items-center gap-4 border-b px-4">
                        <button
                            type="button"
                            className={`-mb-px border-b-2 py-2 text-xs font-medium transition-colors ${
                                activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => setActiveTab('all')}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            className={`-mb-px border-b-2 py-2 text-xs font-medium transition-colors ${
                                activeTab === 'unread'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => setActiveTab('unread')}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-[400px] overflow-y-auto">
                    {loading && (
                        <>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <NotificationSkeleton key={i} />
                            ))}
                        </>
                    )}

                    {!loading && displayedNotifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted/60">
                                <Bell className="size-5 text-muted-foreground/40" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground/70">
                                {activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
                            </p>
                            <p className="text-xs text-muted-foreground/50">
                                {activeTab === 'unread' ? "You've read all your notifications" : "You'll see new messages here"}
                            </p>
                        </div>
                    )}

                    {!loading &&
                        displayedNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                                onDelete={handleDelete}
                                onClick={handleNotificationClick}
                            />
                        ))}
                </div>

                {/* Footer */}
                {!loading && notifications.length > 0 && (
                    <div className="border-t border-border/40 bg-muted/20 px-4 py-2.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-full text-xs text-muted-foreground hover:text-foreground"
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                        >
                            Mark all as read
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
