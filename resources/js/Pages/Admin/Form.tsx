import { FormEvent, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Field from '@/Components/admin/Field';
import GalleryField from '@/Components/admin/GalleryField';
import type { Resource } from './Index';
import { plainText } from '@/lib/site';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/alerts';

export default function Form({ resource, record }: { resource: Resource; record: Record<string, any> | null }) {
    const initial: Record<string, any> = {};
    resource.fields.forEach((f) => {
        if (f.type === 'gallery') {
            initial[`${f.name}_keep`] = (record?.[f.name] as string[] | null) ?? [];
            initial[`${f.name}_new`] = [];
        } else if (f.type === 'image' || f.type === 'file') {
            initial[f.name] = null;
            initial[`_remove_${f.name}`] = false;
        } else if (f.type === 'boolean') {
            initial[f.name] = record ? Boolean(record[f.name]) : Boolean(f.default ?? true);
        } else {
            initial[f.name] = record ? record[f.name] ?? '' : f.default ?? '';
        }
    });

    // Kiswahili versions of the fields marked as translatable.
    const translatable = resource.fields.filter((f) => f.translate);
    const sw: Record<string, string> = {};
    translatable.forEach((f) => (sw[f.name] = record?.translations?.sw?.[f.name] ?? ''));
    initial.translations = { sw };

    const [lang, setLang] = useState<'en' | 'sw'>('en');
    const { data, setData, post, processing, errors } = useForm(initial);
    const setSw = (name: string, value: string) => setData('translations', { sw: { ...data.translations.sw, [name]: value } });
    const swErrors = Object.keys(errors).some((k) => k.startsWith('translations.'));

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const url = record ? route('admin.resource.update', [resource.key, record.id]) : route('admin.resource.store', resource.key);
        post(url, {
            forceFormData: true,
            onError: (errs) => toast('error', Object.keys(errs).some((k) => k.startsWith('translations.')) ? 'Please fix the highlighted fields (check the Kiswahili tab too).' : 'Please fix the highlighted fields.'),
        });
    };

    return (
        <AdminLayout title={`${record ? 'Edit' : 'Add'} ${resource.singular}`}>
            <form onSubmit={submit} className="border border-slate-200 bg-white">
                {translatable.length > 0 && (
                    <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-4 pt-3" role="tablist" aria-label="Language">
                        {(['en', 'sw'] as const).map((l) => (
                            <button
                                key={l}
                                type="button"
                                role="tab"
                                aria-selected={lang === l}
                                onClick={() => setLang(l)}
                                className={cn('-mb-px border border-b-0 px-4 py-2 text-sm font-medium', lang === l ? 'border-slate-200 bg-white text-navy-900' : 'border-transparent text-slate-600 hover:text-navy-900', l === 'sw' && swErrors && 'text-red-700')}
                            >
                                {l === 'en' ? 'English' : 'Kiswahili'}
                                {l === 'sw' && <span className="ml-2 text-xs text-slate-500">{Object.values(data.translations.sw as Record<string, string>).filter(Boolean).length}/{translatable.length}</span>}
                            </button>
                        ))}
                    </div>
                )}

                <div hidden={lang !== 'sw'} className="space-y-6 p-6 sm:p-8">
                    <p className="border-l-4 border-crest-400 bg-crest-50 px-4 py-3 text-sm text-slate-700">
                        Write the Kiswahili version of the text below. Anything left empty is shown in English to visitors who choose Kiswahili. Photos, dates and links are shared by both languages.
                    </p>
                    {translatable.map((f) => {
                        const english = plainText(String(data[f.name] ?? ''));
                        return (
                            <Field
                                key={`sw-${f.name}`}
                                field={{ ...f, name: `sw_${f.name}`, label: `${f.label} (Kiswahili)`, help: english ? `English: ${english.length > 160 ? `${english.slice(0, 160)}…` : english}` : undefined }}
                                value={data.translations.sw[f.name]}
                                error={errors[`translations.sw.${f.name}` as keyof typeof errors]}
                                onChange={(v) => setSw(f.name, String(v ?? ''))}
                            />
                        );
                    })}
                </div>

                <div hidden={lang !== 'en'} className="space-y-6 p-6 sm:p-8">
                {resource.fields.map((f) => f.type === 'gallery' ? (
                    <div key={f.name}>
                        <span className="mb-1.5 block text-sm font-semibold text-slate-800">{f.label}</span>
                        <GalleryField
                            id={`f-${f.name}`}
                            keep={data[`${f.name}_keep`]}
                            added={data[`${f.name}_new`]}
                            onKeep={(v) => setData(`${f.name}_keep`, v)}
                            onAdd={(v) => setData(`${f.name}_new`, v)}
                        />
                        {f.help && <p className="mt-1.5 text-[13px] text-slate-500">{f.help}</p>}
                        {Object.entries(errors).filter(([k]) => k.startsWith(`${f.name}_`)).map(([k, m]) => <p key={k} className="mt-1 text-sm text-red-700">{m}</p>)}
                    </div>
                ) : (
                    <Field
                        key={f.name}
                        field={f}
                        value={data[f.name]}
                        error={errors[f.name]}
                        existing={record?.[f.name]}
                        removed={data[`_remove_${f.name}`]}
                        onChange={(v) => setData(f.name, v)}
                        onRemove={(r) => setData(`_remove_${f.name}`, r)}
                    />
                ))}
                </div>
                <div className="flex items-center gap-4 border-t border-slate-200 px-6 py-5 sm:px-8">
                    <button disabled={processing} className="btn-primary disabled:opacity-60">{processing ? 'Saving…' : 'Save'}</button>
                    <Link href={route('admin.resource.index', resource.key)} className="text-slate-600 hover:underline">Cancel</Link>
                </div>
            </form>
        </AdminLayout>
    );
}
