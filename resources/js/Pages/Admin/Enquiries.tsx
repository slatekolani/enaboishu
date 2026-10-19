import { FormEvent, useEffect, useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { confirmDanger, toast } from '@/lib/alerts';
import { cn } from '@/lib/utils';

interface Enquiry {
    id: number; reference: string; student_name: string; gender: string | null; date_of_birth: string | null;
    current_school: string | null; class_applying: string | null; guardian_name: string; relationship: string | null;
    phone: string; email: string | null; address: string | null; heard_from: string | null; message: string | null;
    status: string; notes: string | null; created_at: string; status_changed_at: string | null;
}
interface Props {
    enquiries: { data: Enquiry[]; links: { url: string | null; label: string; active: boolean }[]; total: number };
    statuses: string[];
    counts: Record<string, number>;
    filters: { status: string | null; q: string; open: number };
}

const TONE: Record<string, string> = {
    New: 'bg-crest-200 text-navy-950',
    Contacted: 'bg-amber-100 text-amber-900',
    'Visit booked': 'bg-violet-100 text-violet-900',
    Admitted: 'bg-green-100 text-green-900',
    'Not admitted': 'bg-slate-200 text-slate-700',
    Withdrawn: 'bg-slate-200 text-slate-700',
};

const when = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function Detail({ e, statuses, onClose }: { e: Enquiry; statuses: string[]; onClose: () => void }) {
    const { data, setData, patch, processing, isDirty } = useForm({ status: e.status, notes: e.notes ?? '' });
    const save = (ev: FormEvent) => {
        ev.preventDefault();
        patch(route('admin.enquiries.update', e.id), { preserveScroll: true, onError: () => toast('error', 'Could not save. Please check the status and notes.') });
    };
    const phoneDigits = e.phone.replace(/[^\d+]/g, '');
    const waDigits = phoneDigits.replace(/^\+/, '').replace(/^0/, '255');
    const rows: [string, string | null][] = [
        ['Class applying for', e.class_applying], ['Gender', e.gender], ['Date of birth', e.date_of_birth?.slice(0, 10) ?? null],
        ['Current school', e.current_school], ['Parent / guardian', `${e.guardian_name}${e.relationship ? ` (${e.relationship})` : ''}`],
        ['Phone', e.phone], ['Email', e.email], ['Home area', e.address], ['Heard about us from', e.heard_from],
    ];

    return (
        <aside className="min-h-full bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                <div>
                    <p className="font-mono text-sm text-slate-500">{e.reference}</p>
                    <h2 className="font-sans text-xl font-semibold text-slate-900">{e.student_name}</h2>
                    <p className="text-sm text-slate-500">Received {when(e.created_at)}</p>
                </div>
                <button onClick={onClose} className="text-sm text-slate-500 hover:underline">Close</button>
            </div>
            <dl className="divide-y divide-slate-100 px-6 text-[15px]">
                {rows.filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-3 gap-3 py-2.5">
                        <dt className="text-slate-500">{k}</dt>
                        <dd className="col-span-2 text-slate-900">{v}</dd>
                    </div>
                ))}
            </dl>
            {e.message && <p className="mx-6 my-3 whitespace-pre-line border-l-4 border-crest-300 bg-crest-50 px-4 py-3 text-[15px] text-slate-800">{e.message}</p>}
            <div className="flex flex-wrap gap-2 px-6 py-3">
                <a href={`tel:${phoneDigits}`} className="btn-outline !px-4 !py-2">Call</a>
                <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noreferrer" className="btn-outline !px-4 !py-2">WhatsApp</a>
                {e.email && <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Your admission enquiry ${e.reference}`)}`} className="btn-outline !px-4 !py-2">Email</a>}
            </div>
            <form onSubmit={save} className="space-y-4 border-t border-slate-200 px-6 py-5">
                <div>
                    <span className="mb-2 block text-sm font-semibold text-slate-800">Status</span>
                    <div className="flex flex-wrap gap-2">
                        {statuses.map((s) => (
                            <button key={s} type="button" onClick={() => setData('status', s)} aria-pressed={data.status === s}
                                className={cn('border px-3 py-1.5 text-sm', data.status === s ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 hover:border-navy-900')}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="notes" className="mb-1.5 block text-sm font-semibold text-slate-800">Office notes (private)</label>
                    <textarea id="notes" rows={4} value={data.notes} onChange={(ev) => setData('notes', ev.target.value)} className="w-full border-slate-300 text-[15px] focus:border-navy-800 focus:ring-navy-800" placeholder="e.g. Called 14 Oct, visit booked for Friday 10 am" />
                </div>
                <div className="flex items-center justify-between">
                    <button disabled={processing || !isDirty} className="btn-primary !py-2 disabled:opacity-50">Save</button>
                    <button type="button" onClick={async () => (await confirmDanger({ title: `Delete enquiry ${e.reference}?`, text: `The enquiry for ${e.student_name} and all office notes will be deleted permanently.` })) && router.delete(route('admin.enquiries.destroy', e.id))} className="text-sm text-red-700 hover:underline">Delete</button>
                </div>
            </form>
        </aside>
    );
}

export default function Enquiries({ enquiries, statuses, counts, filters }: Props) {
    const [open, setOpen] = useState<number | null>(filters.open || null);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    const [q, setQ] = useState(filters.q);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const current = enquiries.data.find((e) => e.id === open);
    const go = (params: Record<string, string | null>) => router.get(route('admin.enquiries'), { ...filters, open: null, ...params }, { preserveState: true, replace: true });

    return (
        <AdminLayout
            title="Admission enquiries"
            actions={<a href={route('admin.enquiries.export', filters.status ? { status: filters.status } : {})} className="btn-outline !py-2">Export to spreadsheet</a>}
        >
            <div className="mb-5 flex flex-wrap gap-1 border-b border-slate-300">
                {[null, ...statuses].map((s) => (
                    <button key={s ?? 'all'} onClick={() => go({ status: s })}
                        className={cn('-mb-px border border-b-0 px-4 py-2 text-sm font-medium', filters.status === s ? 'border-slate-300 bg-white text-navy-900' : 'border-transparent text-slate-600 hover:text-navy-900')}>
                        {s ?? 'All'} <span className="ml-1 text-xs text-slate-500">{s ? counts[s] ?? 0 : total}</span>
                    </button>
                ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); go({ q }); }} className="mb-5 flex gap-2">
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by reference, student, parent or phone" className="w-full max-w-md border-slate-300 text-[15px] focus:border-navy-800 focus:ring-navy-800" />
                <button className="btn-outline !py-2">Search</button>
            </form>

            <div>
                <div className="overflow-x-auto border border-slate-200 bg-white">
                    <table className="w-full text-left text-[15px]">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                            <tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Parent / phone</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Received</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {enquiries.data.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No enquiries here yet. Parents apply at <span className="font-mono">/apply</span> on the website.</td></tr>}
                            {enquiries.data.map((e) => (
                                <tr key={e.id} onClick={() => setOpen(e.id)} className={cn('cursor-pointer hover:bg-slate-50', open === e.id && 'bg-crest-50', e.status === 'New' && 'font-semibold')}>
                                    <td className="px-4 py-3 font-mono text-sm">{e.reference}</td>
                                    <td className="px-4 py-3">{e.student_name}</td>
                                    <td className="px-4 py-3">{e.class_applying}</td>
                                    <td className="px-4 py-3 font-normal">{e.guardian_name}<div className="text-sm text-slate-500">{e.phone}</div></td>
                                    <td className="px-4 py-3"><span className={cn('px-2 py-0.5 text-xs font-semibold', TONE[e.status])}>{e.status}</span></td>
                                    <td className="whitespace-nowrap px-4 py-3 font-normal text-slate-500">{when(e.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {enquiries.links.length > 3 && (
                        <nav className="flex flex-wrap gap-1 border-t border-slate-200 p-3">
                            {enquiries.links.map((l, i) => l.url
                                ? <Link key={i} href={l.url} preserveState className={cn('border px-3 py-1 text-sm', l.active ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300')} dangerouslySetInnerHTML={{ __html: l.label }} />
                                : <span key={i} className="border border-slate-200 px-3 py-1 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: l.label }} />)}
                        </nav>
                    )}
                </div>
                {current && (
                    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Enquiry ${current.reference}`}>
                        <button aria-label="Close" className="absolute inset-0 bg-navy-950/40" onClick={() => setOpen(null)} />
                        <div className="relative h-full w-full max-w-lg overflow-y-auto bg-slate-50 shadow-2xl">
                            <Detail key={current.id + current.status + (current.notes ?? '')} e={current} statuses={statuses} onClose={() => setOpen(null)} />
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
