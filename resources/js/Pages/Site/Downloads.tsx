import { useMemo, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Empty, PageBanner } from '@/Components/site/Parts';
import { useSite } from '@/lib/site';
import { cn } from '@/lib/utils';
import type { DownloadItem } from '@/types/cms';

const FORMS = ['Form I', 'Form II', 'Form III', 'Form IV', 'Form V', 'Form VI'];
const ALL = '__all';

export const fileSize = (bytes: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

function FileBadge({ type }: { type: string | null }) {
    return (
        <span aria-hidden className="relative flex h-14 w-11 shrink-0 items-end justify-center border border-rule bg-white pb-1.5 text-[10px] font-bold tracking-wider text-navy-900 [clip-path:polygon(0_0,72%_0,100%_22%,100%_100%,0_100%)]">
            <span className="absolute right-0 top-0 h-3 w-3 border-b border-l border-rule bg-crest-100" />
            {type ?? 'FILE'}
        </span>
    );
}

export default function Downloads({ downloads }: { downloads: DownloadItem[] }) {
    const site = useSite();
    const [form, setForm] = useState(ALL);
    const [type, setType] = useState(ALL);
    const [query, setQuery] = useState('');

    const forms = FORMS.filter((f) => downloads.some((d) => d.form_level === f));
    const types = Array.from(new Set(downloads.map((d) => d.category)));

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return downloads.filter((d) =>
            (form === ALL || d.form_level === form || d.form_level === 'All forms') &&
            (type === ALL || d.category === type) &&
            (!q || `${d.title} ${d.description ?? ''} ${d.category}`.toLowerCase().includes(q)),
        );
    }, [downloads, form, type, query]);

    const chip = (active: boolean) =>
        cn('border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors', active ? 'border-navy-900 bg-navy-900 text-white' : 'border-rule bg-white text-slate-600 hover:border-navy-900 hover:text-navy-900');

    return (
        <SiteLayout title={site.downloads_title ?? ''}>
            <PageBanner title={site.downloads_title ?? ''} crumb={site.nav_downloads ?? ''} intro={site.downloads_intro} page="downloads" />

            <div className="py-16 sm:py-20">
                <div className="container-site">
                    {downloads.length === 0 ? (
                        <Empty>{site.downloads_empty}</Empty>
                    ) : (
                        <div className="grid gap-12 lg:grid-cols-12">
                            {/* Filters */}
                            <aside className="space-y-8 lg:col-span-4" data-reveal="left">
                                <div>
                                    <label htmlFor="dl-search" className="eyebrow mb-3 block">{site.downloads_search?.replace('…', '')}</label>
                                    <input
                                        id="dl-search"
                                        type="search"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder={site.downloads_search ?? ''}
                                        className="w-full border-rule bg-white px-4 py-3 focus:border-navy-900 focus:ring-navy-900"
                                    />
                                </div>
                                {forms.length > 0 && (
                                    <div role="group" aria-label={site.downloads_all_forms ?? undefined}>
                                        <p className="eyebrow mb-3">{site.downloads_all_forms}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[ALL, ...forms].map((f) => (
                                                <button key={f} type="button" aria-pressed={f === form} onClick={() => setForm(f)} className={chip(f === form)}>
                                                    {f === ALL ? site.downloads_all_forms : f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {types.length > 1 && (
                                    <div role="group" aria-label={site.downloads_all_types ?? undefined}>
                                        <p className="eyebrow mb-3">{site.downloads_all_types}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[ALL, ...types].map((t) => (
                                                <button key={t} type="button" aria-pressed={t === type} onClick={() => setType(t)} className={chip(t === type)}>
                                                    {t === ALL ? site.downloads_all_types : t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </aside>

                            {/* Documents */}
                            <div className="lg:col-span-8">
                                {shown.length === 0 ? (
                                    <Empty>{site.downloads_empty}</Empty>
                                ) : (
                                    <ul className="divide-y divide-rule border-y border-rule bg-white/70" data-reveal-group data-reveal-step="70">
                                        {shown.map((d) => (
                                            <li key={`${form}-${type}-${d.id}`} className="flex flex-wrap items-center gap-5 px-5 py-5 sm:flex-nowrap">
                                                <FileBadge type={d.file_type} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-crest-700">
                                                        {[d.category, d.form_level !== 'All forms' ? d.form_level : null].filter(Boolean).join(' · ')}
                                                    </p>
                                                    <h2 className="mt-1 font-serif text-[1.4rem] font-semibold leading-snug text-navy-900">{d.title}</h2>
                                                    {d.description && <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{d.description}</p>}
                                                    <p className="mt-1 text-[13px] text-slate-500">
                                                        {[d.file_type, fileSize(d.file_size), d.downloads_count > 0 ? `${d.downloads_count.toLocaleString()} ${site.downloads_count_label}` : null].filter(Boolean).join(' · ')}
                                                    </p>
                                                </div>
                                                <a href={route('downloads.file', d.id)} target="_blank" rel="noreferrer" className="btn-primary !px-5 !py-2.5">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M12 3v12M7 10l5 5 5-5M4 20h16" /></svg>
                                                    {site.download_label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
}
