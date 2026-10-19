import { PropsWithChildren, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { useMedia, useSite } from '@/lib/site';
import RichText from '@/Components/site/RichText';

export { formatDate as fmtDate } from '@/lib/date';

/** Rule – lozenge – rule: a small typographic divider. */
export function Ornament({ className = 'text-brass', width = 'w-40' }: { className?: string; width?: string }) {
    return (
        <div aria-hidden className={`flex items-center gap-3 ${width} ${className}`}>
            <span className="h-px flex-1 bg-current opacity-60" />
            <svg width="9" height="9" viewBox="0 0 10 10" className="shrink-0"><path d="M5 0l5 5-5 5-5-5z" fill="currentColor" /></svg>
            <span className="h-px flex-1 bg-current opacity-60" />
        </div>
    );
}

export function SectionHeading({ eyebrow, title, children, align = 'left', light = false }: PropsWithChildren<{ eyebrow?: string | null; title: string; align?: 'left' | 'center'; light?: boolean }>) {
    const center = align === 'center';
    if (!title && !eyebrow) return null;
    return (
        <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} data-reveal>
            {eyebrow && <p className={`eyebrow mb-4 ${light ? '!text-crest-300' : ''}`}>{eyebrow}</p>}
            {title && <h2 className={`text-4xl leading-[1.08] sm:text-[3.1rem] ${light ? '!text-white' : ''}`}>{title}</h2>}
            <Ornament className={`mt-6 ${light ? 'text-crest-300' : 'text-brass'} ${center ? 'mx-auto' : ''}`} width="w-28" />
            {children && <p className={`mt-6 text-lg leading-relaxed ${light ? 'text-navy-100' : 'text-slate-600'}`}>{children}</p>}
        </div>
    );
}

/** Title block at the top of every inner page. */
export function PageBanner({ title, intro, crumb, page, image }: { title: string; intro?: string | null; crumb: string; page?: string; image?: string | null }) {
    const site = useSite();
    const media = useMedia();
    // The page's own banner photo (Site settings → its tab), else the shared one (General).
    const photo = media(image) ?? media(page ? site[`banner_${page}`] : null) ?? media(site.page_banner);

    return (
        <section className="ground-navy relative overflow-hidden text-white">
            {photo && (
                <>
                    <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-navy-950/75" />
                </>
            )}
            <div aria-hidden className="pointer-events-none absolute inset-3 border border-white/10 sm:inset-5" />
            <div className="container-site relative py-16 text-center sm:py-24" data-reveal-group data-reveal-step="120">
                <nav aria-label="Breadcrumb" className="mb-5 text-[11.5px] font-semibold uppercase tracking-[0.24em] text-navy-200">
                    <Link href={route('home')} className="hover:text-white">{site.nav_home}</Link>
                    <span className="mx-3 text-crest-300">/</span>
                    <span className="text-crest-300">{crumb}</span>
                </nav>
                <h1 className="text-5xl !text-white sm:text-[4.25rem] sm:leading-[1.05]">{title}</h1>
                <Ornament className="mx-auto mt-6 text-crest-300" width="w-32" />
                {intro && <p className="mx-auto mt-6 max-w-2xl font-serif text-xl italic leading-relaxed text-navy-100 sm:text-2xl">{intro}</p>}
            </div>
        </section>
    );
}

/** CMS text (formatted or plain) in the site's reading style. `lead` enlarges the opening paragraph. */
export function Prose({ text, className = '', lead = false }: { text?: string | null; className?: string; lead?: boolean }) {
    return <RichText html={text} className={`${lead ? 'rich-lead' : ''} ${className}`} />;
}

export function Photo({ src, alt = '', className = '', ratio = 'aspect-[4/3]', initials }: { src: string | null; alt?: string; className?: string; ratio?: string; initials?: string }) {
    if (!src) {
        // Without an uploaded photo show nothing, or a quiet initials plate for people.
        if (!initials) return null;
        const letters = initials.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
        return (
            <div aria-hidden className={`${ratio} flex items-center justify-center bg-crest-100 font-serif text-6xl font-semibold text-crest-400 ${className}`}>
                {letters}
            </div>
        );
    }
    return <img src={src} alt={alt} loading="lazy" className={`${ratio} w-full object-cover ${className}`} />;
}

export function ArrowLink({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
    return (
        <Link
            href={href}
            className={`group inline-flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.18em] ${light ? 'text-white hover:text-crest-300' : 'text-navy-900 hover:text-crest-700'}`}
        >
            {children}
            <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" strokeWidth="1.4" className="transition-transform group-hover:translate-x-1" aria-hidden>
                <path d="M0 5h20M16 1l4 4-4 4" />
            </svg>
        </Link>
    );
}

export function Empty({ children }: PropsWithChildren) {
    return <p className="border border-rule bg-paper px-6 py-12 text-center font-serif text-xl italic text-slate-500">{children}</p>;
}
