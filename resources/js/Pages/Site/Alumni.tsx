import SiteLayout from '@/Layouts/SiteLayout';
import { PageBanner, Photo, SectionHeading } from '@/Components/site/Parts';
import { useMedia, useSite } from '@/lib/site';

interface Person { id: number; name: string; graduation_year: number | null; occupation: string | null; organisation: string | null; story?: string | null; photo?: string | null }

export default function Alumni({ featured }: { featured: Person[] }) {
    const site = useSite();
    const media = useMedia();

    return (
        <SiteLayout title={site.alumni_title ?? ''}>
            <PageBanner title={site.alumni_title ?? ''} crumb={site.nav_alumni ?? ''} intro={site.alumni_intro} page="alumni" />

            {featured.length > 0 && (
                <section className="py-20 sm:py-24">
                    <div className="container-site">
                        {site.alumni_stories_title && <SectionHeading title={site.alumni_stories_title} align="center" />}
                        <div className="mt-14 grid gap-12 md:grid-cols-2 lg:grid-cols-3" data-reveal-group data-reveal-step="140">
                            {featured.map((p) => (
                                <figure key={p.id} className="flex flex-col border-t-[3px] border-navy-900 bg-white p-7">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 shrink-0 overflow-hidden rounded-t-full">
                                            <Photo src={media(p.photo)} initials={p.name} ratio="aspect-[4/5]" className="!text-2xl" alt={p.name} />
                                        </div>
                                        <figcaption>
                                            <p className="font-serif text-[1.4rem] font-semibold leading-tight text-navy-900">{p.name}</p>
                                            {p.graduation_year && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-crest-700">{site.alumni_class_of} {p.graduation_year}</p>}
                                            {(p.occupation || p.organisation) && <p className="mt-1 text-sm text-slate-500">{[p.occupation, p.organisation].filter(Boolean).join(', ')}</p>}
                                        </figcaption>
                                    </div>
                                    {p.story && <blockquote className="mt-6 whitespace-pre-line font-serif text-[1.2rem] italic leading-relaxed text-slate-700">“{p.story}”</blockquote>}
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {featured.length === 0 && site.alumni_empty && (
                <p className="container-site py-24 text-center font-serif text-xl italic text-slate-500">{site.alumni_empty}</p>
            )}
        </SiteLayout>
    );
}
