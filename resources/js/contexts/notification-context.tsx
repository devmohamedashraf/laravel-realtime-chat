import { UserAvatar } from '@/components/messages/user-avatar';
import { useBrowserNotification } from '@/hooks/use-browser-notification';
import useBrowserTab from '@/hooks/use-browser-tab';
import { useAuthUser } from '@/stores/use-auth-store';
import type { MessageSent } from '@/types/messages';
import { BrowserNotificationOptions, NotificationPermission } from '@/types/notification';
import { useEcho } from '@laravel/echo-react';
import React, { createContext, ReactNode, useContext } from 'react';
import { toast } from 'sonner';
import useSound from 'use-sound';

interface NotificationContextType {
    permission: NotificationPermission;
    requestPermission: () => Promise<boolean>;
    showNotification: (title: string, options?: BrowserNotificationOptions) => Notification | null;
    isSupported: boolean;
    canShow: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const notification = useBrowserNotification();
    const isTabActive = useBrowserTab();
    const user = useAuthUser();

    const [playNotificationSound] = useSound('/sounds/whatsapp-short-ringtone.mp3', {
        volume: 0.5,
        interrupt: true,
    });

    useEcho(
        user ? `chat.${user.id}` : '',
        '.message.sent',
        (e: { message: MessageSent }) => {
            if (!user) return;
            const message: MessageSent = e.message;

            if (isTabActive) {
                showInAppNotification(message);
                return;
            }
            showBrowserNotification(message);
        },
        [isTabActive, user],
    );

    const showBrowserNotification = (message: MessageSent) => {
        playNotificationSound();
        notification.showNotification(message.sender.name, {
            body: `${message.content}`,
            data: { url: `/messages?user=${message.sender.id}` },
            tag: `message-${message.id}`,
            icon: message.sender.avatar_url ?? undefined,
        });
    };

    const showInAppNotification = (message: MessageSent) => {
        playNotificationSound();
        toast(message.sender.name, {
            description: message.content,
            icon: <UserAvatar name={message.sender.name} avatarUrl={message.sender.avatar_url} size="sm" />,
            classNames: {
                description: ' line-clamp-2',
                icon: '!size-9',
            },
        });
    };

    if (!user) {
        return <>{children}</>;
    }

    return <NotificationContext.Provider value={notification}>{children}</NotificationContext.Provider>;
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
