import { FormEvent, useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Ornament, PageBanner } from '@/Components/site/Parts';
import { useSite } from '@/lib/site';
import { notify } from '@/lib/alerts';

const input = 'w-full border-rule bg-white px-4 py-3 text-base focus:border-navy-900 focus:ring-navy-900';
const CLASSES = ['Form I', 'Form II', 'Form III', 'Form IV', 'Form V', 'Form VI'];

type Key = 'student_name' | 'gender' | 'date_of_birth' | 'current_school' | 'class_applying' | 'guardian_name' | 'relationship' | 'phone' | 'email' | 'address' | 'heard_from' | 'message';

export default function Apply({ reference }: { reference: string | null }) {
    const site = useSite();
    const { data, setData, post, processing, errors } = useForm({
        student_name: '', gender: '', date_of_birth: '', current_school: '', class_applying: '', guardian_name: '', relationship: '',
        phone: '', email: '', address: '', heard_from: '', message: '', consent: false, website: '',
    });

    // Confirm the enquiry with a pop-up showing the reference number.
    useEffect(() => {
        if (reference) notify('success', site.alert_thanks ?? '', `${site.alert_reference} ${reference}.`, site.alert_ok ?? 'OK');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reference]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('apply.submit'), { preserveScroll: true, onError: () => { notify('warning', site.alert_check_title ?? '', site.alert_check_text, site.alert_ok ?? 'OK').then(() => document.querySelector('[data-error]')?.scrollIntoView({ block: 'center' })); } });
    };

    const label = (k: Key, text: string | null | undefined, required = false) => (
        <label htmlFor={`ap-${k}`} className="mb-1.5 block text-sm font-semibold text-navy-900">{text}{required && <span className="text-crest-700"> *</span>}</label>
    );
    const error = (k: Key | 'consent') => errors[k] && <p data-error className="mt-1 text-sm text-red-700">{errors[k]}</p>;
    const field = (k: Key, text: string | null | undefined, type = 'text', required = false, extra: Record<string, unknown> = {}) => (
        <div>
            {label(k, text, required)}
            <input id={`ap-${k}`} type={type} required={required} value={data[k]} onChange={(e) => setData(k, e.target.value)} className={input} {...extra} />
            {error(k)}
        </div>
    );
    const section = (n: number, title: string | null | undefined) => (
        <legend className="mb-6 flex w-full items-center gap-4">
            <span className="font-serif text-2xl italic text-brass">{['I', 'II', 'III'][n]}.</span>
            <span className="font-serif text-[1.8rem] font-semibold text-navy-900">{title}</span>
            <span className="h-px flex-1 bg-rule" />
        </legend>
    );

    return (
        <SiteLayout title={site.apply_title ?? ''}>
            <PageBanner title={site.apply_title ?? ''} crumb={site.nav_apply ?? ''} intro={site.apply_intro} page="apply" />

            <div className="py-16 sm:py-20">
                <div className="container-site max-w-4xl">
                    {reference ? (
                        <div role="status" className="border-t-[3px] border-navy-900 bg-white px-6 py-14 text-center sm:px-14" data-reveal="zoom">
                            <svg width="56" height="56" viewBox="0 0 24 24" className="mx-auto text-crest-600" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M7 12.5l3.2 3.2L17 9" /></svg>
                            <h2 className="mt-6 text-[2.2rem] leading-tight">{site.apply_success_title}</h2>
                            <p className="eyebrow mt-8">{site.apply_success_ref}</p>
                            <p className="mt-2 font-mono text-3xl font-semibold tracking-wider text-navy-900">{reference}</p>
                            <Ornament className="mx-auto mt-8 text-brass" width="w-28" />
                            <p className="mx-auto mt-6 max-w-lg leading-relaxed text-slate-600">{site.apply_success_text}</p>
                            <div className="mt-10 flex flex-wrap justify-center gap-3">
                                <Link href={route('home')} className="btn-primary">{site.nav_home}</Link>
                                <Link href={route('downloads')} className="btn-outline">{site.nav_downloads}</Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-12 border border-rule bg-white p-6 sm:p-12" data-reveal>
                            <fieldset className="grid gap-5 sm:grid-cols-2">
                                {section(0, site.apply_student_heading)}
                                <div className="sm:col-span-2">{field('student_name', site.apply_f_student, 'text', true, { autoComplete: 'off' })}</div>
                                <div>
                                    {label('class_applying', site.apply_f_class, true)}
                                    <select id="ap-class_applying" required value={data.class_applying} onChange={(e) => setData('class_applying', e.target.value)} className={input}>
                                        <option value="">{site.apply_select}</option>
                                        {CLASSES.map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                    {error('class_applying')}
                                </div>
                                <div>
                                    {label('gender', site.apply_f_gender)}
                                    <select id="ap-gender" value={data.gender} onChange={(e) => setData('gender', e.target.value)} className={input}>
                                        <option value="">{site.apply_select}</option>
                                        <option value="Female">{site.apply_f_female}</option>
                                        <option value="Male">{site.apply_f_male}</option>
                                    </select>
                                </div>
                                {field('date_of_birth', site.apply_f_dob, 'date', false, { max: new Date().toISOString().slice(0, 10) })}
                                {field('current_school', site.apply_f_school)}
                            </fieldset>

                            <fieldset className="grid gap-5 sm:grid-cols-2">
                                {section(1, site.apply_guardian_heading)}
                                {field('guardian_name', site.apply_f_guardian, 'text', true, { autoComplete: 'name' })}
                                {field('relationship', site.apply_f_relationship)}
                                {field('phone', site.apply_f_phone, 'tel', true, { autoComplete: 'tel', inputMode: 'tel', placeholder: '07XX XXX XXX' })}
                                {field('email', site.apply_f_email, 'email', false, { autoComplete: 'email' })}
                                <div className="sm:col-span-2">{field('address', site.apply_f_address)}</div>
                            </fieldset>

                            <fieldset className="grid gap-5">
                                {section(2, site.apply_more_heading)}
                                {field('heard_from', site.apply_f_heard)}
                                <div>
                                    {label('message', site.apply_f_message)}
                                    <textarea id="ap-message" rows={5} value={data.message} onChange={(e) => setData('message', e.target.value)} className={input} />
                                    {error('message')}
                                </div>
                                <label className="flex items-start gap-3 text-[15px] text-slate-700">
                                    <input type="checkbox" required checked={data.consent} onChange={(e) => setData('consent', e.target.checked)} className="mt-1 h-5 w-5 border-slate-400 text-navy-900 focus:ring-navy-900" />
                                    <span>{site.apply_f_consent} <span className="text-crest-700">*</span></span>
                                </label>
                                {error('consent')}
                            </fieldset>

                            <div className="hidden" aria-hidden><label>Leave blank<input tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => setData('website', e.target.value)} /></label></div>
                            <button disabled={processing} className="btn-primary w-full disabled:opacity-60 sm:w-auto">{processing ? site.form_sending : site.apply_f_submit}</button>
                        </form>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
}
