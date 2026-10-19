import SiteLayout from '@/Layouts/SiteLayout';
import { Empty, PageBanner, Photo, Prose, SectionHeading } from '@/Components/site/Parts';
import { lines, useMedia, useSite } from '@/lib/site';
import type { Facility, Program } from '@/types/cms';

export default function Academics({ programs, facilities }: { programs: Program[]; facilities: Facility[] }) {
    const site = useSite();
    const media = useMedia();

    return (
        <SiteLayout title={site.academics_title ?? ''}>
            <PageBanner title={site.academics_title ?? ''} crumb={site.nav_academics ?? ''} intro={site.academics_banner_text} page="academics" />

            <section className="py-16 sm:py-20">
                <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-16" data-reveal-group data-reveal-step="150">
                    <Prose text={site.academics_intro} className="lg:col-span-7" />
                    {site.academics_note && (
                        <aside className="border-l-4 border-brass bg-paper p-6 lg:col-span-5">
                            {site.academics_note_label && <p className="eyebrow mb-2">{site.academics_note_label}</p>}
                            <Prose text={site.academics_note} className="!text-base !leading-relaxed" />
                        </aside>
                    )}
                </div>
            </section>

            <section className="bg-paper py-16 sm:py-20">
                <div className="container-site">
                    <SectionHeading eyebrow={site.curriculum_eyebrow} title={site.curriculum_title ?? ''} />
                    {programs.length === 0 ? (
                        <div className="mt-10"><Empty>{site.curriculum_empty}</Empty></div>
                    ) : (
                        <div className="mt-10 space-y-px border border-rule bg-rule" data-reveal-group data-reveal-step="120">
                            {programs.map((p) => (
                                <article key={p.id} className="grid gap-6 bg-white p-8 md:grid-cols-12">
                                    <div className="md:col-span-4">
                                        <p className="eyebrow mb-2">{p.level}</p>
                                        <h3 className="text-[2rem]">{p.title}</h3>
                                    </div>
                                    <div className="md:col-span-5">
                                        <p className="leading-relaxed text-slate-600">{p.summary}</p>
                                    </div>
                                    <ul className="space-y-1.5 text-[15px] text-slate-700 md:col-span-3">
                                        {lines(p.subjects).map((s) => (
                                            <li key={s} className="border-b border-rule/70 pb-1.5">{s}</li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {facilities.length > 0 && (
                <section className="py-16 sm:py-20">
                    <div className="container-site">
                        <SectionHeading eyebrow={site.facilities_eyebrow} title={site.facilities_title ?? ''} />
                        <div className="mt-10 grid gap-8 sm:grid-cols-2" data-reveal-group data-reveal-step="130">
                            {facilities.map((f) => (
                                <article key={f.id} className={f.image ? 'grid gap-5 sm:grid-cols-5' : 'border-t-2 border-navy-800 pt-5'}>
                                    {f.image && <Photo src={media(f.image)} ratio="aspect-[4/3]" className="sm:col-span-2" alt={f.title} />}
                                    <div className="sm:col-span-3">
                                        <h3 className="text-2xl">{f.title}</h3>
                                        <p className="mt-2 leading-relaxed text-slate-600">{f.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
