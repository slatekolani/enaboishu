import { useCallback, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { EnquiryDetail, SidePanel, TONE, when, type Enquiry } from '@/Components/admin/EnquiryDetail';
import { cn } from '@/lib/utils';

interface Props {
    enquiries: { data: Enquiry[]; links: { url: string | null; label: string; active: boolean }[]; total: number };
    statuses: string[];
    counts: Record<string, number>;
    filters: { status: string | null; q: string; enquiry: number };
    opened: Enquiry | null; // the enquiry asked for in the address, even when it is not on this page of the list
}

export default function Enquiries({ enquiries, statuses, counts, filters, opened }: Props) {
    const [open, setOpen] = useState<number | null>(filters.enquiry || null);
    const close = useCallback(() => setOpen(null), []);
    const [q, setQ] = useState(filters.q);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const current = enquiries.data.find((e) => e.id === open) ?? (opened && opened.id === open ? opened : undefined);
    const go = (params: Record<string, string | null>) => router.get(route('admin.enquiries'), { ...filters, enquiry: null, ...params }, { preserveState: true, replace: true });

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
                    <SidePanel label={`Enquiry ${current.reference}`} onClose={close}>
                        <EnquiryDetail key={current.id + current.status + (current.notes ?? '')} e={current} statuses={statuses} onClose={close} />
                    </SidePanel>
                )}
            </div>
        </AdminLayout>
    );
}
