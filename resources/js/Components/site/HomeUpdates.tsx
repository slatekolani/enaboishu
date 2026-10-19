import { Link } from '@inertiajs/react';
import Logo from '@/Components/site/Logo';
import { ArrowLink, Empty, Ornament, fmtDate } from '@/Components/site/Parts';
import { readingMinutes, useMedia, useSite } from '@/lib/site';
import type { Article, Post, SchoolEvent } from '@/types/cms';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Latest news: laid out like the front page of a school gazette.      */
/* ------------------------------------------------------------------ */

export function NewsGazette({ posts }: { posts: Post[] }) {
    const site = useSite();
    const media = useMedia();
    // The lead is the newest story with a photo, so the largest spot is never empty.
    const lead = posts.find((p) => p.image) ?? posts[0];
    const rest = posts.filter((p) => p !== lead).slice(0, 4);

    return (
        <section aria-labelledby="news-heading" className="py-20 sm:py-28">
            <div className="container-site">
                {/* Masthead */}
                <header className="text-center" data-reveal>
                    {site.news_eyebrow && (
                        <p className="eyebrow flex items-center justify-center gap-4">
                            <span className="h-px w-10 bg-crest-700/50" />
                            {site.news_eyebrow}
                            <span className="h-px w-10 bg-crest-700/50" />
                        </p>
                    )}
                    {site.news_title && <h2 id="news-heading" className="mt-4 text-5xl sm:text-[4rem] sm:leading-none">{site.news_title}</h2>}
                </header>
                <div className="double-rule mt-8 text-navy-900" />
                <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    <span>{site.site_name}</span>
                    <span className="hidden sm:inline">{fmtDate(new Date().toISOString(), 'EEEE, d MMMM yyyy')}</span>
                    {site.news_link && <ArrowLink href={route('news')}>{site.news_link}</ArrowLink>}
                </div>
                <div className="h-px bg-navy-900" />

                {!lead ? (
                    <div className="mt-10"><Empty>{site.home_news_empty}</Empty></div>
                ) : (
                    <div className="grid gap-12 pt-10 lg:grid-cols-12 lg:gap-0">
                        {/* Lead story */}
                        <article data-reveal className={cn(rest.length ? 'lg:col-span-7 lg:border-r lg:border-rule lg:pr-12' : 'lg:col-span-12')}>
                            {lead.image && (
                                <Link href={route('news.show', lead.slug)} className="block overflow-hidden">
                                    <img src={media(lead.image) ?? ''} alt="" className="aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-[1.03]" />
                                </Link>
                            )}
                            <p className={cn('eyebrow', lead.image ? 'mt-7' : '')}>{fmtDate(lead.published_at)}</p>
                            <h3 className="mt-3 text-[2.3rem] leading-[1.1] sm:text-[2.8rem]">
                                <Link href={route('news.show', lead.slug)} className="hover:text-crest-700">{lead.title}</Link>
                            </h3>
                            {lead.excerpt && (
                                <p className="mt-5 text-[17.5px] leading-[1.8] text-slate-700 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-[4.2rem] first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-navy-900">
                                    {lead.excerpt}
                                </p>
                            )}
                            <div className="mt-6"><ArrowLink href={route('news.show', lead.slug)}>{site.read_more}</ArrowLink></div>
                        </article>

                        {/* In brief */}
                        {rest.length > 0 && (
                            <div className="lg:col-span-5 lg:pl-12">
                                <ul className="divide-y divide-rule border-y border-rule lg:border-t-0" data-reveal-group="right" data-reveal-step="130">
                                    {rest.map((p) => (
                                        <li key={p.id}>
                                            <Link href={route('news.show', p.slug)} className="group flex gap-5 py-6 first:pt-0 lg:first:pt-0">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-crest-700">{fmtDate(p.published_at)}</p>
                                                    <h4 className="mt-2 font-serif text-[1.45rem] font-semibold leading-snug text-navy-900 group-hover:text-crest-700">{p.title}</h4>
                                                    {p.excerpt && <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-slate-600">{p.excerpt}</p>}
                                                </div>
                                                {p.image && <img src={media(p.image) ?? ''} alt="" className="h-24 w-24 shrink-0 object-cover" />}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Latest events: calendar leaves, like pages torn from a desk diary.  */
/* ------------------------------------------------------------------ */

function days(e: SchoolEvent) {
    const start = fmtDate(e.starts_at, 'd');
    if (!e.ends_at || e.ends_at.slice(0, 10) === e.starts_at.slice(0, 10)) return start;
    const sameMonth = e.ends_at.slice(0, 7) === e.starts_at.slice(0, 7);
    return sameMonth ? `${start}–${fmtDate(e.ends_at, 'd')}` : start;
}

export function EventsCalendar({ events }: { events: SchoolEvent[] }) {
    const site = useSite();

    return (
        <section aria-labelledby="events-heading" className="border-y border-rule bg-white/80 py-20 sm:py-28">
            <div className="container-site">
                <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
                    <div>
                        {site.events_eyebrow && <p className="eyebrow mb-4">{site.events_eyebrow}</p>}
                        {site.events_title && <h2 id="events-heading" className="text-4xl leading-[1.08] sm:text-[3.1rem]">{site.events_title}</h2>}
                        <Ornament className="mt-6 text-brass" width="w-28" />
                    </div>
                    {site.events_link && <ArrowLink href={route('events')}>{site.events_link}</ArrowLink>}
                </div>

                {events.length === 0 ? (
                    <div className="mt-12"><Empty>{site.home_events_empty}</Empty></div>
                ) : (
                    <ol className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group data-reveal-step="140">
                        {events.map((e) => {
                            const body = (
                                <>
                                    {/* Binding rings */}
                                    <span aria-hidden className="absolute -top-2 left-0 right-0 flex justify-center gap-16">
                                        <span className="h-4 w-1.5 rounded-full bg-navy-700" />
                                        <span className="h-4 w-1.5 rounded-full bg-navy-700" />
                                    </span>
                                    <div className="bg-navy-900 px-5 pb-2.5 pt-4 text-center text-[11px] font-semibold uppercase tracking-[0.26em] text-crest-300">
                                        {fmtDate(e.starts_at, 'MMMM yyyy')}
                                    </div>
                                    <div className="flex-1 border-x border-b border-rule bg-white px-6 pb-6 pt-5 transition-colors group-hover:bg-crest-50">
                                        <div className="text-center">
                                            <div className="font-serif text-[4.5rem] font-semibold leading-none text-navy-900">{days(e)}</div>
                                            <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{fmtDate(e.starts_at, 'EEEE')}</div>
                                        </div>
                                        <Ornament className="mx-auto mt-5 text-rule" width="w-20" />
                                        <h3 className="mt-5 text-center text-[1.45rem] leading-snug group-hover:text-crest-700">{e.title}</h3>
                                        {(e.time || e.location) && (
                                            <p className="mt-2 text-center text-[13.5px] text-slate-500">{[e.time, e.location].filter(Boolean).join(' · ')}</p>
                                        )}
                                        {e.summary && <p className="mt-3 line-clamp-3 text-center text-[15px] leading-relaxed text-slate-600">{e.summary}</p>}
                                    </div>
                                </>
                            );
                            return (
                                <li key={e.id} className="relative">
                                    {e.slug ? <Link href={route('events.show', e.slug)} className="group flex h-full flex-col">{body}</Link> : <div className="group flex h-full flex-col">{body}</div>}
                                </li>
                            );
                        })}
                    </ol>
                )}
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Latest articles: a journal index on navy, with arched plates.       */
/* ------------------------------------------------------------------ */

export function ArticlePlate({ article, index, light = true }: { article: Article; index: number; light?: boolean }) {
    const site = useSite();
    const media = useMedia();
    const img = media(article.image);
    const meta = [article.category, `${readingMinutes(article.body)} ${site.minutes_read}`].filter(Boolean).join(' · ');

    return (
        <article className="group">
            <Link href={route('articles.show', article.slug)} className="relative mx-auto block max-w-[18.5rem]">
                <span aria-hidden className={cn('absolute -inset-2.5 rounded-t-full border transition-colors', light ? 'border-crest-300/30 group-hover:border-crest-300/70' : 'border-navy-900/20 group-hover:border-navy-900/50')} />
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-crest-100">
                    {img ? (
                        <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                    ) : (
                        <div className="bg-school flex h-full w-full flex-col items-center justify-center gap-4">
                            <Logo className="h-16 opacity-90" />
                            <span className="font-serif text-2xl italic text-navy-700">{site.article_no} {index + 1}</span>
                        </div>
                    )}
                </div>
            </Link>
            <div className="mx-auto mt-8 max-w-sm text-center">
                <p className={cn('text-[11px] font-semibold uppercase tracking-[0.24em]', light ? 'text-crest-300' : 'text-crest-700')}>{meta}</p>
                <h3 className={cn('mt-3 text-[1.75rem] leading-[1.15]', light ? '!text-white' : '')}>
                    <Link href={route('articles.show', article.slug)} className={light ? 'hover:text-crest-300' : 'hover:text-crest-700'}>{article.title}</Link>
                </h3>
                {article.author && (
                    <p className={cn('mt-3 font-serif text-lg italic', light ? 'text-navy-100' : 'text-slate-600')}>
                        {site.by_label} {article.author}
                    </p>
                )}
                {article.excerpt && <p className={cn('mt-3 line-clamp-3 text-[15px] leading-relaxed', light ? 'text-navy-200' : 'text-slate-600')}>{article.excerpt}</p>}
            </div>
        </article>
    );
}

export function ArticlesJournal({ articles }: { articles: Article[] }) {
    const site = useSite();

    return (
        <section aria-labelledby="articles-heading" className="ground-navy py-20 text-white sm:py-28">
            <div className="container-site">
                <header className="mx-auto max-w-2xl text-center" data-reveal>
                    {site.articles_eyebrow && <p className="eyebrow !text-crest-300">{site.articles_eyebrow}</p>}
                    {site.articles_title && <h2 id="articles-heading" className="mt-4 text-4xl leading-[1.08] !text-white sm:text-[3.1rem]">{site.articles_title}</h2>}
                    <Ornament className="mx-auto mt-6 text-crest-300" width="w-28" />
                    {site.articles_text && <p className="mt-6 text-lg leading-relaxed text-navy-100">{site.articles_text}</p>}
                </header>

                {articles.length === 0 ? (
                    <p className="mx-auto mt-14 max-w-xl border border-white/15 px-6 py-12 text-center font-serif text-xl italic text-navy-200">{site.home_articles_empty}</p>
                ) : (
                    <div className="mt-20 grid gap-16 md:grid-cols-3 md:gap-10" data-reveal-group data-reveal-step="170">
                        {articles.map((a, i) => <ArticlePlate key={a.id} article={a} index={i} />)}
                    </div>
                )}

                {site.articles_link && articles.length > 0 && (
                    <div className="mt-16 text-center"><ArrowLink href={route('articles')} light>{site.articles_link}</ArrowLink></div>
                )}
            </div>
        </section>
    );
}
