import { FormEvent, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { plainText } from '@/lib/site';
import AdminLayout from '@/Layouts/AdminLayout';
import Field, { FieldDef } from '@/Components/admin/Field';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/alerts';

interface Props {
    lang: 'en' | 'sw';
    groups: Record<string, FieldDef[]>;
    values: Record<string, string | null>;
    english: Record<string, string | null>;
    swDefaults: Record<string, string>;
}

export default function Settings({ lang, groups, values, english, swDefaults }: Props) {
    const tabs = Object.keys(groups);
    const [tab, setTab] = useState(tabs[0]);

    const initial: Record<string, any> = {};
    Object.values(groups).flat().forEach((f) => {
        initial[f.name] = f.type === 'image' ? null : values[f.name] ?? '';
        if (f.type === 'image') initial[`_remove_${f.name}`] = false;
    });
    initial._lang = lang;
    const { data, setData, post, processing, errors } = useForm(initial);
    const sw = lang === 'sw';
    const hint = (f: FieldDef) => {
        if (!sw) return f.help;
        const en = plainText(english[f.name]);
        const parts = [en && `English: ${en.length > 160 ? `${en.slice(0, 160)}…` : en}`, swDefaults[f.name] && `Built-in Kiswahili (used if left empty): ${swDefaults[f.name]}`];
        return parts.filter(Boolean).join('  ·  ') || undefined;
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'), { forceFormData: true, preserveScroll: true, onError: () => toast('error', 'Some fields need attention. Check each tab for messages in red.') });
    };

    return (
        <AdminLayout title={sw ? 'Site settings & text — Kiswahili' : 'Site settings & text'}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white px-4 py-3">
                <div className="flex gap-1" role="group" aria-label="Language">
                    <Link href={route('admin.settings')} className={cn('px-4 py-2 text-sm font-semibold', !sw ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>English</Link>
                    <Link href={route('admin.settings', { lang: 'sw' })} className={cn('px-4 py-2 text-sm font-semibold', sw ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>Kiswahili</Link>
                </div>
                <p className="text-sm text-slate-600">
                    {sw
                        ? 'Translate the text visitors see when they choose Kiswahili. Empty fields fall back to the built-in Kiswahili, then to English.'
                        : 'Photos, links and contacts are shared by both languages. Switch to Kiswahili to translate the text.'}
                </p>
            </div>
            <form onSubmit={submit}>
                <div className="mb-6 flex flex-wrap gap-1 border-b border-slate-300" role="tablist">
                    {tabs.map((t) => (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={t === tab}
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn('-mb-px border border-b-0 px-4 py-2.5 text-sm font-medium', t === tab ? 'border-slate-300 bg-white text-navy-900' : 'border-transparent text-slate-600 hover:text-navy-900')}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {tabs.map((t) => (
                    <div key={t} hidden={t !== tab} className="space-y-6 border border-slate-200 bg-white p-6 sm:p-8">
                        {groups[t].map((f) => (
                            <Field
                                key={f.name}
                                field={{ ...f, help: hint(f) }}
                                value={data[f.name]}
                                error={errors[f.name]}
                                existing={values[f.name]}
                                removed={data[`_remove_${f.name}`]}
                                onChange={(v) => setData(f.name, v)}
                                onRemove={(r) => setData(`_remove_${f.name}`, r)}
                            />
                        ))}
                    </div>
                ))}

                <div className="sticky bottom-0 -mx-5 mt-6 flex items-center gap-4 border-t border-slate-300 bg-slate-100/95 px-5 py-4">
                    <button disabled={processing} className="btn-primary disabled:opacity-60">{processing ? 'Saving…' : 'Save all changes'}</button>
                    <span className="text-sm text-slate-500">Saves every tab at once.</span>
                </div>
            </form>
        </AdminLayout>
    );
}
