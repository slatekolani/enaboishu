import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface Entry { id: number; description: string; event: string | null; who: string; fields: string[]; resource: string | null; at: string }
interface Props {
    activities: { data: Entry[]; links: { url: string | null; label: string; active: boolean }[] };
    users: { id: number; name: string }[];
    filters: { user: number | null };
}

const DOT: Record<string, string> = { created: 'bg-green-600', deleted: 'bg-red-600', exported: 'bg-violet-600', updated: 'bg-crest-600' };

export default function History({ activities, users, filters }: Props) {
    return (
        <AdminLayout title="Change history">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-slate-600">Every change made in the admin panel: who, what and when. Kept for one year.</p>
                <select
                    value={filters.user ?? ''}
                    onChange={(e) => router.get(route('admin.history'), e.target.value ? { user: e.target.value } : {}, { preserveState: true, replace: true })}
                    className="border-slate-300 text-sm focus:border-navy-800 focus:ring-navy-800"
                    aria-label="Filter by person"
                >
                    <option value="">Everyone</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>
            <ol className="divide-y divide-slate-100 border border-slate-200 bg-white">
                {activities.data.length === 0 && <li className="p-8 text-center text-slate-500">No changes recorded yet.</li>}
                {activities.data.map((a) => (
                    <li key={a.id} className="flex gap-4 px-5 py-3.5">
                        <span className={cn('mt-2 h-2 w-2 shrink-0 rounded-full', DOT[a.event ?? 'updated'] ?? DOT.updated)} aria-hidden />
                        <div className="min-w-0 flex-1">
                            <p className="text-[15px] text-slate-900"><span className="font-semibold">{a.who}</span> · {a.description}</p>
                            {a.fields.length > 0 && <p className="mt-0.5 text-sm text-slate-500">Changed: {a.fields.join(', ')}</p>}
                        </div>
                        <time className="shrink-0 text-sm text-slate-400" dateTime={a.at}>
                            {new Date(a.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </time>
                    </li>
                ))}
            </ol>
            {activities.links.length > 3 && (
                <nav className="mt-4 flex flex-wrap gap-1">
                    {activities.links.map((l, i) => l.url
                        ? <Link key={i} href={l.url} preserveState className={cn('border px-3 py-1 text-sm', l.active ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white')} dangerouslySetInnerHTML={{ __html: l.label }} />
                        : <span key={i} className="border border-slate-200 px-3 py-1 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: l.label }} />)}
                </nav>
            )}
        </AdminLayout>
    );
}
