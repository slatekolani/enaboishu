import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { notify } from './lib/alerts';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/queryClient';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Friendly pop-ups instead of raw error pages for expired pages, too many attempts and server hiccups.
router.on('invalid', (event) => {
    const status = event.detail.response.status;
    if (![419, 429, 500, 502, 503].includes(status)) return;
    event.preventDefault();
    const site = ((router as unknown as { page?: { props?: { site?: Record<string, string | null> } } }).page?.props?.site) ?? {};
    const text = status === 419 ? site.alert_expired : status === 429 ? site.alert_busy : site.alert_server;
    notify('error', site.alert_error_title ?? 'Something went wrong', text ?? 'Please try again.', site.alert_ok ?? 'OK').then(() => {
        if (status === 419) window.location.reload();
    });
});

createInertiaApp({
    // Public pages send their full search-engine title ("Page | School"); admin pages get the app name added.
    title: (title) => (!title || title === appName ? appName : title.includes(' | ') ? title : `${title} | ${appName}`),
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <QueryClientProvider client={queryClient}>
                <App {...props} />
                <Toaster richColors position="top-right" />
            </QueryClientProvider>,
        );
    },
    progress: {
        color: '#b8892b',
    },
});
