import { BrowserNotificationOptions, NotificationPermission } from '@/types/notification';
import { useCallback, useEffect, useState } from 'react';

interface UseBrowserNotificationReturn {
    permission: NotificationPermission;
    requestPermission: () => Promise<boolean>;
    showNotification: (title: string, options?: BrowserNotificationOptions) => Notification | null;
    isSupported: boolean;
    canShow: boolean;
}

export const useBrowserNotification = (): UseBrowserNotificationReturn => {
    const [permission, setPermission] = useState<NotificationPermission>('Notification' in window ? Notification.permission : 'default');

    const isSupported = 'Notification' in window;

    useEffect(() => {
        if (isSupported) {
            setPermission(Notification.permission);
        }
    }, [isSupported]);

    const requestPermission = async (): Promise<boolean> => {
        if (!isSupported) {
            console.warn('This browser does not support notifications');
            return false;
        }

        try {
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);
            return permissionResult === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    };

    const showNotification = useCallback(
        (title: string, options: BrowserNotificationOptions = {}): Notification | null => {
            if (!isSupported) {
                console.warn('This browser does not support notifications');
                return null;
            }

            if (permission !== 'granted') {
                console.warn('Notification permission not granted');
                return null;
            }

            try {
                const { onClick, onClose, onError, url, ...notificationOptions } = options;
                const notification = new Notification(title, {
                    icon: '/logo.png',
                    badge: '/badge.png',
                    ...notificationOptions,
                    silent: true,
                });

                notification.onclick = (event: Event): void => {
                    event.preventDefault();
                    window.focus();
                    notification.close();

                    if (onClick) {
                        onClick(event);
                    }

                    if (url) {
                        window.location.href = url;
                    }
                };

                if (onClose) {
                    notification.onclose = onClose;
                }

                if (onError) {
                    notification.onerror = onError;
                }

                return notification;
            } catch (error) {
                console.error('Failed to show notification:', error);
                return null;
            }
        },
        [permission, isSupported],
    );

    return {
        permission,
        requestPermission,
        showNotification,
        isSupported,
        canShow: isSupported && permission === 'granted',
    };
};
