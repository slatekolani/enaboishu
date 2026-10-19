import { FormEvent } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/alerts';

interface Log { id: number; channel: string; audience: string; event: string; reference: string | null; to: string; subject: string | null; body: string | null; status: string; error: string | null; created_at: string }
interface Props {
    mail: { driver: string; from: string | null; host: string | null };
    recipients: { id: number; name: string; title: string | null; email: string | null }[];
    logs: { data: Log[]; links: { url: string | null; label: string; active: boolean }[] };
    today: { email: number; problems: number };
    filters: { status: string | null };
}

const STATUS: Record<string, string> = {
    sent: 'bg-crest-200 text-navy-950', logged: 'bg-slate-200 text-slate-700', pending: 'bg-amber-100 text-amber-900',
    skipped: 'bg-amber-100 text-amber-900', failed: 'bg-red-100 text-red-900',
};
const WHO: Record<string, string> = { sender: 'Confirmation to sender', staff: 'Staff alert', test: 'Test' };
const EVENT: Record<string, string> = { enquiry: 'Admission enquiry', message: 'Contact message', alumni: 'Alumni sign-up', test: 'Test' };

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <section className={cn('border border-slate-200 bg-white p-5', className)}>
            <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
            {children}
        </section>
    );
}

function TestForm() {
    const { data, setData, post, processing, errors } = useForm({ to: '' });
    const submit = (e: FormEvent) => { e.preventDefault(); post(route('admin.notifications.test'), { preserveScroll: true, onError: () => toast('error', 'Please enter a valid email address.') }); };
    return (
        <form onSubmit={submit} className="mt-4">
            <label className="mb-1 block text-sm text-slate-600">Send a test email to</label>
            <div className="flex gap-2">
                <input value={data.to} onChange={(e) => setData('to', e.target.value)} type="email" required placeholder="you@example.com"
                    className="w-full border-slate-300 text-[15px] focus:border-navy-800 focus:ring-navy-800" />
                <button disabled={processing} className="btn-outline whitespace-nowrap !px-4 !py-2 disabled:opacity-50">{processing ? 'Sending…' : 'Send test'}</button>
            </div>
            {errors.to && <p className="mt-1 text-sm text-red-700">{errors.to}</p>}
        </form>
    );
}

export default function Notifications({ mail, recipients, logs, today, filters }: Props) {
    const filter = (params: Record<string, string | null>) => router.get(route('admin.notifications'), { ...filters, ...params }, { preserveState: true, preserveScroll: true, replace: true });
    const people = recipients.filter((r) => r.email).length;

    return (
        <AdminLayout title="Email notifications">
            <p className="-mt-2 mb-6 max-w-3xl text-slate-600">
                When someone submits an admission enquiry, a message or an alumni sign-up, they receive a confirmation email, and the
                people in <Link href={route('admin.resource.index', 'recipients')} className="font-semibold text-navy-800 underline">Notification recipients</Link> are alerted by email.
                Edit the wording under <Link href={route('admin.settings')} className="font-semibold text-navy-800 underline">Site settings → Notification messages</Link>.
            </p>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="School mail account" className="lg:col-span-2">
                    <dl className="space-y-1 text-[15px]">
                        <div className="flex justify-between gap-3"><dt className="text-slate-500">Sending as</dt><dd className="truncate font-semibold">{mail.from}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-slate-500">Mail server</dt><dd className="truncate font-semibold">{mail.driver === 'smtp' ? mail.host : '—'}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">Method</dt><dd className="font-semibold">{mail.driver === 'log' ? 'Log file only (not delivered)' : mail.driver.toUpperCase()}</dd></div>
                    </dl>
                    {mail.driver === 'log' && <p className="mt-2 text-sm text-amber-900">Emails are written to storage/logs/laravel.log. Set the school's mail account in .env to deliver them.</p>}
                    <TestForm />
                </Card>
                <Card title="Today">
                    <dl className="grid grid-cols-2 gap-2 text-center">
                        <div><dd className="text-3xl font-bold text-navy-900">{today.email}</dd><dt className="text-xs text-slate-500">Emails sent</dt></div>
                        <div><dd className={cn('text-3xl font-bold', today.problems ? 'text-red-700' : 'text-navy-900')}>{today.problems}</dd><dt className="text-xs text-slate-500">Failed</dt></div>
                    </dl>
                    <p className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-600">
                        Alerts go to {people} {people === 1 ? 'person' : 'people'}.{' '}
                        <Link href={route('admin.resource.create', 'recipients')} className="font-medium text-navy-800 hover:underline">Add someone</Link>
                    </p>
                    {people === 0 && <p className="mt-2 text-sm font-semibold text-amber-900">No one is set up to receive alerts yet.</p>}
                </Card>
            </div>

            <section className="mt-10">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-sans text-base font-semibold text-slate-900">Delivery log</h2>
                    <button onClick={() => filter({ status: filters.status ? null : 'problems' })} className={cn('border px-3 py-1 text-sm', filters.status ? 'border-red-700 bg-red-700 text-white' : 'border-slate-300 bg-white')}>Problems only</button>
                </div>
                <div className="overflow-x-auto border border-slate-200 bg-white">
                    <table className="w-full text-left text-[14.5px]">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                            <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">To</th><th className="px-4 py-3">Message</th><th className="px-4 py-3">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.data.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Nothing sent yet.</td></tr>}
                            {logs.data.map((l) => (
                                <tr key={l.id} className="align-top">
                                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(l.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-700">{EVENT[l.event] ?? l.event}</div>
                                        <div className="text-xs text-slate-500">{WHO[l.audience] ?? l.audience}{l.reference ? ` · ${l.reference}` : ''}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[13px]">{l.to}</td>
                                    <td className="max-w-md px-4 py-3 text-slate-700">
                                        {l.subject && <div className="font-medium">{l.subject}</div>}
                                        {l.body && <div className="line-clamp-2 text-[13.5px] text-slate-600">{l.body}</div>}
                                        {l.error && <div className="mt-1 text-[13px] text-red-700">{l.error}</div>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn('px-2 py-0.5 text-xs font-semibold capitalize', STATUS[l.status] ?? 'bg-slate-200')}>{l.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {logs.links.length > 3 && (
                    <nav className="mt-3 flex flex-wrap gap-1">
                        {logs.links.map((l, i) => l.url
                            ? <Link key={i} href={l.url} preserveState preserveScroll className={cn('border px-3 py-1 text-sm', l.active ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white')} dangerouslySetInnerHTML={{ __html: l.label }} />
                            : <span key={i} className="border border-slate-200 px-3 py-1 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: l.label }} />)}
                    </nav>
                )}
            </section>
        </AdminLayout>
    );
}
