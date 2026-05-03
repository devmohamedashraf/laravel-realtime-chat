import '../css/app.css';

import { createInertiaApp, router, type ResolvedComponent } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { useAuthStore } from './stores/use-auth-store';
import type { Auth } from './types';

configureEcho({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

type PagePropsWithAuth = {
    auth?: Auth | null;
};

const syncAuthState = (pageProps: PagePropsWithAuth | undefined): void => {
    useAuthStore.getState().actions.setAuth(pageProps?.auth ?? null);
};

const pages = import.meta.glob<ResolvedComponent>('./pages/**/*.tsx', { import: 'default' });

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, pages),
    setup({ el, App, props }) {
        syncAuthState(props.initialPage.props as PagePropsWithAuth);

        router.on('navigate', (event) => {
            syncAuthState(event.detail.page.props as PagePropsWithAuth);
        });

        if (el.childElementCount > 0) {
            hydrateRoot(el, <App {...props} />);

            return;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
