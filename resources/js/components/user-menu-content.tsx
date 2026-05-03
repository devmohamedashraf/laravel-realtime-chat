import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, LucideIcon, Monitor, Moon, Palette, Settings, Sun } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { appearance, updateAppearance } = useAppearance();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    const handleAppearanceChange = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, value: Appearance) => {
        e.preventDefault();
        e.stopPropagation();
        updateAppearance(value);
    };

    return (
        <>
            <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <UserInfo user={user} showEmail={true} />
                    </div>
                </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                        <Palette className="size-4 text-muted-foreground" />
                        Appearance settings
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="flex flex-col gap-1">
                            {tabs.map(({ value, icon: Icon, label }) => (
                                <DropdownMenuItem
                                    key={value}
                                    onClick={(e) => handleAppearanceChange(e, value)}
                                    data-test={`appearance-${value}-button`}
                                    className={cn(appearance === value && 'bg-accent')}
                                >
                                    <Icon className="size-4 text-muted-foreground" />
                                    {label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem render={<Link className="block w-full" href="/settings/profile" as="button" prefetch onClick={cleanup} />}>
                    <Settings />
                    Settings
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem
                    render={
                        <Link className="block w-full" href="/logout" method="post" as="button" onClick={handleLogout} data-test="logout-button" />
                    }
                >
                    <LogOut />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </>
    );
}
