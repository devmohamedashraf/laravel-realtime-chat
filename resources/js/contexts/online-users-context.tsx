import { useEchoPresence } from '@laravel/echo-react';
import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';

type PresenceUser = { id: number; name: string };

interface OnlineUsersContextType {
    onlineUserIds: Set<number>;
    isOnline: (userId: number) => boolean;
}

export const OnlineUsersContext = createContext<OnlineUsersContextType>({
    onlineUserIds: new Set(),
    isOnline: () => false,
});

export function OnlineUsersProvider({ children }: { children: ReactNode }) {
    const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());
    const { channel } = useEchoPresence<PresenceUser>('online');

    useEffect(() => {
        const ch = channel();

        ch.here((users: PresenceUser[]) => {
            console.log('[Presence] Here:', users);
            setOnlineUserIds(new Set(users.map((u) => u.id)));
        })
            .joining((user: PresenceUser) => {
                console.log('[Presence] Joining:', user);
                setOnlineUserIds((prev) => new Set([...prev, user.id]));
            })
            .leaving((user: PresenceUser) => {
                console.log('[Presence] Leaving:', user);
                setOnlineUserIds((prev) => {
                    const next = new Set(prev);
                    next.delete(user.id);
                    return next;
                });
            });

        return () => {
            // Echo will handle cleanup
        };
    }, [channel]);

    const isOnline = useCallback((userId: number) => onlineUserIds.has(userId), [onlineUserIds]);

    return <OnlineUsersContext.Provider value={{ onlineUserIds, isOnline }}>{children}</OnlineUsersContext.Provider>;
}
