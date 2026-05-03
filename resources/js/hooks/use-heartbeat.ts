import axios from '@/lib/axios';
import { useEffect, useRef } from 'react';

export function useHeartbeat(intervalMs = 2 * 60 * 1000) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const sendHeartbeat = () => {
            axios.post('/api/heartbeat');
        };

        // Send immediately on mount
        sendHeartbeat();

        // Then send periodically
        intervalRef.current = setInterval(sendHeartbeat, intervalMs);

        // Update last_seen_at on tab close/navigation
        const handleBeforeUnload = () => {
            // Use sendBeacon for reliable delivery during page unload
            navigator.sendBeacon('/api/heartbeat');
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [intervalMs]);
}
