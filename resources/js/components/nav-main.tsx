import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-3 py-0">
            <SidebarMenu className="gap-1">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            render={<Link href={item.href} prefetch />}
                            isActive={page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)}
                            tooltip={{ children: item.title }}
                            className="h-10 px-3 transition-all hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium"
                        >
                            {item.icon && <item.icon className="size-4.5" />}
                            <span className="text-sm">{item.title}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
