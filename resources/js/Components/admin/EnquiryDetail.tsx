import { FormEvent, ReactNode, useEffect } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { confirmDanger, toast } from '@/lib/alerts';
import { cn } from '@/lib/utils';

export interface Enquiry {
    id: number; reference: string; student_name: string; gender: string | null; date_of_birth: string | null;
    current_school: string | null; class_applying: string | null; guardian_name: string; relationship: string | null;
    phone: string; email: string | null; address: string | null; heard_from: string | null; message: string | null;
    status: string; notes: string | null; created_at: string; status_changed_at: string | null;
}

/** A panel that slides in from the right over the page; Escape or a click outside closes it. */
export function SidePanel({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={label}>
            <button aria-label="Close" className="absolute inset-0 bg-navy-950/40" onClick={onClose} />
            <div className="relative h-full w-full max-w-lg overflow-y-auto bg-slate-50 shadow-2xl">{children}</div>
        </div>
    );
}

export const TONE: Record<string, string> = {
    New: 'bg-crest-200 text-navy-950',
    Contacted: 'bg-amber-100 text-amber-900',
    'Visit booked': 'bg-violet-100 text-violet-900',
    Admitted: 'bg-green-100 text-green-900',
    'Not admitted': 'bg-slate-200 text-slate-700',
    Withdrawn: 'bg-slate-200 text-slate-700',
};

export const when = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function EnquiryDetail({ e, statuses, onClose, fullPageLink }: { e: Enquiry; statuses: string[]; onClose: () => void; fullPageLink?: boolean }) {
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
                <div className="flex shrink-0 items-center gap-4 text-sm">
                    {fullPageLink && <Link href={route('admin.enquiries', { enquiry: e.id })} className="font-medium text-navy-800 hover:underline">Open in Enquiries</Link>}
                    <button onClick={onClose} className="text-slate-500 hover:underline">Close</button>
                </div>
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

