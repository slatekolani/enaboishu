import { FormEvent, useEffect, useMemo } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Field, { FieldDef } from '@/Components/admin/Field';
import { plainText, useMedia } from '@/lib/site';
import { toast } from '@/lib/alerts';
import { cn } from '@/lib/utils';

interface Props {
    page: { key: string; label: string; url: string; manage: { label: string; url: string }[]; isHome: boolean };
    lang: 'en' | 'sw';
    sections: { key: string; title: string; fields: FieldDef[] }[];
    values: Record<string, string | null>;
    english: Record<string, string | null>;
    swDefaults: Record<string, string>;
    heroKeys: { title: string | null; intro: string | null; banner: string | null };
}

/** One built-in page: its hero (banner), its wording and its menu entry. Saves into Site settings. */
export default function PageSettings({ page, lang, sections, values, english, swDefaults, heroKeys }: Props) {
    const media = useMedia();
    const sw = lang === 'sw';
    const all = sections.flatMap((s) => s.fields);

    const initial: Record<string, any> = { _lang: lang, _context: 'page' };
    all.forEach((f) => {
        initial[f.name] = f.type === 'image' ? null : values[f.name] ?? '';
        if (f.type === 'image') initial[`_remove_${f.name}`] = false;
    });
    const { data, setData, setDefaults, post, processing, errors, isDirty } = useForm(initial);

    // Live preview of the hero while editing.
    const bannerFile = heroKeys.banner ? (data[heroKeys.banner] as File | null) : null;
    const filePreview = useMemo(() => (bannerFile ? URL.createObjectURL(bannerFile) : null), [bannerFile]);
    useEffect(() => () => { if (filePreview) URL.revokeObjectURL(filePreview); }, [filePreview]);
    const removed = heroKeys.banner ? data[`_remove_${heroKeys.banner}`] : false;
    const bannerSrc = filePreview ?? (heroKeys.banner && !removed ? media(english[heroKeys.banner]) : null) ?? media(english.page_banner);
    const heroTitle = (heroKeys.title && (data[heroKeys.title] || (sw ? english[heroKeys.title] : ''))) || page.label;
    const heroIntro = heroKeys.intro ? data[heroKeys.intro] || (sw ? english[heroKeys.intro] : '') : '';

    const hint = (f: FieldDef) => {
        if (!sw) return f.help;
        const en = plainText(english[f.name]);
        return [en && `English: ${en.length > 140 ? `${en.slice(0, 140)}…` : en}`, swDefaults[f.name] && `Built-in Kiswahili: ${swDefaults[f.name]}`].filter(Boolean).join('  ·  ') || undefined;
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            forceFormData: true,
            preserveScroll: true,
            onError: () => toast('error', 'Some fields need attention.'),
            onSuccess: () => {
                // The saved values become the new starting point; chosen photo files are cleared.
                all.filter((f) => f.type === 'image').forEach((f) => { setData(f.name, null); setData(`_remove_${f.name}`, false); });
                setDefaults();
            },
        });
    };

    return (
        <AdminLayout title={`Edit page: ${page.label}${sw ? ' — Kiswahili' : ''}`}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <Link href={route('admin.pages')} className="text-sm text-slate-600 hover:underline">← All pages</Link>
                <div className="flex items-center gap-3">
                    <div className="flex border border-slate-300 bg-white" role="group" aria-label="Language">
                        <Link href={route('admin.pages.edit', page.key)} className={cn('px-3 py-1.5 text-sm font-semibold', !sw ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>English</Link>
                        <Link href={route('admin.pages.edit', { key: page.key, lang: 'sw' })} className={cn('px-3 py-1.5 text-sm font-semibold', sw ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>Kiswahili</Link>
                    </div>
                    <a href={page.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-navy-800 hover:underline">View page ↗</a>
                </div>
            </div>

            {/* Hero preview */}
            {page.isHome ? (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-crest-400 bg-crest-50 px-5 py-4">
                    <p className="text-[15px] text-slate-700">The home page hero is the <span className="font-semibold">slideshow</span>: photos, headlines and buttons are edited as hero slides.</p>
                    <Link href={route('admin.resource.index', 'slides')} className="btn-primary !py-2">Edit hero slides</Link>
                </div>
            ) : (
                <div className="relative mb-6 overflow-hidden bg-navy-900 text-white">
                    {bannerSrc && <img src={bannerSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                    <div className="absolute inset-0 bg-navy-950/70" />
                    <div className="relative px-6 py-10 text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-crest-300">Preview · Home / {page.label}</p>
                        <p className="mt-3 font-serif text-4xl font-semibold">{heroTitle}</p>
                        {heroIntro && <p className="mx-auto mt-3 max-w-xl font-serif text-lg italic text-navy-100">{heroIntro}</p>}
                    </div>
                </div>
            )}

            {page.manage.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-slate-500">Content on this page:</span>
                    {page.manage.map((m) => <Link key={m.label} href={m.url} className="border border-slate-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:border-navy-800">{m.label} →</Link>)}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                {sections.map((s) => (
                    <section key={s.key} className="border border-slate-200 bg-white">
                        <h2 className="border-b border-slate-200 px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-slate-500">{s.title}</h2>
                        <div className="space-y-6 p-6">
                            {s.key === 'seo' && (
                                <SearchPreview
                                    url={page.url}
                                    site={english.site_name ?? ''}
                                    title={String(data[s.fields[0]?.name] || (heroKeys.title ? data[heroKeys.title] ?? values[heroKeys.title] : '') || '')}
                                    description={String(data[s.fields[1]?.name] || (heroKeys.intro ? data[heroKeys.intro] ?? values[heroKeys.intro] : '') || english.meta_description || '')}
                                />
                            )}
                            {s.fields.map((f) => (
                                <Field
                                    key={f.name}
                                    field={{ ...f, help: hint(f) }}
                                    value={data[f.name]}
                                    error={errors[f.name as keyof typeof errors]}
                                    existing={values[f.name]}
                                    removed={data[`_remove_${f.name}`]}
                                    onChange={(v) => setData(f.name, v)}
                                    onRemove={(r) => setData(`_remove_${f.name}`, r)}
                                />
                            ))}
                        </div>
                    </section>
                ))}
                <div className="sticky bottom-0 -mx-5 flex items-center gap-4 border-t border-slate-300 bg-slate-100/95 px-5 py-4">
                    <button disabled={processing || !isDirty} className="btn-primary disabled:opacity-50">{processing ? 'Saving…' : 'Save page'}</button>
                    <span className="text-sm text-slate-500">{sw ? 'Saves the Kiswahili text for this page.' : 'Photos and links are shared by both languages.'}</span>
                </div>
            </form>
        </AdminLayout>
    );
}

/** How the page is likely to look in a Google result, with the recommended lengths. */
function SearchPreview({ url, site, title, description }: { url: string; site: string; title: string; description: string }) {
    const full = !title || title === site ? site : title.includes(site) ? title : `${title} | ${site}`;
    const desc = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const cut = (t: string, n: number) => (t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, '')}…` : t);
    const count = (n: number, lo: number, hi: number) => (
        <span className={n > hi ? 'text-amber-700' : n >= lo ? 'text-emerald-700' : 'text-slate-500'}>{n} characters</span>
    );
    return (
        <div className="border border-slate-200 bg-slate-50 p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Preview in Google</p>
            <div className="max-w-[600px] font-[arial,sans-serif]">
                <p className="truncate text-[13px] text-[#202124]">{url.replace(/^https?:\/\//, '')}</p>
                <p className="mt-0.5 text-[19px] leading-snug text-[#1a0dab]">{cut(full, 62)}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[#4d5156]">{cut(desc, 158) || 'No description yet.'}</p>
            </div>
            <p className="mt-3 flex flex-wrap gap-x-5 text-[12px]">
                <span>Title: {count(full.length, 30, 62)}</span>
                <span>Description: {count(desc.length, 70, 160)}</span>
            </p>
        </div>
    );
}
