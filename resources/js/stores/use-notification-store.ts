import { create } from 'zustand';

export interface AppNotification {
    id: string | number;
    type: string;
    title: string;
    body: string | null;
    data: Record<string, unknown> | null;
    read_at: string | null;
    created_at: string;
}

interface NotificationState {
    notifications: AppNotification[];
    loading: boolean;
    actions: NotificationActions;
}

type NotificationActions = {
    setNotifications: (notifications: AppNotification[]) => void;
    addNotification: (notification: AppNotification) => void;
    markAsRead: (id: string | number) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string | number) => void;
    setLoading: (loading: boolean) => void;
};

const markNotificationAsRead = (notification: AppNotification, readAt: string): AppNotification => ({
    ...notification,
    read_at: notification.read_at ?? readAt,
});

const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    loading: true,
    actions: {
        setNotifications: (notifications) => set({ notifications }),

        addNotification: (notification) =>
            set((state) => ({
                notifications: [notification, ...state.notifications],
            })),

        markAsRead: (id) =>
            set((state) => ({
                notifications: state.notifications.map((notification) =>
                    notification.id === id ? markNotificationAsRead(notification, new Date().toISOString()) : notification,
                ),
            })),

        markAllAsRead: () => {
            const readAt = new Date().toISOString();

            set((state) => ({
                notifications: state.notifications.map((n) => markNotificationAsRead(n, readAt)),
            }));
        },

        removeNotification: (id) =>
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            })),

        setLoading: (loading) => set({ loading }),
    },
}));

export const useNotifications = () => useNotificationStore((state) => state.notifications);

export const useUnreadNotificationCount = () => useNotificationStore((state) => state.notifications.filter((n) => !n.read_at).length);

export const useNotificationLoading = () => useNotificationStore((state) => state.loading);

export const useNotificationActions = () => useNotificationStore((state) => state.actions);
