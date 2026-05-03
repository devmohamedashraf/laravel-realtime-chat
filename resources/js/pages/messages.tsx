import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { ErrorBoundary } from '@/components/error-boundary';
import { ChatView } from '@/components/messages/chat-view';
import ConversationSidebar from '@/components/messages/conversation-sidebar';
import { useBrowserNotification } from '@/hooks/use-browser-notification';
import { useEffect } from 'react';

export default function Messages() {
    const { permission, requestPermission } = useBrowserNotification();

    useEffect(() => {
        if (permission === 'default') {
            requestPermission();
        }
    }, [permission, requestPermission]);

    return (
        <AppShell variant="sidebar">
            <AppSidebar className="border-r!" />
            <ConversationSidebar />
            <AppContent variant="sidebar" className="h-svh overflow-hidden">
                <div className="flex h-full w-full">
                    <ErrorBoundary>
                        <ChatView />
                    </ErrorBoundary>
                </div>
            </AppContent>
        </AppShell>
    );
}
