import { useEffect, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Empty, PageBanner } from '@/Components/site/Parts';
import { useMedia, useSite } from '@/lib/site';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/types/cms';

export default function Gallery({ items }: { items: GalleryItem[] }) {
    const site = useSite();
    const media = useMedia();
    const ALL = '__all';
    const categories = [ALL, ...Array.from(new Set(items.map((i) => i.category)))];
    const [category, setCategory] = useState(ALL);
    const [open, setOpen] = useState<number | null>(null);
    const shown = items.filter((i) => category === ALL || i.category === category);

    useEffect(() => {
        if (open === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(null);
            if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % shown.length));
            if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + shown.length) % shown.length));
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, shown.length]);

    const current = open !== null ? shown[open] : null;

    return (
        <SiteLayout title={site.gallery_title ?? ''}>
            <PageBanner title={site.gallery_title ?? ''} crumb={site.nav_gallery ?? ''} intro={site.gallery_intro} page="gallery" />
            <div className="py-16 sm:py-20">
                <div className="container-site">
                    {items.length === 0 && <Empty>{site.gallery_empty}</Empty>}

                    {categories.length > 2 && (
                        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter photos">
                            {categories.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    aria-pressed={c === category}
                                    className={cn('border px-4 py-2 text-sm font-medium', c === category ? 'border-navy-800 bg-navy-800 text-white' : 'border-rule text-slate-600 hover:border-navy-800')}
                                >
                                    {c === ALL ? site.gallery_all : c}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3" data-reveal-group="zoom" data-reveal-step="70">
                        {shown.map((g, i) => (
                            <button key={g.id} onClick={() => setOpen(i)} className="group relative mb-4 block w-full overflow-hidden bg-paper">
                                <img src={media(g.image) ?? ''} alt={g.caption ?? ''} loading="lazy" className="w-full transition-transform duration-500 group-hover:scale-[1.03]" />
                                {g.caption && (
                                    <span className="absolute inset-x-0 bottom-0 bg-navy-950/80 px-4 py-2.5 text-left text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                                        {g.caption}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {current && (
                <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 p-4" onClick={() => setOpen(null)}>
                    <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                        <img src={media(current.image) ?? ''} alt={current.caption ?? ''} className="max-h-[80vh] w-auto object-contain" />
                        {current.caption && <figcaption className="mt-3 text-center text-white">{current.caption}</figcaption>}
                    </figure>
                    <button aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 border border-white/50 p-2.5 text-white hover:bg-white hover:text-navy-900">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l14 14M19 5L5 19" /></svg>
                    </button>
                    {shown.length > 1 && ['Previous', 'Next'].map((l, k) => (
                        <button
                            key={l}
                            aria-label={l}
                            onClick={(e) => { e.stopPropagation(); setOpen((open! + (k ? 1 : -1) + shown.length) % shown.length); }}
                            className={cn('absolute top-1/2 -translate-y-1/2 border border-white/50 p-3 text-white hover:bg-white hover:text-navy-900', k ? 'right-4' : 'left-4')}
                        >
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={k ? 'M6 3l5 5-5 5' : 'M10 3L5 8l5 5'} /></svg>
                        </button>
                    ))}
                </div>
            )}
        </SiteLayout>
    );
}
