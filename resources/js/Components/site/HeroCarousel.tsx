import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import Logo from '@/Components/site/Logo';
import Seal from '@/Components/site/Seal';
import { useMedia, useSite } from '@/lib/site';
import type { Slide } from '@/types/cms';
import { cn } from '@/lib/utils';

const INTERVAL = 8000;
const pad = (n: number) => String(n).padStart(2, '0');

function Action({ url, label, primary }: { url: string; label: string; primary?: boolean }) {
    const cls = primary ? 'btn-ivory' : 'btn-outline-light';
    return /^https?:/i.test(url) ? <a href={url} className={cls}>{label}</a> : <Link href={url} className={cls}>{label}</Link>;
}

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
    const site = useSite();
    const media = useMedia();
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [reduced, setReduced] = useState(false);
    const touchX = useRef<number | null>(null);
    const count = slides.length;

    useEffect(() => setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);

    const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

    if (count === 0) return null;

    const slide = slides[index];
    const fullWidth = slide.layout === 'Full-width photo' && !!slide.image;
    const autoplay = count > 1 && !reduced;
    const sealText = `${(site.site_name ?? '').toUpperCase()} · ${(site.motto ?? '').toUpperCase()} · `;

    return (
        <section
            aria-roledescription="carousel"
            aria-label="Featured"
            className="ground-navy relative isolate overflow-hidden text-white"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') go(index - 1);
                if (e.key === 'ArrowRight') go(index + 1);
            }}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
                touchX.current = null;
            }}
        >
            {/* Full-width photos sit behind everything and cross-fade */}
            {slides.map((s, i) =>
                s.layout === 'Full-width photo' && s.image ? (
                    <div key={s.id} aria-hidden className={cn('absolute inset-0 -z-10 transition-opacity duration-[1400ms]', i === index ? 'opacity-100' : 'opacity-0')}>
                        <img
                            src={media(s.image) ?? ''}
                            alt=""
                            className={cn('h-full w-full object-cover transition-transform ease-out', i === index ? 'scale-100 duration-[10000ms]' : 'scale-110 duration-0')}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                    </div>
                ) : null,
            )}

            <div className="container-site">
                <div className="grid min-h-[38rem] items-center gap-10 pb-12 pt-12 lg:min-h-[44rem] lg:grid-cols-12 lg:gap-10 lg:pb-16 lg:pt-16">
                    {/* Words */}
                    <div key={slide.id} className={cn('order-2 lg:order-1', fullWidth ? 'lg:col-span-8' : 'lg:col-span-6')} aria-live="polite">
                        {slide.eyebrow && (
                            <p className="rise mb-6 flex items-center gap-4 text-[11.5px] font-semibold uppercase tracking-[0.28em] text-crest-300">
                                <span className="h-px w-12 bg-crest-300" />
                                {slide.eyebrow}
                            </p>
                        )}
                        <h2 className="rise text-[2.9rem] font-semibold leading-[1] !text-white [animation-delay:120ms] sm:text-6xl lg:text-[5.4rem]">{slide.title}</h2>
                        {slide.subtitle && (
                            <p className="rise mt-7 max-w-xl text-lg leading-relaxed text-navy-100 [animation-delay:240ms] sm:text-xl">{slide.subtitle}</p>
                        )}
                        {(slide.button_label || slide.button2_label) && (
                            <div className="rise mt-10 flex flex-wrap gap-3 [animation-delay:360ms]">
                                {slide.button_label && slide.button_url && <Action url={slide.button_url} label={slide.button_label} primary />}
                                {slide.button2_label && slide.button2_url && <Action url={slide.button2_url} label={slide.button2_label} />}
                            </div>
                        )}
                    </div>

                    {/* Arched window */}
                    {!fullWidth && (
                        <div className="order-1 lg:order-2 lg:col-span-6">
                            <div className="relative mx-auto w-full max-w-[13.5rem] sm:max-w-[23rem] lg:ml-auto lg:mr-6 lg:max-w-[27rem]">
                                <div aria-hidden className="absolute -inset-3 rounded-t-full border border-crest-300/35 sm:-inset-4" />
                                <div aria-hidden className="absolute -inset-7 rounded-t-full border border-crest-300/15 sm:-inset-8" />
                                <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-crest-100">
                                    {slides.map((s, i) => {
                                        const img = s.layout !== 'Full-width photo' ? media(s.image) : null;
                                        return (
                                            <div key={s.id} aria-hidden={i !== index} className={cn('absolute inset-0 transition-opacity duration-[1200ms]', i === index ? 'opacity-100' : 'opacity-0')}>
                                                {img ? (
                                                    <img
                                                        src={img}
                                                        alt={s.image_caption ?? ''}
                                                        className={cn('h-full w-full object-cover transition-transform ease-out', i === index ? 'scale-100 duration-[10000ms]' : 'scale-110 duration-0')}
                                                    />
                                                ) : (
                                                    <div className="bg-school flex h-full w-full items-center justify-center">
                                                        <Logo className="h-[30%] drop-shadow-md" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {slide.image_caption && slide.image && (
                                        <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 to-transparent pb-5 pl-6 pr-6 pt-12 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white sm:pl-28 sm:text-right lg:pl-20">
                                            {slide.image_caption}
                                        </p>
                                    )}
                                </div>
                                <div className="absolute -bottom-8 -left-6 hidden sm:block lg:-left-14">
                                    <Seal text={sealText} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Slide index */}
            {count > 1 && (
                <div className="relative border-t border-white/15 bg-navy-950/40 backdrop-blur-sm">
                    <div className="container-site">
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }} role="tablist" aria-label="Choose slide">
                            {slides.map((s, i) => (
                                <button
                                    key={s.id}
                                    role="tab"
                                    aria-selected={i === index}
                                    onClick={() => go(i)}
                                    className={cn('group relative py-5 pr-6 text-left transition-colors', i === index ? 'text-white' : 'text-navy-200 hover:text-white')}
                                >
                                    <span className="absolute inset-x-0 top-0 h-px bg-white/15" />
                                    {i === index && (
                                        <span
                                            key={index}
                                            onAnimationEnd={() => autoplay && go(index + 1)}
                                            className="absolute left-0 top-0 h-[2px] w-full origin-left bg-crest-300"
                                            style={autoplay ? { animation: `fill ${INTERVAL}ms linear both`, animationPlayState: paused ? 'paused' : 'running' } : undefined}
                                        />
                                    )}
                                    <span className="font-serif text-lg italic text-crest-300">{pad(i + 1)}</span>
                                    <span className="ml-3 hidden truncate text-[13px] font-semibold uppercase tracking-[0.14em] sm:inline">{s.eyebrow || s.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
