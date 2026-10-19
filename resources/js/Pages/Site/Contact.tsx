import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { notify } from '@/lib/alerts';
import SiteLayout from '@/Layouts/SiteLayout';
import { PageBanner } from '@/Components/site/Parts';
import { lines, useSite } from '@/lib/site';
import type { SharedProps } from '@/types/cms';

const input = 'w-full border-rule bg-white px-4 py-3 text-base focus:border-navy-800 focus:ring-navy-800';

export default function Contact() {
    const site = useSite();
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', email: '', phone: '', subject: '', body: '', website: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('contact.send'), { preserveScroll: true, onSuccess: () => reset(), onError: () => notify('warning', site.alert_check_title ?? '', site.alert_check_text, site.alert_ok ?? 'OK') });
    };

    const field = (name: 'name' | 'email' | 'phone' | 'subject', label: string, type = 'text', required = false) => (
        <div>
            <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-navy-900">{label}{required && <span className="text-crest-700"> *</span>}</label>
            <input id={name} type={type} required={required} value={data[name]} onChange={(e) => setData(name, e.target.value)} className={input} />
            {errors[name] && <p className="mt-1 text-sm text-red-700">{errors[name]}</p>}
        </div>
    );

    return (
        <SiteLayout title={site.contact_title ?? ''}>
            <PageBanner title={site.contact_title ?? ''} crumb={site.nav_contact ?? ''} intro={site.contact_intro} page="contact" />

            <div className="py-16 sm:py-20">
                <div className="container-site grid gap-14 lg:grid-cols-12">
                    <form onSubmit={submit} className="space-y-5 lg:col-span-7" data-reveal="left">
                        {site.form_title && <h2 className="text-[2rem]">{site.form_title}</h2>}
                        <div className="grid gap-5 sm:grid-cols-2">
                            {field('name', site.form_name ?? '', 'text', true)}
                            {field('email', site.form_email ?? '', 'email', true)}
                            {field('phone', site.form_phone ?? '', 'tel')}
                            {field('subject', site.form_subject ?? '')}
                        </div>
                        <div>
                            <label htmlFor="body" className="mb-1.5 block text-sm font-semibold text-navy-900">{site.form_message} <span className="text-crest-700">*</span></label>
                            <textarea id="body" rows={7} required value={data.body} onChange={(e) => setData('body', e.target.value)} className={input} />
                            {errors.body && <p className="mt-1 text-sm text-red-700">{errors.body}</p>}
                        </div>
                        {/* Honeypot: hidden from people, tempting to bots */}
                        <div className="hidden" aria-hidden>
                            <label>Leave blank<input tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => setData('website', e.target.value)} /></label>
                        </div>
                        <button disabled={processing} className="btn-primary disabled:opacity-60">{processing ? site.form_sending : site.form_button}</button>
                    </form>

                    <aside className="space-y-8 lg:col-span-5" data-reveal="right">
                        <div>
                            {site.office_title && <h2 className="text-[2rem]">{site.office_title}</h2>}
                            <address className="mt-4 space-y-1 not-italic text-slate-700">
                                {lines(site.address).map((l) => <div key={l}>{l}</div>)}
                                {site.po_box && <div>{site.po_box}</div>}
                            </address>
                            <dl className="mt-4 space-y-1 text-slate-700">
                                {site.phone && <div><dt className="inline font-semibold text-navy-900">{site.phone_label}: </dt><dd className="inline"><a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-crest-700">{site.phone}</a></dd></div>}
                                {site.phone_alt && <div><dt className="inline font-semibold text-navy-900">{site.phone_label}: </dt><dd className="inline">{site.phone_alt}</dd></div>}
                                {site.email && <div><dt className="inline font-semibold text-navy-900">{site.email_label}: </dt><dd className="inline"><a href={`mailto:${site.email}`} className="hover:text-crest-700">{site.email}</a></dd></div>}
                            </dl>
                        </div>
                        {site.office_hours && (
                            <div>
                                {site.hours_title && <h2 className="text-2xl">{site.hours_title}</h2>}
                                <div className="mt-3 space-y-1 text-slate-700">{lines(site.office_hours).map((l) => <div key={l}>{l}</div>)}</div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {site.map_url && (
                <iframe title={`${site.site_name} — ${site.footer_col_address || site.office_title || ""}`} src={site.map_url} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="block h-96 w-full border-0 border-t border-rule" />
            )}
        </SiteLayout>
    );
}
