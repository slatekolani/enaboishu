import { PropsWithChildren, ReactNode, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { confirmAction, useFlashAlerts } from '@/lib/alerts';
import { cn } from '@/lib/utils';
import type { SharedProps } from '@/types/cms';

type Item = { label: string; href: () => string; match: string; adminOnly?: boolean; badge?: 'unreadMessages' | 'newEnquiries' };
const res = (label: string, key: string, adminOnly = true): Item => ({ label, href: () => route('admin.resource.index', key), match: key, adminOnly });

/** Editors see only the content they can manage; administrators see everything. */
const MENU: { heading?: string; items: Item[] }[] = [
    { items: [{ label: 'Dashboard', href: () => route('admin.dashboard'), match: 'admin.dashboard' }] },
    {
        heading: 'Website',
        items: [
            { label: 'Site settings & text', href: () => route('admin.settings'), match: 'admin.settings', adminOnly: true },
            { label: 'Pages', href: () => route('admin.pages'), match: 'admin.pages' },
            res('Notice board', 'notices', false),
            res('Hero slides', 'slides'),
            res('Key figures', 'stats'),
            res('Testimonials', 'testimonials'),
        ],
    },
    {
        heading: 'School',
        items: [
            res('Staff & teachers', 'staff'),
            res('Academic programmes', 'programs'),
            res('Academic results', 'results'),
            res('Facilities', 'facilities'),
            res('Core values', 'core_values'),
            res('Downloads', 'downloads', false),
        ],
    },
    {
        heading: 'Student life',
        items: [
            res('Clubs & sports', 'clubs', false),
            res('Student leaders', 'leaders', false),
            res('Alumni', 'alumni'),
        ],
    },
    {
        heading: 'Updates',
        items: [
            res('News', 'posts', false),
            res('Articles', 'articles', false),
            res('Events', 'events', false),
            res('Photo gallery', 'gallery', false),
        ],
    },
    {
        heading: 'Inbox',
        items: [
            { label: 'Admission enquiries', href: () => route('admin.enquiries'), match: 'admin.enquiries', adminOnly: true, badge: 'newEnquiries' },
            { label: 'Messages', href: () => route('admin.messages'), match: 'admin.messages', adminOnly: true, badge: 'unreadMessages' },
        ],
    },
    {
        heading: 'Administration',
        items: [
            { label: 'Email notifications', href: () => route('admin.notifications'), match: 'admin.notifications', adminOnly: true },
            res('Notification recipients', 'recipients'),
            { label: 'Users & roles', href: () => route('admin.users'), match: 'admin.users', adminOnly: true },
            { label: 'Change history', href: () => route('admin.history'), match: 'admin.history', adminOnly: true },
        ],
    },
];

export default function AdminLayout({ title, actions, wide, children }: PropsWithChildren<{ title: string; actions?: ReactNode; wide?: boolean }>) {
    const props = usePage<SharedProps & Record<string, unknown>>().props;
    const { auth, site, crest } = props;
    const initials = (auth.user?.name ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    useFlashAlerts('toast');
    const menu = MENU.map((g) => ({ ...g, items: g.items.filter((it) => auth.isAdmin || !it.adminOnly) })).filter((g) => g.items.length);
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    const current = (match: string) => {
        if (match === 'admin.pages') return route().current('admin.pages') || route().current('admin.pages.*') || url.startsWith('/admin/content/pages');
        return match.startsWith('admin.') ? route().current(match) : url.startsWith(`/admin/content/${match}`) || url.includes(`/admin/content/${match}`);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800">
            <Head title={title} />

            <aside className={cn('fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto bg-navy-900 text-navy-100 transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
                <Link href={route('admin.dashboard')} className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
                    {crest && <img src={crest} alt="" className="h-11 w-auto shrink-0" />}
                    <span className="min-w-0">
                        <span className="block font-serif text-[1.05rem] font-bold leading-tight text-white">{site.site_name}</span>
                        <span className="mt-1 block text-[10.5px] font-semibold uppercase tracking-[0.2em] text-crest-300">Content management</span>
                    </span>
                </Link>
                <nav className="px-3 py-4">
                    {menu.map((g, gi) => (
                        <div key={gi} className="mb-5">
                            {g.heading && <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-200/60">{g.heading}</div>}
                            {g.items.map((it) => (
                                <Link
                                    key={it.label}
                                    href={it.href()}
                                    onClick={() => setOpen(false)}
                                    className={cn('flex items-center justify-between border-l-2 py-[7px] pl-3 pr-2 text-[14px] transition-colors', current(it.match) ? 'border-brass bg-white/10 font-semibold text-white' : 'border-transparent hover:bg-white/5 hover:text-white')}
                                >
                                    {it.label}
                                    {it.badge && props[it.badge] > 0 && <span className="bg-crest-300 px-1.5 text-xs font-bold text-navy-950">{props[it.badge]}</span>}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>
            {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3">
                    <div className="flex items-center gap-3">
                        <button className="border border-slate-300 p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
                        </button>
                        <h1 className="font-sans text-lg font-semibold text-slate-900">{title}</h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <a href={route('home')} target="_blank" rel="noreferrer" className="font-medium text-navy-800 hover:underline">View website ↗</a>
                        <Link href={route('profile.edit')} className="hidden items-center gap-2.5 text-slate-700 hover:text-navy-900 sm:flex">
                            <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold tracking-wide text-white">{initials}</span>
                            <span className="leading-tight">
                                <span className="block font-medium">{auth.user?.name}</span>
                                <span className="block text-[10.5px] uppercase tracking-[0.16em] text-slate-400">{auth.isAdmin ? 'Administrator' : 'Editor'}</span>
                            </span>
                        </Link>
                        <button
                            type="button"
                            onClick={async () => (await confirmAction('Log out of the admin panel?', 'Log out')) && router.post(route('logout'))}
                            className="border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
                        >
                            Log out
                        </button>
                    </div>
                </header>

                <main className={cn('mx-auto px-5 py-8', wide ? 'max-w-7xl' : 'max-w-5xl')}>
                    {actions && <div className="mb-6 flex justify-end">{actions}</div>}
                    {children}
                </main>
            </div>
        </div>
    );
}
