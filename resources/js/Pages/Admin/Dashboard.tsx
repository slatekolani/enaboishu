import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface Figure { label: string; value: number; url: string; note: string }
interface Item { key: string; label: string; count: number; updated: string | null; url: string; create: string }

interface Props {
    isAdmin: boolean;
    firstName: string;
    figures: Figure[];
    trend: { label: string; count: number }[];
    statuses: { status: string; count: number }[];
    enquiries: { id: number; reference: string; student_name: string; class_applying: string | null; status: string; created_at: string }[];
    messages: { id: number; name: string; subject: string | null; created_at: string; read_at: string | null }[];
    events: { id: number; title: string; starts_at: string; location: string | null }[];
    activity: { id: number; who: string; event: string | null; description: string; area: string | null; at: string }[];
    groups: { group: string; items: Item[] }[];
}

const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

function ago(iso: string | null) {
    if (!iso) return 'Never';
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return 'Just now';
    const units: [number, string][] = [[31536000, 'year'], [2592000, 'month'], [604800, 'week'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
    for (const [secs, name] of units) {
        const n = Math.floor(s / secs);
        if (n >= 1) return `${n} ${name}${n > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const STATUS_TONE: Record<string, string> = {
    New: 'bg-crest-100 text-navy-900',
    Contacted: 'bg-slate-100 text-slate-700',
    'Visit booked': 'bg-amber-50 text-amber-800',
    Admitted: 'bg-emerald-50 text-emerald-800',
    'Not admitted': 'bg-slate-100 text-slate-500',
    Withdrawn: 'bg-slate-100 text-slate-500',
};

function Panel({ title, action, children, className }: { title: string; action?: { label: string; href: string }; children: ReactNode; className?: string }) {
    return (
        <section className={cn('border border-slate-200 bg-white', className)}>
            <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5">
                <h2 className="font-sans text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-700">{title}</h2>
                {action && <Link href={action.href} className="text-[13px] font-medium text-navy-800 hover:underline">{action.label} →</Link>}
            </header>
            {children}
        </section>
    );
}

const Empty = ({ children }: { children: ReactNode }) => <p className="px-5 py-8 text-center text-sm text-slate-500">{children}</p>;

function TrendChart({ trend }: { trend: Props['trend'] }) {
    const max = Math.max(1, ...trend.map((t) => t.count));
    const total = trend.reduce((a, t) => a + t.count, 0);
    return (
        <div className="px-5 pb-5 pt-4">
            <p className="text-sm text-slate-500"><span className="font-serif text-3xl font-semibold text-navy-900">{total}</span> enquiries in the last 8 weeks</p>
            <div className="mt-5 flex h-40 items-end gap-2" role="img" aria-label={trend.map((t) => `Week of ${t.label}: ${t.count}`).join(', ')}>
                {trend.map((t, i) => (
                    <div key={t.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                        <span className="text-[12px] font-semibold tabular-nums text-slate-600">{t.count}</span>
                        <div
                            className={cn('w-full max-w-[2.75rem] rounded-t-[3px]', i === trend.length - 1 ? 'bg-brass' : 'bg-navy-800')}
                            style={{ height: `${Math.max(t.count ? 6 : 2, (t.count / max) * 100)}%`, opacity: t.count ? 1 : 0.25 }}
                        />
                    </div>
                ))}
            </div>
            <div className="mt-2 flex gap-2 border-t border-slate-200 pt-2">
                {trend.map((t, i) => (
                    <span key={t.label} className={cn('flex-1 text-center text-[11px] tabular-nums', i === trend.length - 1 ? 'font-semibold text-slate-700' : 'text-slate-400')}>
                        {i === trend.length - 1 ? 'This week' : t.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

function Statuses({ statuses, className }: { statuses: Props['statuses']; className?: string }) {
    const total = statuses.reduce((a, s) => a + s.count, 0);
    return (
        <ul className={cn('divide-y divide-slate-100', className)}>
            {statuses.map((s) => (
                <li key={s.status}>
                    <Link href={route('admin.enquiries', { status: s.status })} className="flex items-center gap-4 px-5 py-2.5 text-sm hover:bg-slate-50">
                        <span className="w-28 shrink-0 text-slate-600">{s.status}</span>
                        <span className="h-1.5 flex-1 bg-slate-100">
                            <span className="block h-full bg-navy-800" style={{ width: `${total ? (s.count / total) * 100 : 0}%` }} />
                        </span>
                        <span className="w-8 text-right font-semibold tabular-nums text-slate-800">{s.count}</span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

const ACTION_WORD: Record<string, string> = { created: 'added', updated: 'edited', deleted: 'deleted' };

export default function Dashboard(p: Props) {
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const quick = [
        { label: 'Add news', href: route('admin.resource.create', 'posts') },
        { label: 'Add article', href: route('admin.resource.create', 'articles') },
        { label: 'Add event', href: route('admin.resource.create', 'events') },
        { label: 'Post a notice', href: route('admin.resource.create', 'notices') },
        { label: 'Upload a document', href: route('admin.resource.create', 'downloads') },
        ...(p.isAdmin ? [{ label: 'Edit pages', href: route('admin.pages') }] : []),
    ];

    return (
        <AdminLayout title="Dashboard" wide>
            {/* Welcome band */}
            <section className="ground-navy relative overflow-hidden px-6 py-7 text-white sm:px-8">
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-crest-300">{today}</p>
                        <h2 className="mt-2 font-serif text-[2.1rem] font-semibold leading-tight !text-white">{greeting()}, {p.firstName}.</h2>
                        <p className="mt-1.5 max-w-xl text-[15px] text-navy-100">
                            {p.isAdmin ? 'Here is what is happening on the school website today.' : 'Post news, articles, events and notices, and keep photos and documents up to date.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {quick.map((q, i) => (
                            <Link key={q.label} href={q.href} className={cn('px-3.5 py-2 text-[13px] font-semibold transition-colors', i === 0 ? 'bg-white text-navy-900 hover:bg-crest-100' : 'border border-white/30 text-white hover:bg-white/10')}>
                                {i === 0 ? '+ ' : ''}{q.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Key figures */}
            <dl className="mt-6 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
                {p.figures.map((f) => (
                    <Link key={f.label} href={f.url} className="group bg-white px-5 py-5 transition-colors hover:bg-slate-50">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{f.label}</dt>
                        <dd className="mt-2 font-serif text-[2.6rem] font-semibold leading-none tabular-nums text-navy-900">{f.value}</dd>
                        <dd className="mt-2 text-[13px] text-slate-500">{f.note}</dd>
                    </Link>
                ))}
            </dl>

            {p.isAdmin && (
                <Panel title="Admission enquiries" action={{ label: 'All enquiries', href: route('admin.enquiries') }} className="mt-6">
                    <div className="grid lg:grid-cols-12">
                        <div className="lg:col-span-7 lg:border-r lg:border-slate-200"><TrendChart trend={p.trend} /></div>
                        <div className="lg:col-span-5 lg:py-3"><Statuses statuses={p.statuses} className="border-t border-slate-200 lg:border-t-0" /></div>
                    </div>
                </Panel>
            )}

            {p.isAdmin && (
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <Panel title="Latest enquiries" action={{ label: 'View all', href: route('admin.enquiries') }}>
                        {p.enquiries.length === 0 ? <Empty>No enquiries yet.</Empty> : (
                            <ul className="divide-y divide-slate-100">
                                {p.enquiries.map((e) => (
                                    <li key={e.id}>
                                        <Link href={route('admin.enquiries', { open: e.id })} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                                            <div className="min-w-0 flex-1">
                                                <p className={cn('truncate text-[14.5px]', e.status === 'New' ? 'font-semibold text-slate-900' : 'text-slate-700')}>{e.student_name}</p>
                                                <p className="truncate text-[12.5px] text-slate-500"><span className="font-mono">{e.reference}</span>{e.class_applying ? ` · ${e.class_applying}` : ''} · {ago(e.created_at)}</p>
                                            </div>
                                            <span className={cn('shrink-0 px-2 py-0.5 text-[11.5px] font-semibold', STATUS_TONE[e.status] ?? 'bg-slate-100 text-slate-600')}>{e.status}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                    <Panel title="Recent messages" action={{ label: 'Inbox', href: route('admin.messages') }}>
                        {p.messages.length === 0 ? <Empty>No messages yet.</Empty> : (
                            <ul className="divide-y divide-slate-100">
                                {p.messages.map((m) => (
                                    <li key={m.id}>
                                        <Link href={route('admin.messages')} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                                            <span aria-hidden className={cn('h-2 w-2 shrink-0 rounded-full', m.read_at ? 'bg-transparent' : 'bg-brass')} />
                                            <div className="min-w-0 flex-1">
                                                <p className={cn('truncate text-[14.5px]', m.read_at ? 'text-slate-700' : 'font-semibold text-slate-900')}>{m.name}</p>
                                                <p className="truncate text-[12.5px] text-slate-500">{m.subject || 'No subject'}</p>
                                            </div>
                                            <span className="shrink-0 text-[12.5px] text-slate-400">{ago(m.created_at)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Panel title="Coming up" action={{ label: 'Events', href: route('admin.resource.index', 'events') }}>
                    {p.events.length === 0 ? <Empty>No upcoming events. <Link href={route('admin.resource.create', 'events')} className="font-medium text-navy-800 underline">Add one</Link></Empty> : (
                        <ul className="divide-y divide-slate-100">
                            {p.events.map((ev) => {
                                const d = new Date(ev.starts_at);
                                return (
                                    <li key={ev.id}>
                                        <Link href={route('admin.resource.edit', ['events', ev.id])} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                                            <span className="flex w-12 shrink-0 flex-col items-center border border-slate-200 py-1 leading-none">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-brass">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
                                                <span className="mt-0.5 font-serif text-xl font-semibold text-navy-900">{d.getDate()}</span>
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-[14.5px] font-medium text-slate-900">{ev.title}</p>
                                                <p className="truncate text-[12.5px] text-slate-500">{d.toLocaleDateString('en-GB', { weekday: 'long' })}{ev.location ? ` · ${ev.location}` : ''}</p>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Panel>
                <Panel title={p.isAdmin ? 'Recent changes' : 'My recent changes'} action={p.isAdmin ? { label: 'Change history', href: route('admin.history') } : undefined}>
                    {p.activity.length === 0 ? <Empty>No changes recorded yet.</Empty> : (
                        <ol className="px-5 py-2">
                            {p.activity.map((a, i) => (
                                <li key={a.id} className="relative flex gap-3 py-2.5">
                                    {i < p.activity.length - 1 && <span aria-hidden className="absolute left-[5px] top-6 h-full w-px bg-slate-200" />}
                                    <span aria-hidden className={cn('relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 bg-white', a.event === 'deleted' ? 'border-slate-400' : a.event === 'created' ? 'border-brass' : 'border-navy-800')} />
                                    <div className="min-w-0 text-sm">
                                        <p className="text-slate-700">
                                            <span className="font-semibold text-slate-900">{a.who}</span> {ACTION_WORD[a.event ?? ''] ?? 'changed'} {a.area ? <span className="text-slate-500">{a.area.toLowerCase()}:</span> : null} <span className="text-slate-900">{a.description}</span>
                                        </p>
                                        <p className="text-[12px] text-slate-400">{ago(a.at)}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </Panel>
            </div>

            {/* Content overview */}
            <section className="mt-10">
                <div className="mb-4 flex items-end justify-between gap-4 border-b border-slate-300 pb-3">
                    <h2 className="font-serif text-2xl font-semibold text-navy-900">Website content</h2>
                    {p.isAdmin && <Link href={route('admin.settings')} className="text-[13px] font-medium text-navy-800 hover:underline">Site settings & text →</Link>}
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {p.groups.map((g) => (
                        <div key={g.group}>
                            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{g.group}</h3>
                            <ul className="divide-y divide-slate-100 border border-slate-200 bg-white">
                                {g.items.map((it) => (
                                    <li key={it.key} className="group flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                                        <Link href={it.url} className="min-w-0 flex-1">
                                            <span className="block truncate text-[14px] font-medium text-slate-800 group-hover:text-navy-900">{it.label}</span>
                                            <span className="block text-[11.5px] text-slate-400">Updated {ago(it.updated).toLowerCase()}</span>
                                        </Link>
                                        <span className="font-serif text-lg font-semibold tabular-nums text-navy-900">{it.count}</span>
                                        <Link href={it.create} aria-label={`Add to ${it.label}`} title="Add new" className="flex h-6 w-6 items-center justify-center border border-slate-200 text-slate-500 opacity-0 transition-opacity hover:border-navy-800 hover:text-navy-900 focus:opacity-100 group-hover:opacity-100">+</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </AdminLayout>
    );
}
