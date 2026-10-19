import SiteLayout from '@/Layouts/SiteLayout';
import { PageBanner, Photo, Prose, SectionHeading } from '@/Components/site/Parts';
import { useMedia, useSite } from '@/lib/site';
import type { CoreValue, Staff } from '@/types/cms';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export default function About({ values, leaders }: { values: CoreValue[]; leaders: Staff[] }) {
    const site = useSite();
    const media = useMedia();
    const image = media(site.about_image);

    return (
        <SiteLayout title={site.about_title ?? ''}>
            <PageBanner title={site.about_title ?? ''} crumb={site.nav_about ?? ''} intro={site.about_banner_text || site.motto} page="about" />

            <section className="py-20 sm:py-28">
                <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-20">
                    <div className="lg:col-span-5">
                        <SectionHeading eyebrow={site.about_intro_eyebrow} title={site.about_intro_title ?? ''} />
                        {image && (
                            <div className="relative mt-12" data-reveal="curtain">
                                <div aria-hidden className="absolute -right-4 -top-4 h-full w-full border border-brass/60" />
                                <Photo src={image} ratio="aspect-[4/3]" className="relative" alt={site.site_name ?? ''} />
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-7 lg:pt-12" data-reveal><Prose text={site.about_intro} lead /></div>
                </div>
            </section>

            <section className="bg-crest-100 py-20 sm:py-24">
                <div className="container-site grid gap-12 md:grid-cols-2 md:gap-0 md:divide-x md:divide-navy-900/15" data-reveal-group data-reveal-step="160">
                    {[{ t: site.vision_label, v: site.vision }, { t: site.mission_label, v: site.mission }].filter((b) => b.v).map((b) => (
                        <div key={b.v} className="text-center md:px-12">
                            {b.t && <p className="eyebrow">{b.t}</p>}
                            <p className="mt-5 font-serif text-[1.9rem] italic leading-[1.35] text-navy-900">{b.v}</p>
                        </div>
                    ))}
                </div>
            </section>

            {values.length > 0 && (
                <section className="py-20 sm:py-28">
                    <div className="container-site">
                        <SectionHeading eyebrow={site.values_eyebrow} title={site.values_title ?? ''} align="center" />
                        <dl className="mt-16 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3" data-reveal-group data-reveal-step="110">
                            {values.map((v, i) => (
                                <div key={v.id} className="bg-white p-9">
                                    <span className="font-serif text-xl italic text-brass">{ROMAN[i]}.</span>
                                    <dt className="mt-2 font-serif text-[1.85rem] font-semibold text-navy-900">{v.title}</dt>
                                    <dd className="mt-3 leading-relaxed text-slate-600">{v.description}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>
            )}

            {site.history && (
                <section className="ground-navy py-20 text-white sm:py-28">
                    <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-20">
                        <div className="lg:col-span-4">
                            <SectionHeading eyebrow={site.history_eyebrow} title={site.history_title ?? ''} light />
                        </div>
                        <div className="lg:col-span-8 lg:pt-10" data-reveal><Prose text={site.history} className="rich-light" /></div>
                    </div>
                </section>
            )}

            {leaders.length > 0 && (
                <section className="py-20 sm:py-28">
                    <div className="container-site">
                        <SectionHeading eyebrow={site.leaders_eyebrow} title={site.leaders_title ?? ''} align="center" />
                        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group data-reveal-step="130">
                            {leaders.map((s) => (
                                <div key={s.id} className="text-center">
                                    <Photo src={media(s.photo)} initials={s.name} ratio="aspect-[4/5]" alt={s.name} />
                                    <h3 className="mt-5 text-[1.6rem]">{s.name}</h3>
                                    <p className="mt-1 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-crest-700">{s.position}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
