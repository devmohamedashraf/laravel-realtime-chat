import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/contexts/notification-context';
import { useHeartbeat } from '@/hooks/use-heartbeat';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    useHeartbeat();

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            <NotificationProvider>{children}</NotificationProvider>
            <Toaster />
        </AppLayoutTemplate>
    );
};
