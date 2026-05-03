import inertia from '@inertiajs/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        inertia({
            ssr: false,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '/images': '/public/images',
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
});
