import axios from '@/lib/axios';
import { useCallback, useEffect, useState } from 'react';

type OnlineUser = {
    id: number;
    last_seen_at: string | null;
};

export function useOnlineUsers() {
    const [userStatuses, setUserStatuses] = useState<Map<number, string | null>>(new Map());

    const fetchStatuses = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/users');
            const map = new Map<number, string | null>();
            data.data.forEach((user: OnlineUser) => {
                map.set(user.id, user.last_seen_at);
            });
            setUserStatuses(map);
        } catch (error) {
            console.error('Failed to fetch user statuses:', error);
        }
    }, []);

    useEffect(() => {
        fetchStatuses();
        const interval = setInterval(fetchStatuses, 30000);
        return () => clearInterval(interval);
    }, [fetchStatuses]);

    const getLastSeenAt = useCallback(
        (userId: number) => {
            return userStatuses.get(userId);
        },
        [userStatuses],
    );

    const isOnline = useCallback(
        (userId: number) => {
            const lastSeenAt = userStatuses.get(userId);
            if (!lastSeenAt) return false;

            const diffMs = new Date().getTime() - new Date(lastSeenAt).getTime();
            const diffMins = Math.floor(diffMs / 60000);
            return diffMins < 2;
        },
        [userStatuses],
    );

    const onlineUserIds = new Set(
        Array.from(userStatuses.entries())
            .filter(([, lastSeenAt]) => {
                if (!lastSeenAt) return false;
                const diffMins = Math.floor((new Date().getTime() - new Date(lastSeenAt).getTime()) / 60000);
                return diffMins < 2;
            })
            .map(([id]) => id),
    );

    return { onlineUserIds, isOnline, getLastSeenAt };
}
