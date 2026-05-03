import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { MessageCircle, Shield, Smartphone, Zap } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome to Reverb Chat" />
            <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
                <header className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <MessageCircle className="size-5" />
                        </div>
                        <span className="font-semibold tracking-tight">Reverb Chat</span>
                    </div>
                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Button asChild variant="default">
                                <Link href="/dashboard">Go to Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost">
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild variant="default">
                                    <Link href="/register">Register</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </header>

                <main className="flex-1">
                    <section className="container mx-auto flex flex-col items-center justify-center gap-6 px-4 py-24 text-center md:px-6 md:py-32">
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">
                            <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                            Powered by Laravel Reverb
                        </div>
                        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Real-time messaging, <br className="hidden sm:block" />
                            <span className="text-primary">beautifully crafted.</span>
                        </h1>
                        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                            A seamless, WhatsApp-inspired chat experience built with Laravel 12, Inertia.js, React, and Tailwind CSS.
                        </p>
                        <div className="mt-4 flex gap-4">
                            {auth.user ? (
                                <Button asChild size="lg" className="h-12 px-8">
                                    <Link href="/dashboard">Open App</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild size="lg" className="h-12 px-8">
                                        <Link href="/register">Get Started</Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="h-12 px-8">
                                        <a href="https://github.com/mohamedwhb/laravel-reverb-chat" target="_blank" rel="noreferrer">
                                            View Source
                                        </a>
                                    </Button>
                                </>
                            )}
                        </div>
                    </section>

                    <section className="container mx-auto px-4 py-16 md:px-6">
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="flex flex-col gap-2 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold">Lightning Fast</h3>
                                <p className="text-muted-foreground">
                                    Instant message delivery and real-time typing indicators powered by Laravel Reverb WebSockets.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Smartphone className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold">Responsive Design</h3>
                                <p className="text-muted-foreground">
                                    A fluid, app-like experience that looks and feels great on both desktop and mobile devices.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold">Secure by Default</h3>
                                <p className="text-muted-foreground">
                                    Built on Laravel's robust authentication and authorization features to keep conversations private.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t py-6 md:py-0">
                    <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row md:px-6">
                        <p className="text-center text-sm text-muted-foreground md:text-left">
                            Built with Laravel Reverb, Inertia, React, and Tailwind CSS.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <a href="https://github.com/mohamedwhb/laravel-reverb-chat" target="_blank" rel="noreferrer" className="hover:underline">
                                GitHub
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
