import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Logo from '@/Components/site/Logo';
import NoticeBar from '@/Components/site/NoticeBar';
import SocialIcons from '@/Components/site/SocialIcons';
import { lines, useSite } from '@/lib/site';
import { setDateLocale } from '@/lib/date';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/lib/reveal';
import { useFlashAlerts } from '@/lib/alerts';
import type { SharedProps } from '@/types/cms';

type RouteName = 'home' | 'about' | 'staff' | 'student-life' | 'alumni' | 'academics' | 'results' | 'downloads' | 'admissions' | 'apply' | 'news' | 'articles' | 'events' | 'gallery' | 'contact';

/** The menu: a few top-level entries, three of them with dropdowns. Labels come from Site settings. */
const MENU: { route?: RouteName; group?: string; children?: RouteName[] }[] = [
    { route: 'home' },
    { group: 'nav_group_about', children: ['about', 'staff', 'student-life', 'alumni'] },
    { group: 'nav_group_academics', children: ['academics', 'results', 'downloads'] },
    { group: 'nav_group_admissions', children: ['admissions', 'apply'] },
    { group: 'nav_group_updates', children: ['news', 'articles', 'events', 'gallery'] },
    { route: 'contact' },
];
/** Which menu dropdown a school-created page joins (Admin → Pages → "Show in the menu under"). */
const PAGE_GROUPS: Record<string, string> = { About: 'nav_group_about', Academics: 'nav_group_academics', Admissions: 'nav_group_admissions', 'News & Events': 'nav_group_updates' };

type NavLink = { key: string; href: string; label: string; active: boolean };
type NavItem = { link?: NavLink; group?: string; children?: NavLink[] };

const tel = (n: string) => `tel:${n.replace(/[^\d+]/g, '')}`;

function LanguageSwitch({ className = '' }: { className?: string }) {
    const site = useSite();
    const { locale } = usePage<SharedProps & Record<string, unknown>>().props;
    return (
        <div className={cn('flex items-center gap-2', className)} role="group" aria-label="Language / Lugha">
            {(['en', 'sw'] as const).map((l, i) => (
                <span key={l} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden className="opacity-40">|</span>}
                    {locale === l ? (
                        <span aria-current="true" className="font-semibold text-white">{site[`lang_${l}`]}</span>
                    ) : (
                        <a href={route('language', l)} lang={l} hrefLang={l} className="hover:text-white">{site[`lang_${l}`]}</a>
                    )}
                </span>
            ))}
        </div>
    );
}

