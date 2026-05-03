import { UserAvatar } from '@/components/messages/user-avatar';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useOnlineUsers } from '@/hooks/use-online-users';
import AppLayout from '@/layouts/app-layout';
import axios from '@/lib/axios';
import { useMessageActions } from '@/stores/use-message-store';
import { Auth, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { MessageCircle, Search, Users as UsersIcon, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    avatar_url?: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

function UserCardSkeleton() {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/60 px-4 py-3.5 dark:border-border/20">
            <Skeleton className="size-11 rounded-full" />
            <div className="flex-1 space-y-2.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
    );
}

export default function Users({ auth }: { auth: Auth }) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { setSelectedUser } = useMessageActions();
    const { isOnline } = useOnlineUsers();

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get('/api/users', {
                headers: {},
            });
            const data = response.data.data ?? response.data;
            setUsers(data.filter((user: User) => user.id !== auth.user.id));
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [auth.user.id]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(
        () =>
            users.filter(
                (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        [users, searchTerm],
    );

    const sortedUsers = useMemo(() => [...filteredUsers].sort((a, b) => Number(isOnline(b.id)) - Number(isOnline(a.id))), [filteredUsers, isOnline]);

    const onlineCount = useMemo(() => users.filter((u) => isOnline(u.id)).length, [users, isOnline]);

    const onStartChat = (user: User) => {
        setSelectedUser(user);
        router.visit(`/messages?recipient_id=${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">Users</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {!loading && users.length > 0 ? (
                                    <>
                                        {users.length} {users.length === 1 ? 'user' : 'users'}
                                        {onlineCount > 0 && (
                                            <span className="ml-1.5 inline-flex items-center gap-1">
                                                · <span className="inline-block size-1.5 animate-pulse rounded-full bg-emerald-500" /> {onlineCount}{' '}
                                                online
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    'Find someone and start a conversation.'
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            placeholder="Search by name or email…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 rounded-lg border-border/60 bg-card/80 pr-9 pl-9 shadow-xs transition-shadow focus:shadow-md dark:border-border/30 dark:bg-card/40"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground/60 transition-colors hover:text-foreground"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Result count when filtering */}
                    {searchTerm && sortedUsers.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {sortedUsers.length} {sortedUsers.length === 1 ? 'result' : 'results'}
                        </p>
                    )}

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="space-y-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <UserCardSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {/* Empty: no search results */}
                    {!loading && sortedUsers.length === 0 && users.length > 0 && searchTerm && (
                        <Empty className="py-16">
                            <EmptyHeader>
                                <EmptyMedia>
                                    <Search className="size-10 text-muted-foreground/30" />
                                </EmptyMedia>
                                <EmptyTitle>No results for "{searchTerm}"</EmptyTitle>
                                <EmptyDescription>Try a different name or email address.</EmptyDescription>
                            </EmptyHeader>
                            <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                                Clear search
                            </Button>
                        </Empty>
                    )}

                    {/* Empty: no users at all */}
                    {!loading && users.length === 0 && (
                        <Empty className="py-16">
                            <EmptyHeader>
                                <EmptyMedia>
                                    <UsersIcon className="size-10 text-muted-foreground/30" />
                                </EmptyMedia>
                                <EmptyTitle>No users yet</EmptyTitle>
                                <EmptyDescription>There are no other users to chat with right now.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}

                    {/* User list */}
                    {!loading && sortedUsers.length > 0 && (
                        <div className="divide-y divide-border/50 overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs dark:divide-border/20 dark:border-border/20 dark:bg-card/60">
                            {sortedUsers.map((user) => (
                                <div
                                    key={user.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onStartChat(user)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            onStartChat(user);
                                        }
                                    }}
                                    className="group flex cursor-pointer items-center gap-4 px-4 py-3.5 transition-colors hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none active:bg-accent/60"
                                >
                                    <div className="relative">
                                        <UserAvatar name={user.name} avatarUrl={user.avatar_url} />
                                        {isOnline(user.id) && (
                                            <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-medium">{user.name}</p>
                                            {isOnline(user.id) && (
                                                <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                    Online
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
                                    </div>

                                    <MessageCircle className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
