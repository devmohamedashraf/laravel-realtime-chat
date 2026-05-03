import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader } from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { useAppearance } from '@/hooks/use-appearance';
import { useOnlineUsers } from '@/hooks/use-online-users';
import axios from '@/lib/axios';
import { cn } from '@/lib/utils';
import { messageService } from '@/services/message-service';
import { useAuthUser } from '@/stores/use-auth-store';
import { useConversations, useIsLoadingConversations, useMessageActions } from '@/stores/use-message-store';
import type { User } from '@/types/messages';
import { ArrowLeft, MessageSquarePlus, Moon, Search, Sun, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConversationItem } from './conversation-item';
import { EmptyState } from './empty-state';
import { LoadingSpinner } from './loading-spinner';
import { UserAvatar } from './user-avatar';

function ConversationSidebar() {
    const authUser = useAuthUser();
    const conversations = useConversations();
    const isLoading = useIsLoadingConversations();
    const [searchTerm, setSearchTerm] = useState('');
    const [showUnreadsOnly, setShowUnreadsOnly] = useState(false);
    const { appearance, updateAppearance } = useAppearance();
    const isDark =
        appearance === 'dark' ||
        (appearance === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // New Chat View State
    const [view, setView] = useState<'chats' | 'users'>('chats');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const { isOnline } = useOnlineUsers();

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    const { setIsLoadingConversations, setConversations, selectConversation } = useMessageActions();

    // Fetch conversations
    useEffect(() => {
        const loadConversations = async () => {
            setIsLoadingConversations(true);
            try {
                const data = await messageService.getConversations();
                setConversations(data);
            } catch (error) {
                console.error('Failed to load conversations:', error);
            } finally {
                setIsLoadingConversations(false);
            }
        };
        loadConversations();
    }, [setConversations, setIsLoadingConversations]);

    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            const response = await axios.get('/api/users');
            const data = response.data.data ?? response.data;
            setUsers(data.filter((u: User) => u.id !== authUser?.id));
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [authUser?.id]);

    // Fetch users when view changes to 'users'
    useEffect(() => {
        if (view === 'users' && users.length === 0) {
            fetchUsers();
        }
    }, [fetchUsers, users.length, view]);

    const getLatestMessageContent = useCallback((conversation: (typeof conversations)[number]) => {
        const latestFromMessages =
            conversation.messages.length > 0
                ? conversation.messages.reduce((latest, current) => (current.id > latest.id ? current : latest))
                : undefined;

        const latestMessage =
            !conversation.last_message || (latestFromMessages && latestFromMessages.id > conversation.last_message.id)
                ? latestFromMessages
                : conversation.last_message;

        return latestMessage?.content?.toLowerCase() ?? '';
    }, []);

    const filteredConversations = useMemo(() => {
        let result = conversations;

        if (showUnreadsOnly) {
            result = result.filter((c) => c.unread_count > 0);
        }

        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            result = result.filter(
                (c) =>
                    c.user.name.toLowerCase().includes(query) ||
                    c.user.email.toLowerCase().includes(query) ||
                    getLatestMessageContent(c).includes(query),
            );
        }

        return result;
    }, [conversations, searchTerm, showUnreadsOnly, getLatestMessageContent]);

    const filteredUsers = useMemo(
        () =>
            users.filter(
                (user) =>
                    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || user.email.toLowerCase().includes(userSearchTerm.toLowerCase()),
            ),
        [users, userSearchTerm],
    );

    const sortedUsers = useMemo(() => [...filteredUsers].sort((a, b) => Number(isOnline(b.id)) - Number(isOnline(a.id))), [filteredUsers, isOnline]);

    const handleStartChat = (user: User) => {
        selectConversation(user);
        setView('chats');
        setSearchTerm('');
    };

    return (
        <Sidebar collapsible="none" className="relative hidden h-svh w-md overflow-hidden border-r md:flex">
            {/* --- MAIN CHAT VIEW --- */}
            <div className="flex h-full w-full flex-col">
                <SidebarHeader className="gap-3.5 p-4 pb-2">
                    <div className="flex w-full items-center justify-between">
                        <div className="text-xl font-bold tracking-tight text-foreground">Chats</div>
                        <div className="flex items-center gap-1">
                            <Label className="mr-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
                                <span>Unreads</span>
                                <Switch
                                    checked={showUnreadsOnly}
                                    onCheckedChange={setShowUnreadsOnly}
                                    className="scale-75 data-[state=checked]:bg-primary"
                                />
                            </Label>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
                                onClick={toggleTheme}
                                aria-label="Toggle dark mode"
                            >
                                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setView('users')}
                                className="size-8 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
                                aria-label="New chat"
                            >
                                <MessageSquarePlus className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="relative mt-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 rounded-full border-transparent bg-muted/60 pr-8 pl-10 transition-colors focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring/50"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:bg-muted-foreground/10 hover:text-foreground"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="px-2">
                        <SidebarGroupContent className="flex flex-col gap-1">
                            {isLoading ? (
                                <LoadingSpinner />
                            ) : filteredConversations.length > 0 ? (
                                filteredConversations.map((conversation) => (
                                    <ConversationItem key={conversation.user.id} conversation={conversation} />
                                ))
                            ) : searchTerm || showUnreadsOnly ? (
                                <EmptyState
                                    title={showUnreadsOnly ? 'No unread conversations' : `No results for "${searchTerm}"`}
                                    description={showUnreadsOnly ? "You're all caught up" : 'Try a different search term'}
                                />
                            ) : (
                                <EmptyState title="No conversations yet" description="Click the new chat icon above to start chatting" />
                            )}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </div>

            {/* --- NEW CHAT / USERS VIEW --- */}
            <div
                className={cn(
                    'absolute inset-0 z-20 flex h-full w-full flex-col bg-sidebar transition-transform duration-300 ease-out',
                    view === 'users' ? 'translate-x-0' : 'pointer-events-none -translate-x-full',
                )}
            >
                <SidebarHeader className="gap-3.5 p-4 pb-2">
                    <div className="-ml-1 flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95"
                            onClick={() => setView('chats')}
                            aria-label="Back to chats"
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div className="text-base font-semibold tracking-tight text-foreground">New Chat</div>
                    </div>
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            placeholder="Search users..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="h-10 rounded-full border-transparent bg-muted/60 pr-8 pl-10 transition-colors focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring/50"
                        />
                        {userSearchTerm && (
                            <button
                                type="button"
                                onClick={() => setUserSearchTerm('')}
                                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:bg-muted-foreground/10 hover:text-foreground"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="px-2">
                        <SidebarGroupContent className="flex flex-col gap-1 py-2">
                            {isLoadingUsers ? (
                                <LoadingSpinner />
                            ) : sortedUsers.length > 0 ? (
                                sortedUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleStartChat(user)}
                                        className="w-full rounded-lg p-3 text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <UserAvatar name={user.name} avatarUrl={user.avatar_url} />
                                                {isOnline(user.id) && (
                                                    <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <span className="truncate font-semibold">{user.name}</span>
                                                <div className="mt-1 flex min-w-0 flex-1 items-center gap-1.5">
                                                    <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : userSearchTerm ? (
                                <EmptyState title={`No results for "${userSearchTerm}"`} description="Try a different name or email" />
                            ) : (
                                <EmptyState title="No users found" description="There are no other users available to chat with." />
                            )}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </div>
        </Sidebar>
    );
}

export default ConversationSidebar;
