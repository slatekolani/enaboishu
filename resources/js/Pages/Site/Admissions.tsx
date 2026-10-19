import { Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';
import { ArrowLink, PageBanner, Prose, SectionHeading } from '@/Components/site/Parts';
import { lines, useSite } from '@/lib/site';
import { fileSize } from './Downloads';
import type { DownloadItem } from '@/types/cms';

export default function Admissions({ downloads }: { downloads: DownloadItem[] }) {
    const site = useSite();
    const steps = lines(site.adm_steps).map((l) => {
        const [title, ...rest] = l.split('|');
        return { title: title.trim(), text: rest.join('|').trim() };
    });
    const requirements = lines(site.adm_requirements);

    return (
        <SiteLayout title={site.admissions_title ?? ''}>
            <PageBanner title={site.admissions_title ?? ''} crumb={site.nav_admissions ?? ''} intro={site.admissions_banner_text} page="admissions" />

            <section className="py-16 sm:py-20">
                <div className="container-site max-w-4xl" data-reveal>
                    <Prose text={site.adm_intro} className="text-lg" />
                    <Link href={route('apply')} className="btn-primary mt-8">{site.adm_apply_button} →</Link>
                </div>
            </section>

            {steps.length > 0 && (
                <section className="bg-paper py-16 sm:py-20">
                    <div className="container-site">
                        <SectionHeading eyebrow={site.adm_steps_eyebrow} title={site.adm_steps_title ?? ''} />
                        <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4" data-reveal-group data-reveal-step="140">
                            {steps.map((s, i) => (
                                <li key={s.title} className="border-t-2 border-navy-800 pt-5">
                                    <span className="font-serif text-4xl font-bold text-brass">{i + 1}</span>
                                    <h3 className="mt-2 text-2xl">{s.title}</h3>
                                    <p className="mt-2 leading-relaxed text-slate-600">{s.text}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}

            <section className="py-16 sm:py-20">
                <div className="container-site grid gap-12 lg:grid-cols-2 lg:gap-16" data-reveal-group data-reveal-step="150">
                    {requirements.length > 0 && (
                        <div>
                            {site.adm_requirements_title && <h2 className="text-[2rem]">{site.adm_requirements_title}</h2>}
                            <ul className="mt-5 divide-y divide-rule border-y border-rule">
                                {requirements.map((r) => (
                                    <li key={r} className="flex gap-3 py-3 text-slate-700">
                                        <svg width="18" height="18" viewBox="0 0 18 18" className="mt-1 shrink-0 text-crest-700" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M3 9.5l4 4 8-9" /></svg>
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div>
                        {site.adm_fees_title && <h2 className="text-[2rem]">{site.adm_fees_title}</h2>}
                        <Prose text={site.adm_fees} className="mt-5 !text-base" />
                        {downloads.length > 0 && (
                            <ul className="mt-6 divide-y divide-rule border-y border-rule">
                                {downloads.map((d) => (
                                    <li key={d.id}>
                                        <a href={route('downloads.file', d.id)} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 py-4">
                                            <span>
                                                <span className="block font-semibold text-navy-900 group-hover:text-crest-700">{d.title}</span>
                                                <span className="text-sm text-slate-500">{[d.category, d.file_type, fileSize(d.file_size)].filter(Boolean).join(' · ')}</span>
                                            </span>
                                            <span className="text-sm font-semibold text-navy-800">{site.download_label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {site.downloads_link && <div className="mt-6"><ArrowLink href={route('downloads')}>{site.downloads_link}</ArrowLink></div>}
                    </div>
                </div>
            </section>

            <section className="ground-navy py-14 text-white">
                <div className="container-site flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <p className="max-w-xl text-xl">{site.adm_contact}</p>
                    <div className="flex flex-wrap gap-3">
                        <Link href={route('apply')} className="btn-ivory">{site.adm_apply_button}</Link>
                        <Link href={route('contact')} className="btn-outline-light">{site.adm_contact_button}</Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
