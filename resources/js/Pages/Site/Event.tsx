import { Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';
import { ArrowLink, PageBanner, fmtDate } from '@/Components/site/Parts';
import RichText from '@/Components/site/RichText';
import PhotoGrid from '@/Components/site/PhotoGrid';
import ShareBar from '@/Components/site/ShareBar';
import { useMedia, useSite } from '@/lib/site';
import type { SchoolEvent } from '@/types/cms';

export function eventDates(e: SchoolEvent) {
    if (!e.ends_at || e.ends_at.slice(0, 10) === e.starts_at.slice(0, 10)) return fmtDate(e.starts_at, 'EEEE, d MMMM yyyy');
    return `${fmtDate(e.starts_at, 'd MMMM')} – ${fmtDate(e.ends_at, 'd MMMM yyyy')}`;
}

export default function Event({ event, upcoming }: { event: SchoolEvent; upcoming: SchoolEvent[] }) {
    const site = useSite();
    const media = useMedia();
    const cover = media(event.image);
    const facts = [
        { label: site.event_when, value: eventDates(event) },
        { label: site.event_time, value: event.time },
        { label: site.event_where, value: event.location },
    ].filter((f) => f.value);

    return (
        <SiteLayout title={event.title} description={event.summary ?? undefined}>
            <PageBanner title={site.events_page_title ?? ''} crumb={site.nav_events ?? ''} page="events" />

            <article className="py-16 sm:py-24">
                <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
                    {/* Calendar leaf + key facts */}
                    <aside className="lg:col-span-4" data-reveal="left">
                        <div className="lg:sticky lg:top-24">
                            <div className="mx-auto max-w-[16rem] lg:mx-0">
                                <div className="bg-navy-900 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.26em] text-crest-300">{fmtDate(event.starts_at, 'MMMM yyyy')}</div>
                                <div className="border-x border-b border-rule bg-white py-6 text-center">
                                    <div className="font-serif text-[6rem] font-semibold leading-none text-navy-900">{fmtDate(event.starts_at, 'd')}</div>
                                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{fmtDate(event.starts_at, 'EEEE')}</div>
                                </div>
                            </div>
                            <dl className="mt-8 divide-y divide-rule border-y border-rule">
                                {facts.map((f) => (
                                    <div key={f.label} className="py-4">
                                        <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-crest-700">{f.label}</dt>
                                        <dd className="mt-1 font-serif text-xl text-navy-900">{f.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </aside>

                    <div className="lg:col-span-8" data-reveal>
                        <h1 className="text-[2.6rem] leading-[1.08] sm:text-[3.5rem]">{event.title}</h1>
                        {event.summary && <p className="mt-5 font-serif text-[1.5rem] italic leading-relaxed text-slate-600">{event.summary}</p>}
                        {cover && <img src={cover} alt="" className="mt-10 aspect-[16/9] w-full object-cover" />}
                        <RichText html={event.description} className="mt-10" />
                        <PhotoGrid photos={event.photos ?? []} title={site.photos_title} />
                        <ShareBar title={event.title} />
                        <div className="mt-14 border-t border-rule pt-6"><ArrowLink href={route('events')}>{site.events_back}</ArrowLink></div>
                    </div>
                </div>
            </article>

            {upcoming.length > 0 && site.events_upcoming && (
                <section className="border-t border-rule bg-white/80 py-16">
                    <div className="container-site">
                        <h2 className="mb-8 text-[2rem]">{site.events_upcoming}</h2>
                        <ul className="grid gap-6 md:grid-cols-3" data-reveal-group data-reveal-step="130">
                            {upcoming.map((e) => (
                                <li key={e.id}>
                                    <Link href={e.slug ? route('events.show', e.slug) : route('events')} className="group flex gap-5 border border-rule bg-white p-5 hover:border-navy-900">
                                        <div className="w-14 shrink-0 bg-navy-900 py-2 text-center text-white">
                                            <div className="font-serif text-[1.7rem] font-semibold leading-none">{fmtDate(e.starts_at, 'd')}</div>
                                            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-crest-300">{fmtDate(e.starts_at, 'MMM')}</div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl leading-snug group-hover:text-crest-700">{e.title}</h3>
                                            {(e.time || e.location) && <p className="mt-1 text-sm text-slate-500">{[e.time, e.location].filter(Boolean).join(' · ')}</p>}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
