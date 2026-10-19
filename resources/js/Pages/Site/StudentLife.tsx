import { useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Empty, Ornament, PageBanner, Photo, SectionHeading } from '@/Components/site/Parts';
import RichText from '@/Components/site/RichText';
import PhotoGrid from '@/Components/site/PhotoGrid';
import { lines, useMedia, useSite } from '@/lib/site';
import { cn } from '@/lib/utils';

interface Club { id: number; name: string; kind: 'Club' | 'Sport' | 'Society'; summary: string | null; description: string | null; patron: string | null; meets: string | null; achievements: string | null; image: string | null; photos: string[] | null }
interface Leader { id: number; name: string; role: string; class_name: string | null; term: string | null; quote: string | null; photo: string | null }

function ClubCard({ c }: { c: Club }) {
    const site = useSite();
    const media = useMedia();
    const [open, setOpen] = useState(false);
    const achievements = lines(c.achievements);
    const more = !!c.description || (c.photos?.length ?? 0) > 0;

    return (
        <article className="flex flex-col border border-rule bg-white">
            <div className="relative overflow-hidden">
                {c.image ? (
                    <img src={media(c.image) ?? ''} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                ) : (
                    <div className="bg-school flex aspect-[16/10] items-center justify-center">
                        <span className="font-serif text-6xl font-semibold text-navy-200">{c.name.charAt(0)}</span>
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col p-7">
                <h3 className="text-[1.75rem] leading-tight">{c.name}</h3>
                {c.summary && <p className="mt-3 leading-relaxed text-slate-600">{c.summary}</p>}
                {(c.patron || c.meets) && (
                    <dl className="mt-5 space-y-1.5 border-t border-rule pt-4 text-[14.5px]">
                        {c.patron && <div className="flex gap-2"><dt className="font-semibold text-navy-900">{site.life_patron}:</dt><dd className="text-slate-600">{c.patron}</dd></div>}
                        {c.meets && <div className="flex gap-2"><dt className="font-semibold text-navy-900">{site.life_meets}:</dt><dd className="text-slate-600">{c.meets}</dd></div>}
                    </dl>
                )}
                {achievements.length > 0 && (
                    <div className="mt-5">
                        <p className="eyebrow mb-2">{site.life_achievements}</p>
                        <ul className="rich !text-[15px] !leading-relaxed">{achievements.map((a) => <li key={a}>{a}</li>)}</ul>
                    </div>
                )}
                {more && (
                    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="mt-auto self-start pt-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-navy-900 hover:text-crest-700">
                        {open ? site.staff_less : site.read_more} {open ? '↑' : '↓'}
                    </button>
                )}
                {open && (
                    <div className="mt-5 border-t border-rule pt-5">
                        <RichText html={c.description} className="!text-[16px]" />
                        <PhotoGrid photos={c.photos ?? []} />
                    </div>
                )}
            </div>
        </article>
    );
}

export default function StudentLife({ clubs, leaders }: { clubs: Club[]; leaders: Leader[] }) {
    const site = useSite();
    const media = useMedia();
    const sections = [
        { key: 'clubs', title: site.life_clubs_title, items: clubs.filter((c) => c.kind !== 'Sport') },
        { key: 'sports', title: site.life_sports_title, items: clubs.filter((c) => c.kind === 'Sport') },
    ].filter((s) => s.items.length);

    return (
        <SiteLayout title={site.life_title ?? ''}>
            <PageBanner title={site.life_title ?? ''} crumb={site.nav_student_life ?? ''} intro={site.life_intro} page="life" />

            {sections.length === 0 && leaders.length === 0 && (
                <div className="container-site py-20"><Empty>{site.life_empty}</Empty></div>
            )}

            {sections.map((sec, i) => (
                <section key={sec.key} className={cn('py-20 sm:py-24', i % 2 === 1 && 'border-y border-rule bg-white/70')}>
                    <div className="container-site">
                        {sec.title && <SectionHeading title={sec.title} />}
                        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-reveal-group data-reveal-step="120">
                            {sec.items.map((c) => <ClubCard key={c.id} c={c} />)}
                        </div>
                    </div>
                </section>
            ))}

            {leaders.length > 0 && (
                <section className="ground-navy py-20 text-white sm:py-28">
                    <div className="container-site">
                        <SectionHeading eyebrow={site.life_leaders_eyebrow} title={site.life_leaders_title ?? ''} align="center" light>{site.life_leaders_text}</SectionHeading>
                        <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group data-reveal-step="110">
                            {leaders.map((l) => (
                                <figure key={l.id} className="text-center">
                                    <div className="relative mx-auto max-w-[14rem]">
                                        <div aria-hidden className="absolute -inset-2.5 rounded-t-full border border-crest-300/30" />
                                        <div className="relative overflow-hidden rounded-t-full">
                                            <Photo src={media(l.photo)} initials={l.name} ratio="aspect-[4/5]" alt={l.name} className="!border-0 !bg-crest-100" />
                                        </div>
                                    </div>
                                    <figcaption className="mt-6">
                                        <p className="font-serif text-[1.5rem] font-semibold text-white">{l.name}</p>
                                        <p className="mt-1 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-crest-300">{l.role}</p>
                                        {(l.class_name || l.term) && <p className="mt-1 text-sm text-navy-200">{[l.class_name, l.term].filter(Boolean).join(' · ')}</p>}
                                        {l.quote && <p className="mx-auto mt-4 max-w-xs font-serif text-lg italic leading-relaxed text-navy-100">“{l.quote}”</p>}
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                        <Ornament className="mx-auto mt-16 text-crest-300" width="w-32" />
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
