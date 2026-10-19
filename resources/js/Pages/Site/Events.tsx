import { Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';
import { eventDates } from './Event';
import { Empty, PageBanner, fmtDate } from '@/Components/site/Parts';
import { useSite } from '@/lib/site';
import type { SchoolEvent } from '@/types/cms';

function EventRow({ e, muted = false }: { e: SchoolEvent; muted?: boolean }) {
    const site = useSite();
    const inner = (
        <>
            <div className="w-20 shrink-0">
                <div className="bg-navy-900 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-crest-300">{fmtDate(e.starts_at, 'MMM yyyy')}</div>
                <div className="border-x border-b border-rule bg-white py-2 text-center font-serif text-4xl font-semibold leading-none text-navy-900">{fmtDate(e.starts_at, 'd')}</div>
            </div>
            <div className="min-w-0">
                <h3 className="text-2xl leading-snug group-hover:text-crest-700">{e.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{[eventDates(e), e.time, e.location].filter(Boolean).join(' · ')}</p>
                {e.summary && <p className="mt-3 leading-relaxed text-slate-600">{e.summary}</p>}
                {e.slug && <span className="mt-3 inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-navy-900 group-hover:text-crest-700">{site.read_more} →</span>}
            </div>
        </>
    );
    return (
        <li className={muted ? 'opacity-75' : ''}>
            {e.slug ? <Link href={route('events.show', e.slug)} className="group flex gap-6 py-7">{inner}</Link> : <div className="flex gap-6 py-7">{inner}</div>}
        </li>
    );
}

export default function Events({ upcoming, past }: { upcoming: SchoolEvent[]; past: SchoolEvent[] }) {
    const site = useSite();

    return (
        <SiteLayout title={site.events_page_title ?? ''}>
            <PageBanner title={site.events_page_title ?? ''} crumb={site.nav_events ?? ''} intro={site.events_intro} page="events" />
            <div className="py-16 sm:py-20">
                <div className="container-site max-w-4xl">
                    {site.events_upcoming && <h2 className="mb-2 text-[2rem]">{site.events_upcoming}</h2>}
                    {upcoming.length === 0 ? <Empty>{site.events_empty}</Empty> : (
                        <ul className="divide-y divide-rule border-y border-rule" data-reveal-group data-reveal-step="110">{upcoming.map((e) => <EventRow key={e.id} e={e} />)}</ul>
                    )}

                    {past.length > 0 && (
                        <>
                            {site.events_past && <h2 className="mb-2 mt-16 text-[2rem]">{site.events_past}</h2>}
                            <ul className="divide-y divide-rule border-y border-rule" data-reveal-group data-reveal-step="90">{past.map((e) => <EventRow key={e.id} e={e} muted />)}</ul>
                        </>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
}
