import { useEffect, useState } from 'react';
import { useMedia } from '@/lib/site';
import { cn } from '@/lib/utils';

/** A grid of photos that open in a full-screen viewer (keyboard: ← → Esc). */
export default function PhotoGrid({ photos, title }: { photos: string[]; title?: string | null }) {
    const media = useMedia();
    const [open, setOpen] = useState<number | null>(null);
    const n = photos.length;

    useEffect(() => {
        if (open === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(null);
            if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % n));
            if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + n) % n));
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, n]);

    if (n === 0) return null;

    return (
        <section className="mt-16">
            {title && (
                <h2 className="mb-6 flex items-center gap-5 text-[2rem]">
                    {title}
                    <span className="h-px flex-1 bg-rule" />
                    <span className="font-sans text-[11.5px] font-semibold uppercase tracking-[0.2em] text-slate-500">{n}</span>
                </h2>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-reveal-group="zoom" data-reveal-step="80">
                {photos.map((p, i) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => setOpen(i)}
                        aria-label={`Open photo ${i + 1} of ${n}`}
                        className={cn('group overflow-hidden bg-crest-100', i === 0 && n > 2 ? 'col-span-2 row-span-2' : '')}
                    >
                        <img src={media(p) ?? ''} alt="" loading="lazy" className="aspect-square h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    </button>
                ))}
            </div>

            {open !== null && (
                <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 p-4" onClick={() => setOpen(null)}>
                    <img src={media(photos[open]) ?? ''} alt="" className="max-h-[85vh] max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
                    <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-serif text-lg text-white">{open + 1} / {n}</p>
                    <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 border border-white/50 p-2.5 text-white hover:bg-white hover:text-navy-900">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l14 14M19 5L5 19" /></svg>
                    </button>
                    {n > 1 && (['Previous', 'Next'] as const).map((l, k) => (
                        <button
                            key={l}
                            type="button"
                            aria-label={`${l} photo`}
                            onClick={(e) => { e.stopPropagation(); setOpen((open + (k ? 1 : -1) + n) % n); }}
                            className={cn('absolute top-1/2 -translate-y-1/2 border border-white/50 p-3 text-white hover:bg-white hover:text-navy-900', k ? 'right-4' : 'left-4')}
                        >
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={k ? 'M6 3l5 5-5 5' : 'M10 3L5 8l5 5'} /></svg>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}