export default function SiteLayout({ title, children }: PropsWithChildren<{ title?: string; description?: string }>) {
    const site = useSite();
    const { url, props } = usePage<SharedProps & Record<string, unknown>>();
    const [open, setOpen] = useState(false);
    const [compact, setCompact] = useState(false);
    const [menu, setMenu] = useState<number | null>(null);
    const masthead = useRef<HTMLDivElement>(null);

    setDateLocale(props.locale);

    useEffect(() => {
        setOpen(false);
        setMenu(null);
    }, [url]);
    useScrollReveal(url);
    useFlashAlerts('dialog');

    // Once the masthead scrolls away, a small crest appears in the sticky navigation band.
    useEffect(() => {
        if (!masthead.current) return;
        const io = new IntersectionObserver(([e]) => setCompact(!e.isIntersecting));
        io.observe(masthead.current);
        return () => io.disconnect();
    }, []);

    // Close an open dropdown with Escape or a click elsewhere.
    useEffect(() => {
        if (menu === null) return;
        const close = (e: Event) => {
            if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
            if (e instanceof MouseEvent && (e.target as HTMLElement).closest('[data-menu]')) return;
            setMenu(null);
        };
        document.addEventListener('keydown', close);
        document.addEventListener('click', close);
        return () => {
            document.removeEventListener('keydown', close);
            document.removeEventListener('click', close);
        };
    }, [menu]);

    const label = (r: RouteName) => site[`nav_${r.replace('-', '_')}`] ?? r;
    // Pages can be hidden from the menu in Site settings → Menu & header.
    const visible = (r: RouteName) => site[`menu_show_${r.replace('-', '_')}`] !== 'Hide';
    const toLink = (r: RouteName): NavLink => ({ key: r, href: route(r), label: label(r), active: !!(route().current(r) || route().current(`${r}.*`)) });
    const nav: NavItem[] = MENU.map((item) => {
        if (item.route) return { link: toLink(item.route) };
        const own = (props.menuPages ?? [])
            .filter((p) => PAGE_GROUPS[p.menu_group] === item.group)
            .map((p) => ({ key: `page-${p.id}`, href: route('pages.show', p.slug), label: p.title, active: !!route().current('pages.show', { slug: p.slug }) }));
        return { group: item.group, children: [...item.children!.filter(visible).map(toLink), ...own] };
    }).filter((item) => item.link || item.children!.length);
    const footerLinks = nav.flatMap((item) => (item.link ? [item.link] : item.children!)).filter((l) => l.key !== 'home');
    const subline = [site.tagline, site.established].filter(Boolean).join('  ·  ');

    const navLink = 'relative px-4 py-4 text-[12.5px] font-semibold uppercase tracking-[0.16em] transition-colors';

    return (
        <div className="flex min-h-screen flex-col">
            <Head title={props.seo?.title ?? (title ? `${title} | ${site.site_name}` : site.site_name ?? '')}>
                {props.seo?.description && <meta head-key="description" name="description" content={props.seo.description} />}
            </Head>

            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2">
                {site.skip_link}
            </a>

            <NoticeBar notices={props.notices ?? []} />

            {/* Utility bar */}
            <div className="bg-navy-950 text-[13px] text-navy-200">
                <div className="container-site flex items-center justify-between gap-4 py-2">
                    <span className="hidden font-serif text-[15px] italic text-crest-300 lg:inline">{site.motto}</span>
                    <div className="flex flex-1 items-center justify-between divide-white/15 sm:justify-end sm:divide-x lg:flex-none">
                        {site.phone && <a href={tel(site.phone)} className="hidden px-4 hover:text-white lg:inline">{site.phone}</a>}
                        {site.email && <a href={`mailto:${site.email}`} className="hidden px-4 hover:text-white xl:inline">{site.email}</a>}
                        <SocialIcons className="-ml-1.5 sm:ml-0 sm:px-3" />
                        <LanguageSwitch className="sm:px-4" />
                        <Link href={route('login')} className="hidden pl-4 hover:text-white sm:inline">{site.staff_login}</Link>
                    </div>
                </div>
            </div>

            {/* Masthead */}
            <div ref={masthead} className="sticky top-0 z-40 border-b border-rule bg-white xl:static xl:border-0">
                <div className="container-site flex items-center justify-between gap-6 py-3 xl:py-5">
                    <Link href={route('home')} className="flex items-center gap-4">
                        <Logo className="h-14 xl:h-[4.75rem]" />
                        <span className="border-l border-rule pl-4 leading-tight">
                            <span className="block font-serif text-[1.35rem] font-semibold text-navy-900 sm:text-[1.6rem] xl:text-[2rem]">{site.site_name}</span>
                            {subline && <span className="mt-1 block text-[10.5px] font-semibold uppercase tracking-[0.24em] text-crest-700 sm:text-[11px]">{subline}</span>}
                        </span>
                    </Link>

                    <div className="hidden items-center gap-3 xl:flex">
                        <Link href={route('contact')} className="btn-outline !px-5 !py-2.5">{site.header_secondary}</Link>
                        <Link href={route('admissions')} className="btn-primary !px-5 !py-2.5">{site.header_primary}</Link>
                    </div>

                    <button
                        type="button"
                        className="flex items-center gap-2 border border-navy-900 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-900 xl:hidden"
                        aria-expanded={open}
                        aria-controls="mobile-nav"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? site.menu_close : site.menu_open}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
                        </svg>
                    </button>
                </div>

                {open && (
                    <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-rule bg-paper xl:hidden">
                        <div className="container-site py-3">
                            {nav.map((item, i) =>
                                item.link ? (
                                    <Link key={i} href={item.link.href} className={cn('block border-b border-rule py-3.5 font-serif text-xl', item.link.active ? 'font-semibold text-navy-900' : 'text-slate-700')}>
                                        {item.link.label}
                                    </Link>
                                ) : (
                                    <div key={i} className="border-b border-rule py-3">
                                        <p className="eyebrow mb-1">{site[item.group!]}</p>
                                        <div className="grid grid-cols-2">
                                            {item.children!.map((l) => (
                                                <Link key={l.key} href={l.href} className={cn('py-2 font-serif text-xl', l.active ? 'font-semibold text-navy-900' : 'text-slate-700')}>
                                                    {l.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            )}
                            <Link href={route('admissions')} className="btn-primary mt-5 w-full">{site.header_primary}</Link>
                        </div>
                    </nav>
                )}
            </div>

            {/* Navigation band */}
            <nav aria-label="Main" className="sticky top-0 z-40 hidden bg-navy-900 xl:block">
                <div className="container-site flex items-center justify-center">
                    <Link
                        href={route('home')}
                        aria-hidden={!compact}
                        tabIndex={compact ? 0 : -1}
                        className={cn('overflow-hidden transition-all duration-300', compact ? 'mr-4 w-8 opacity-100' : 'w-0 opacity-0')}
                    >
                        <Logo className="h-9" />
                    </Link>
                    {nav.map((item, i) => {
                        if (item.link) {
                            return (
                                <Link key={i} href={item.link.href} className={cn(navLink, item.link.active ? 'text-white' : 'text-navy-200 hover:text-white')}>
                                    {item.link.label}
                                    {item.link.active && <span className="absolute inset-x-4 bottom-0 h-[3px] bg-crest-300" />}
                                </Link>
                            );
                        }
                        const active = item.children!.some((l) => l.active);
                        const isOpen = menu === i;
                        return (
                            <div key={i} className="relative" data-menu onMouseEnter={() => setMenu(i)} onMouseLeave={() => setMenu(null)}>
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    aria-haspopup="true"
                                    onClick={() => setMenu(isOpen ? null : i)}
                                    className={cn(navLink, 'flex items-center gap-2', active || isOpen ? 'text-white' : 'text-navy-200 hover:text-white')}
                                >
                                    {site[item.group!]}
                                    <svg width="9" height="9" viewBox="0 0 10 10" className={cn('transition-transform', isOpen && 'rotate-180')} aria-hidden>
                                        <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                                    </svg>
                                    {active && <span className="absolute inset-x-4 bottom-0 h-[3px] bg-crest-300" />}
                                </button>
                                <div
                                    className={cn(
                                        'absolute left-1/2 top-full w-64 -translate-x-1/2 border-t-[3px] border-crest-300 bg-white py-2 shadow-[0_24px_48px_-20px_rgba(8,22,44,0.45)] transition-all duration-200',
                                        isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0',
                                    )}
                                >
                                    {item.children!.map((l) => (
                                        <Link
                                            key={l.key}
                                            href={l.href}
                                            className={cn('flex items-center justify-between px-5 py-3 font-serif text-lg transition-colors hover:bg-crest-50', l.active ? 'font-semibold text-navy-900' : 'text-slate-700')}
                                        >
                                            {l.label}
                                            {l.active && <span className="h-1.5 w-1.5 rotate-45 bg-brass" />}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </nav>

            <main id="main" className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="ground-navy text-navy-200">
                <div className="container-site pt-16 text-center" data-reveal>
                    <Logo className="mx-auto h-24" />
                    <p className="mt-5 font-serif text-3xl font-semibold text-white">{site.site_name}</p>
                    {site.motto && <p className="mt-2 font-serif text-xl italic text-crest-300">{site.motto}</p>}
                    <div className="double-rule mx-auto mt-10 max-w-site text-white/15" />
                </div>

                <div className="container-site grid gap-10 py-12 text-[15px] md:grid-cols-3" data-reveal-group data-reveal-step="140">
                    <div>
                        {site.footer_col_address && <h2 className="mb-4 !font-sans text-[11.5px] font-semibold uppercase tracking-[0.24em] !text-crest-300">{site.footer_col_address}</h2>}
                        <address className="space-y-1 not-italic">
                            {lines(site.address).map((l) => <div key={l}>{l}</div>)}
                            {site.po_box && <div>{site.po_box}</div>}
                        </address>
                        {site.footer_about && <p className="mt-4 leading-relaxed text-navy-300">{site.footer_about}</p>}
                    </div>

                    <div>
                        {site.footer_col_links && <h2 className="mb-4 !font-sans text-[11.5px] font-semibold uppercase tracking-[0.24em] !text-crest-300">{site.footer_col_links}</h2>}
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {footerLinks.map((l) => (
                                <li key={l.key}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        {site.footer_col_contact && <h2 className="mb-4 !font-sans text-[11.5px] font-semibold uppercase tracking-[0.24em] !text-crest-300">{site.footer_col_contact}</h2>}
                        <div className="space-y-1">
                            {site.phone && <div><a href={tel(site.phone)} className="hover:text-white">{site.phone}</a></div>}
                            {site.phone_alt && <div><a href={tel(site.phone_alt)} className="hover:text-white">{site.phone_alt}</a></div>}
                            {site.email && <div><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></div>}
                        </div>
                        {site.office_hours && <div className="mt-4 space-y-1 text-navy-300">{lines(site.office_hours).map((l) => <div key={l}>{l}</div>)}</div>}
                        <SocialIcons size="md" className="mt-5 flex-wrap gap-2" />
                    </div>
                </div>

                <div className="border-t border-white/10 bg-navy-950/60">
                    <div className="container-site flex flex-col gap-1 py-5 text-[13px] text-navy-300 sm:flex-row sm:justify-between">
                        <span>© {new Date().getFullYear()} {site.site_name}. {site.footer_rights}</span>
                        <span>{site.footer_credit}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
