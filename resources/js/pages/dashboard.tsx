import { UserAvatar } from '@/components/messages/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Inbox, MessageSquare, MessagesSquare, Send, Users } from 'lucide-react';

interface DashboardStats {
    totalMessages: number;
    sentCount: number;
    receivedCount: number;
    conversationCount: number;
    unreadCount: number;
    totalUsers: number;
}

interface RecentConversation {
    user: { id: number; name: string; email: string; avatar_url?: string | null };
    last_message: string;
    last_message_at: string;
    unread_count: number;
    is_sender: boolean;
}

interface MessagePerDay {
    date: string;
    count: number;
}

interface DashboardProps {
    stats: DashboardStats;
    recentConversations: RecentConversation[];
    messagesPerDay: MessagePerDay[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
    return (
        <Card className="overflow-hidden border-none bg-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription className="text-sm font-medium text-foreground/70">{label}</CardDescription>
                <Icon className={cn('size-4', color)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value.toLocaleString()}</div>
            </CardContent>
        </Card>
    );
}

function ActivityChart({ data }: { data: MessagePerDay[] }) {
    if (data.length === 0) return null;
    const maxCount = Math.max(...data.map((d) => d.count), 1);

    // Fill in missing days for the last 7 days
    const days: { date: string; count: number; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const found = data.find((item) => item.date === dateStr);
        days.push({
            date: dateStr,
            count: found?.count ?? 0,
            label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        });
    }

    return (
        <div className="flex h-32 items-end gap-2">
            {days.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="relative w-full">
                        <div
                            className="mx-auto w-full max-w-8 rounded-t-md bg-primary/80 transition-all dark:bg-primary/60"
                            style={{ height: `${Math.max((day.count / maxCount) * 100, 4)}px` }}
                        />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{day.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function Dashboard({ stats, recentConversations, messagesPerDay }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
                {/* Stats row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={MessageSquare} label="Total Messages" value={stats.totalMessages} color="text-sky-500" />
                    <StatCard icon={Send} label="Messages Sent" value={stats.sentCount} color="text-emerald-500" />
                    <StatCard icon={MessagesSquare} label="Conversations" value={stats.conversationCount} color="text-violet-500" />
                    <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="text-amber-500" />
                </div>

                {/* Bottom row */}
                <div className="grid gap-4 lg:grid-cols-5">
                    {/* Recent conversations */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-base">Recent Conversations</CardTitle>
                            <CardDescription>Your latest chat activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Inbox className="mb-2 size-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                                    <p className="text-xs text-muted-foreground/70">Start chatting from the Users page</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {recentConversations.map((conv) => (
                                        <Link
                                            key={conv.user.id}
                                            href={`/messages?recipient_id=${conv.user.id}`}
                                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/50"
                                        >
                                            <UserAvatar name={conv.user.name} avatarUrl={conv.user.avatar_url} size="sm" className="shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-sm font-medium">{conv.user.name}</span>
                                                    {conv.unread_count > 0 && (
                                                        <Badge
                                                            variant="default"
                                                            className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]"
                                                        >
                                                            {conv.unread_count}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                    {conv.is_sender && <span className="text-muted-foreground/70">You: </span>}
                                                    {conv.last_message}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <span className="text-[11px] text-muted-foreground/70">
                                                    {formatRelativeTime(conv.last_message_at)}
                                                </span>
                                                <ArrowUpRight className="size-3.5 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/50" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity + unread */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        {/* Unread card */}
                        <Card className="border-none bg-accent/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription className="text-sm font-medium text-foreground/70">Unread Messages</CardDescription>
                                <Inbox className="size-4 text-rose-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tracking-tight">{stats.unreadCount}</div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {stats.unreadCount === 0 ? "You're all caught up" : 'Waiting for your reply'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Activity chart */}
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle className="text-base">7-Day Activity</CardTitle>
                                <CardDescription>Messages exchanged per day</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ActivityChart data={messagesPerDay} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
