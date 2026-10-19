import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useMedia } from '@/lib/site';
import { confirmDanger } from '@/lib/alerts';
import { cn } from '@/lib/utils';

interface BuiltIn { key: string; label: string; path: string; url: string; title: string | null; banner: string | null; hidden: boolean; manage: { label: string; url: string }[] }
interface Custom { id: number; title: string; slug: string; menu_group: string; image: string | null; active: boolean; url: string }

function Thumb({ src, fallback, home }: { src: string | null; fallback: string | null; home?: boolean }) {
    const media = useMedia();
    const img = media(src) ?? media(fallback);
    return (
        <div className="relative h-16 w-28 shrink-0 overflow-hidden bg-navy-900">
            {img && <img src={img} alt="" className="h-full w-full object-cover opacity-80" />}
            {!src && !home && img && <span className="absolute bottom-0 left-0 bg-navy-950/80 px-1.5 text-[10px] text-white">shared</span>}
            {home && <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold uppercase tracking-wider text-white">Slideshow</span>}
        </div>
    );
}

export default function Pages({ builtIn, sharedBanner, custom }: { builtIn: BuiltIn[]; sharedBanner: string | null; custom: Custom[] }) {
    return (
        <AdminLayout title="Pages" actions={<Link href={route('admin.resource.create', 'pages')} className="btn-primary !py-2">Create a new page</Link>}>
            {builtIn.length > 0 && (
                <section className="mb-12">
                    <h2 className="font-sans text-base font-semibold text-slate-900">Website pages</h2>
                    <p className="mb-4 mt-1 max-w-3xl text-sm text-slate-600">
                        Every page of the website. <span className="font-semibold">Edit page</span> opens its hero (banner title, text and photo), all the wording on the page and its menu entry, in English and Kiswahili.
                    </p>
                    <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
                        {builtIn.map((p) => (
                            <div key={p.key} className="flex flex-wrap items-center gap-4 px-4 py-3">
                                <Thumb src={p.banner} fallback={sharedBanner} home={p.key === 'home'} />
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-900">
                                        {p.label}
                                        {p.hidden && <span className="ml-2 bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-900">Hidden from menu</span>}
                                    </p>
                                    <p className="truncate text-sm text-slate-500">
                                        {p.title && p.title !== p.label ? <>Title: “{p.title}” · </> : null}
                                        <span className="font-mono text-[13px]">{p.path}</span>
                                    </p>
                                    {p.manage.length > 0 && (
                                        <p className="mt-1 flex flex-wrap gap-x-3 text-[13px]">
                                            {p.manage.map((m) => <Link key={m.label} href={m.url} className="text-navy-800 hover:underline">{m.label} →</Link>)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={p.url} target="_blank" rel="noreferrer" className="px-2 text-sm text-slate-600 hover:underline">View ↗</a>
                                    <Link href={route('admin.pages.edit', p.key)} className="btn-outline !px-4 !py-2">Edit page</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="font-sans text-base font-semibold text-slate-900">Your own pages</h2>
                <p className="mb-4 mt-1 max-w-3xl text-sm text-slate-600">Pages you create yourself, such as School fees, Uniform or School rules. They appear in the menu under the group you choose, and in the footer.</p>
                <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
                    {custom.length === 0 && (
                        <div className="px-4 py-10 text-center text-slate-500">
                            No pages yet. <Link href={route('admin.resource.create', 'pages')} className="font-semibold text-navy-800 underline">Create your first page</Link>
                        </div>
                    )}
                    {custom.map((p) => (
                        <div key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                            <Thumb src={p.image} fallback={sharedBanner} />
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900">
                                    {p.title}
                                    {!p.active && <span className="ml-2 bg-slate-200 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Not published</span>}
                                </p>
                                <p className="truncate text-sm text-slate-500">
                                    {p.menu_group === 'Not in the menu' ? 'Not in the menu' : <>Menu: {p.menu_group}</>} · <span className="font-mono text-[13px]">/pages/{p.slug}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {p.active && <a href={p.url} target="_blank" rel="noreferrer" className="px-2 text-sm text-slate-600 hover:underline">View ↗</a>}
                                <Link href={route('admin.resource.edit', ['pages', p.id])} className="btn-outline !px-4 !py-2">Edit page</Link>
                                <button
                                    type="button"
                                    onClick={async () => (await confirmDanger({ title: `Delete “${p.title}”?`, text: 'The page and its photos will be removed from the website and the menu. This cannot be undone.' })) && router.delete(route('admin.resource.destroy', ['pages', p.id]), { preserveScroll: true })}
                                    className={cn('px-2 text-sm text-red-700 hover:underline')}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </AdminLayout>
    );
}
