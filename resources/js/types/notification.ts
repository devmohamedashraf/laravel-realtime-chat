// types/notification.ts
export interface BrowserNotificationOptions {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: unknown;
    requireInteraction?: boolean;
    silent?: boolean;
    vibrate?: number[];
    timestamp?: number;
    image?: string;
    onClick?: (event: Event) => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    url?: string;
    forceShow?: boolean;
}

export interface NotificationPayload {
    title: string;
    body?: string;
    icon?: string;
    url?: string;
    tag?: string;
}

export interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
    notification?: NotificationPayload;
    browserNotification?: NotificationPayload;
}

export type NotificationPermission = 'default' | 'granted' | 'denied';
