import { useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Empty, PageBanner, Photo } from '@/Components/site/Parts';
import { useMedia, useSite } from '@/lib/site';
import { cn } from '@/lib/utils';
import type { Staff as StaffT } from '@/types/cms';

const ORDER = ['Leadership', 'Teaching', 'Administration', 'Support'];
const ALL = '__all';

function StaffCard({ s }: { s: StaffT }) {
    const site = useSite();
    const media = useMedia();
    const [open, setOpen] = useState(false);
    const long = (s.bio ?? '').length > 220;

    return (
        <article className="group">
            <div className="relative overflow-hidden">
                <Photo src={media(s.photo)} initials={s.name} ratio="aspect-[4/5]" alt={s.name} className="transition-transform duration-700 group-hover:scale-[1.03]" />
                {s.academic_department && (
                    <span className="absolute bottom-0 left-0 bg-navy-900/90 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-crest-200">
                        {s.academic_department}
                    </span>
                )}
            </div>
            <h3 className="mt-5 text-[1.5rem] leading-tight">{s.name}</h3>
            <p className="mt-1 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-crest-700">{s.position}</p>

            {(s.subjects || s.class_assigned) && (
                <dl className="mt-4 space-y-1.5 border-t border-rule pt-4 text-[14.5px]">
                    {s.subjects && (
                        <div className="flex gap-2">
                            <dt className="shrink-0 font-semibold text-navy-900">{site.staff_subjects_label}:</dt>
                            <dd className="text-slate-600">{s.subjects}</dd>
                        </div>
                    )}
                    {s.class_assigned && (
                        <div className="flex gap-2">
                            <dt className="shrink-0 font-semibold text-navy-900">{site.staff_class_label}:</dt>
                            <dd className="text-slate-600">{s.class_assigned}</dd>
                        </div>
                    )}
                </dl>
            )}

            {s.bio && (
                <div className="mt-3">
                    <p className={cn('whitespace-pre-line text-[15px] leading-relaxed text-slate-600', long && !open && 'line-clamp-4')}>{s.bio}</p>
                    {long && (
                        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="mt-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-navy-900 hover:text-crest-700">
                            {open ? site.staff_less : site.staff_more}
                        </button>
                    )}
                </div>
            )}
        </article>
    );
}

export default function Staff({ staff }: { staff: StaffT[] }) {
    const site = useSite();
    const departments = Array.from(new Set(staff.map((s) => s.academic_department?.trim()).filter((d): d is string => !!d))).sort();
    const [dept, setDept] = useState(ALL);
    const shown = staff.filter((s) => dept === ALL || s.academic_department?.trim() === dept);
    const groups = ORDER.map((g) => ({ name: g, people: shown.filter((s) => s.department === g) })).filter((g) => g.people.length);

    return (
        <SiteLayout title={site.staff_title ?? ''}>
            <PageBanner title={site.staff_title ?? ''} crumb={site.nav_staff ?? ''} intro={site.staff_intro} page="staff" />

            <div className="py-16 sm:py-20">
                <div className="container-site">
                    {departments.length > 1 && (
                        <div className="mb-14 flex flex-wrap justify-center gap-2" role="group" aria-label={site.staff_all ?? undefined}>
                            {[ALL, ...departments].map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setDept(d)}
                                    aria-pressed={d === dept}
                                    className={cn(
                                        'border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors',
                                        d === dept ? 'border-navy-900 bg-navy-900 text-white' : 'border-rule bg-white text-slate-600 hover:border-navy-900 hover:text-navy-900',
                                    )}
                                >
                                    {d === ALL ? site.staff_all : d}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="space-y-20">
                        {groups.length === 0 && <Empty>{site.staff_empty}</Empty>}
                        {groups.map((g) => (
                            <section key={g.name} aria-labelledby={`g-${g.name}`}>
                                <h2 id={`g-${g.name}`} className="mb-10 flex items-center gap-6 text-[2.2rem]">
                                    {site[`staff_group_${g.name.toLowerCase()}`]}
                                    <span aria-hidden className="h-px flex-1 bg-rule" />
                                    <span className="font-sans text-[11.5px] font-semibold uppercase tracking-[0.2em] text-slate-400">{g.people.length}</span>
                                </h2>
                                <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group data-reveal-step="110">
                                    {g.people.map((s) => <StaffCard key={`${dept}-${s.id}`} s={s} />)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
